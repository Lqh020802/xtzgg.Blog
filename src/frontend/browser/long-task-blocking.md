---
title: 长任务与页面卡死机制
icon: mdi:clock-alert
category:
  - 浏览器原理
tag:
  - 浏览器
  - 长任务
  - 性能优化
  - JavaScript
  - 事件循环
---

# 长任务与页面卡死机制

## 1. 问题背景

在前端开发中，我们经常遇到这样的困惑：**为什么同样是长任务，有的时候会造成页面卡死，有的时候却没有影响？**

这个问题的核心在于理解 JavaScript 的**单线程执行机制**和**任务阻塞时间**。

## 2. 卡死的根本原因

### JavaScript 单线程特性

```javascript
// 浏览器主线程负责的任务
const mainThreadTasks = [
  'JavaScript 执行',
  'DOM 操作',
  'CSS 样式计算', 
  '页面渲染',
  '事件处理',
  '用户交互响应'
];
```

当长任务执行时：
1. **主线程被独占** - 其他任务无法执行
2. **渲染被阻断** - 页面停止更新
3. **交互失效** - 用户操作无响应

### 卡死的临界点

```javascript
// 50ms 是关键阈值（W3C 标准）
console.time('长任务检测');

function heavyTask() {
  let result = 0;
  for (let i = 0; i < 10000000; i++) {
    result += Math.sqrt(i);
  }
  return result;
}

heavyTask();
console.timeEnd('长任务检测'); 
// 如果 > 50ms，用户会感知到明显卡顿
```

## 3. 为什么有时没影响？

### 1. 任务实际执行时间短

```javascript
// 看似复杂，实际很快
function quickTask() {
  let sum = 0;
  for (let i = 0; i < 100000; i++) {
    sum += i; // 简单运算，总耗时 < 50ms
  }
  return sum;
}

// 执行快速，用户无感知
quickTask();
```

### 2. 使用了后台线程

```javascript
// 主线程：创建 Worker
const worker = new Worker('heavy-calculation.js');
worker.postMessage({ numbers: [1, 2, 3, ...largeArray] });

worker.onmessage = function(e) {
  console.log('计算结果：', e.data);
  // 主线程始终可以响应用户操作
};

// heavy-calculation.js（后台线程）
self.onmessage = function(e) {
  const numbers = e.data.numbers;
  let result = 0;
  
  // 即使这里执行 10 秒，主线程也不会卡死
  for (let i = 0; i < numbers.length; i++) {
    result += complexCalculation(numbers[i]);
  }
  
  self.postMessage(result);
};
```

## 4. 解决方案

### 1. 时间切片（Time Slicing）

```javascript
class TaskScheduler {
  constructor() {
    this.tasks = [];
    this.isRunning = false;
  }
  
  // 添加任务到队列
  addTask(task) {
    this.tasks.push(task);
    if (!this.isRunning) {
      this.runTasks();
    }
  }
  
  // 分片执行任务
  runTasks() {
    this.isRunning = true;
    const startTime = performance.now();
    
    while (this.tasks.length > 0 && (performance.now() - startTime) < 5) {
      const task = this.tasks.shift();
      task();
    }
    
    if (this.tasks.length > 0) {
      // 让出主线程，下一帧继续执行
      requestAnimationFrame(() => this.runTasks());
    } else {
      this.isRunning = false;
    }
  }
}

// 使用示例
const scheduler = new TaskScheduler();

// 将大任务拆分成小任务
function processLargeArray(array) {
  const chunkSize = 1000;
  
  for (let i = 0; i < array.length; i += chunkSize) {
    scheduler.addTask(() => {
      const chunk = array.slice(i, i + chunkSize);
      chunk.forEach(item => processItem(item));
    });
  }
}
```

### 2. requestIdleCallback 优化

```javascript
function processDataWhenIdle(data) {
  const chunks = chunkArray(data, 100);
  let currentIndex = 0;
  
  function processNextChunk(deadline) {
    // 在浏览器空闲时处理数据
    while (deadline.timeRemaining() > 0 && currentIndex < chunks.length) {
      processChunk(chunks[currentIndex]);
      currentIndex++;
    }
    
    if (currentIndex < chunks.length) {
      requestIdleCallback(processNextChunk);
    }
  }
  
  requestIdleCallback(processNextChunk);
}

function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}
```

### 3. Web Worker 处理复杂计算

```javascript
// main.js
class WorkerPool {
  constructor(workerScript, poolSize = 4) {
    this.workers = [];
    this.taskQueue = [];
    this.busyWorkers = new Set();
    
    // 创建工作线程池
    for (let i = 0; i < poolSize; i++) {
      const worker = new Worker(workerScript);
      worker.onmessage = (e) => this.handleWorkerMessage(worker, e);
      this.workers.push(worker);
    }
  }
  
  // 提交任务
  submitTask(data) {
    return new Promise((resolve, reject) => {
      const task = { data, resolve, reject };
      
      const availableWorker = this.workers.find(w => !this.busyWorkers.has(w));
      if (availableWorker) {
        this.executeTask(availableWorker, task);
      } else {
        this.taskQueue.push(task);
      }
    });
  }
  
  executeTask(worker, task) {
    this.busyWorkers.add(worker);
    worker.currentTask = task;
    worker.postMessage(task.data);
  }
  
  handleWorkerMessage(worker, e) {
    const task = worker.currentTask;
    task.resolve(e.data);
    
    this.busyWorkers.delete(worker);
    
    // 处理队列中的下一个任务
    if (this.taskQueue.length > 0) {
      const nextTask = this.taskQueue.shift();
      this.executeTask(worker, nextTask);
    }
  }
}

// 使用示例
const workerPool = new WorkerPool('calculation-worker.js');

async function processLargeDataset(dataset) {
  const chunks = chunkArray(dataset, 1000);
  const promises = chunks.map(chunk => workerPool.submitTask(chunk));
  
  try {
    const results = await Promise.all(promises);
    return results.flat();
  } catch (error) {
    console.error('处理失败：', error);
  }
}
```

### 4. 渐进式渲染

```javascript
class ProgressiveRenderer {
  constructor(container, data, renderItem) {
    this.container = container;
    this.data = data;
    this.renderItem = renderItem;
    this.batchSize = 50;
    this.currentIndex = 0;
  }
  
  start() {
    this.renderBatch();
  }
  
  renderBatch() {
    const fragment = document.createDocumentFragment();
    const endIndex = Math.min(
      this.currentIndex + this.batchSize, 
      this.data.length
    );
    
    for (let i = this.currentIndex; i < endIndex; i++) {
      const element = this.renderItem(this.data[i]);
      fragment.appendChild(element);
    }
    
    this.container.appendChild(fragment);
    this.currentIndex = endIndex;
    
    // 显示进度
    this.updateProgress();
    
    if (this.currentIndex < this.data.length) {
      // 下一帧继续渲染
      requestAnimationFrame(() => this.renderBatch());
    } else {
      this.onComplete();
    }
  }
  
  updateProgress() {
    const progress = (this.currentIndex / this.data.length) * 100;
    console.log(`渲染进度: ${progress.toFixed(1)}%`);
  }
  
  onComplete() {
    console.log('渲染完成！');
  }
}

// 使用示例
const renderer = new ProgressiveRenderer(
  document.getElementById('list'),
  largeDataArray,
  (item) => {
    const div = document.createElement('div');
    div.textContent = item.name;
    return div;
  }
);

renderer.start();
```

## 5. 性能监控

### 长任务检测

```javascript
class PerformanceMonitor {
  constructor() {
    this.observer = null;
    this.longTasks = [];
  }
  
  start() {
    if ('PerformanceObserver' in window) {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            this.longTasks.push({
              name: entry.name,
              duration: entry.duration,
              startTime: entry.startTime
            });
            
            console.warn(`检测到长任务: ${entry.duration}ms`);
          }
        }
      });
      
      this.observer.observe({ entryTypes: ['longtask'] });
    }
  }
  
  stop() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
  
  getReport() {
    return {
      totalLongTasks: this.longTasks.length,
      averageDuration: this.longTasks.reduce((sum, task) => sum + task.duration, 0) / this.longTasks.length,
      tasks: this.longTasks
    };
  }
}

// 使用监控
const monitor = new PerformanceMonitor();
monitor.start();

// 在需要时查看报告
setTimeout(() => {
  console.log('性能报告：', monitor.getReport());
}, 10000);
```

## 6. 最佳实践

### 1. 任务优先级管理

```javascript
const TaskPriority = {
  IMMEDIATE: 1,    // 用户交互
  HIGH: 2,         // 关键渲染
  NORMAL: 3,       // 一般任务
  LOW: 4           // 后台任务
};

class PriorityScheduler {
  constructor() {
    this.queues = {
      [TaskPriority.IMMEDIATE]: [],
      [TaskPriority.HIGH]: [],
      [TaskPriority.NORMAL]: [],
      [TaskPriority.LOW]: []
    };
  }
  
  schedule(task, priority = TaskPriority.NORMAL) {
    this.queues[priority].push(task);
    this.flush();
  }
  
  flush() {
    // 优先执行高优先级任务
    for (let priority = 1; priority <= 4; priority++) {
      const queue = this.queues[priority];
      if (queue.length > 0) {
        const task = queue.shift();
        task();
        break;
      }
    }
    
    if (this.hasMoreTasks()) {
      requestAnimationFrame(() => this.flush());
    }
  }
  
  hasMoreTasks() {
    return Object.values(this.queues).some(queue => queue.length > 0);
  }
}
```

### 2. 内存优化

```javascript
// 避免内存泄漏的大数据处理
function processLargeDataSafely(data) {
  const CHUNK_SIZE = 1000;
  let processed = 0;
  
  function processChunk() {
    const chunk = data.slice(processed, processed + CHUNK_SIZE);
    
    // 处理数据块
    chunk.forEach(item => {
      // 处理逻辑...
    });
    
    processed += CHUNK_SIZE;
    
    // 清理引用，帮助垃圾回收
    chunk.length = 0;
    
    if (processed < data.length) {
      setTimeout(processChunk, 0);
    } else {
      console.log('处理完成');
    }
  }
  
  processChunk();
}
```

## 7. 总结

| 情况 | 是否卡死 | 原因 | 解决方案 |
|------|----------|------|----------|
| 主线程长任务 > 50ms | ✅ 是 | 阻塞渲染和交互 | 时间切片、Worker |
| 主线程短任务 < 50ms | ❌ 否 | 用户无感知 | 无需处理 |
| Web Worker 执行 | ❌ 否 | 不占用主线程 | 继续使用 |
| 异步任务 | ❌ 否 | 非阻塞执行 | 推荐方式 |

**核心原则：**
- 保持主线程响应性
- 合理拆分长任务
- 利用浏览器空闲时间
- 监控和优化性能

通过理解这些机制和应用相应的解决方案，我们可以构建更流畅、响应更快的前端应用。

## 8. 常见问题 FAQ

### Q1: 为什么 setTimeout(fn, 0) 不能立即执行？

**A:** `setTimeout(fn, 0)` 的作用是将任务放到下一个事件循环中执行，让出当前的主线程。即使延时为 0，浏览器也有最小延时限制（通常是 4ms）。

```javascript
console.log('1');
setTimeout(() => console.log('2'), 0);
console.log('3');
// 输出顺序: 1 -> 3 -> 2
```

### Q2: requestAnimationFrame 和 setTimeout 在性能优化上有什么区别？

**A:** 
- `requestAnimationFrame` 与浏览器刷新率同步（通常 60fps），更适合动画和渲染相关任务
- `setTimeout` 有最小延时限制，可能造成不必要的性能损耗

```javascript
// 推荐用于渲染相关任务
requestAnimationFrame(() => {
  // 更新 DOM、动画等
});

// 适用于一般的异步任务
setTimeout(() => {
  // 数据处理、网络请求等
}, 0);
```

### Q3: Web Worker 有哪些限制？

**A:** 
- 无法直接操作 DOM
- 无法访问 window 对象
- 无法访问父页面的变量和函数
- 通信只能通过 postMessage
- 有一定的创建和通信开销

### Q4: 如何判断一个任务是否为长任务？

**A:** 
```javascript
// 方法1: 手动计时
function measureTask(taskFn) {
  const start = performance.now();
  taskFn();
  const duration = performance.now() - start;
  
  if (duration > 50) {
    console.warn(`长任务检测: ${duration}ms`);
  }
}

// 方法2: 使用 Performance Observer
const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach(entry => {
    if (entry.duration > 50) {
      console.warn(`长任务: ${entry.duration}ms`);
    }
  });
});
observer.observe({ entryTypes: ['longtask'] });
```

### Q5: React 的 Concurrent Mode 是如何解决长任务问题的？

**A:** React 18 的并发特性通过以下方式优化：

```javascript
// 时间切片 - React 内部实现类似逻辑
function workLoop(deadline) {
  while (workInProgress && deadline.timeRemaining() > 0) {
    workInProgress = performUnitOfWork(workInProgress);
  }
  
  if (workInProgress) {
    // 还有工作未完成，让出主线程
    scheduleCallback(workLoop);
  }
}
```

## 9. 面试题精选

### 基础题

**1. 解释什么是 JavaScript 的单线程模型，以及它如何影响页面性能？**

<details>
<summary>点击查看答案</summary>

JavaScript 采用单线程模型，意味着：
- 只有一个主线程执行 JS 代码
- 主线程还负责 DOM 操作、样式计算、页面渲染
- 长时间运行的任务会阻塞整个主线程
- 导致页面无法响应用户交互，出现"卡死"现象

**影响：**
- 用户交互延迟
- 动画卡顿
- 页面渲染停止
- 影响用户体验

</details>

**2. 什么是事件循环（Event Loop）？它与长任务有什么关系？**

<details>
<summary>点击查看答案</summary>

事件循环是 JavaScript 运行时的核心机制：

```
┌───────────────────────────┐
┌─>│           timers          │  ← setTimeout, setInterval
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks     │  ← I/O callbacks
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare       │  ← 内部使用
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           poll            │  ← 获取新的I/O事件
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           check           │  ← setImmediate
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
└──┤      close callbacks      │  ← socket.on('close')
   └───────────────────────────┘
```

**与长任务的关系：**
- 长任务会阻塞事件循环的执行
- 其他任务必须等待长任务完成
- 影响整个应用的响应性

</details>

### 进阶题

**3. 请实现一个函数，将大数组的处理拆分成小任务，避免阻塞主线程。**

<details>
<summary>点击查看答案</summary>

```javascript
function processLargeArray(array, processor, chunkSize = 1000) {
  return new Promise((resolve) => {
    let index = 0;
    const results = [];
    
    function processChunk() {
      const start = index;
      const end = Math.min(index + chunkSize, array.length);
      
      // 处理当前块
      for (let i = start; i < end; i++) {
        results[i] = processor(array[i], i);
      }
      
      index = end;
      
      if (index < array.length) {
        // 使用 MessageChannel 实现真正的异步
        const channel = new MessageChannel();
        channel.port2.onmessage = () => processChunk();
        channel.port1.postMessage(null);
      } else {
        resolve(results);
      }
    }
    
    processChunk();
  });
}

// 使用示例
const largeArray = new Array(100000).fill(0).map((_, i) => i);

processLargeArray(largeArray, x => x * 2, 5000)
  .then(results => {
    console.log('处理完成', results.length);
  });
```

</details>

**4. 如何设计一个任务调度器，支持任务优先级和时间切片？**

<details>
<summary>点击查看答案</summary>

```javascript
class TaskScheduler {
  constructor() {
    this.tasks = new Map(); // 优先级 -> 任务队列
    this.isRunning = false;
    this.frameDeadline = 0;
    
    // 初始化优先级队列
    for (let i = 1; i <= 5; i++) {
      this.tasks.set(i, []);
    }
  }
  
  // 添加任务
  schedule(task, priority = 3) {
    this.tasks.get(priority).push(task);
    
    if (!this.isRunning) {
      this.startWorkLoop();
    }
  }
  
  // 开始工作循环
  startWorkLoop() {
    this.isRunning = true;
    this.scheduleWork();
  }
  
  // 调度工作
  scheduleWork() {
    requestAnimationFrame((frameStart) => {
      // 每帧预留 5ms 给浏览器
      this.frameDeadline = frameStart + 11; // 16.67ms - 5ms
      this.performWork();
    });
  }
  
  // 执行工作
  performWork() {
    while (this.shouldYield() === false && this.hasWork()) {
      const task = this.getNextTask();
      if (task) {
        task();
      }
    }
    
    if (this.hasWork()) {
      // 还有任务，继续下一帧
      this.scheduleWork();
    } else {
      this.isRunning = false;
    }
  }
  
  // 是否应该让出控制权
  shouldYield() {
    return performance.now() >= this.frameDeadline;
  }
  
  // 获取下一个任务（按优先级）
  getNextTask() {
    for (let priority = 1; priority <= 5; priority++) {
      const queue = this.tasks.get(priority);
      if (queue.length > 0) {
        return queue.shift();
      }
    }
    return null;
  }
  
  // 是否还有任务
  hasWork() {
    for (let queue of this.tasks.values()) {
      if (queue.length > 0) return true;
    }
    return false;
  }
}

// 使用示例
const scheduler = new TaskScheduler();

// 高优先级任务（用户交互）
scheduler.schedule(() => {
  console.log('处理用户点击');
}, 1);

// 普通优先级任务（数据处理）
scheduler.schedule(() => {
  console.log('处理业务逻辑');
}, 3);

// 低优先级任务（后台任务）
scheduler.schedule(() => {
  console.log('后台数据同步');
}, 5);
```

</details>

### 高级题

**5. 在什么情况下应该使用 Web Worker，什么情况下使用时间切片？请给出具体的判断标准。**

<details>
<summary>点击查看答案</summary>

**使用 Web Worker 的场景：**
- 纯计算任务（数学运算、数据处理）
- 不需要 DOM 操作
- 任务执行时间 > 100ms
- 可以并行处理的任务
- 需要避免阻塞主线程的关键任务

```javascript
// 适合 Web Worker：大数据排序
const worker = new Worker('sort-worker.js');
worker.postMessage({ data: largeArray });
```

**使用时间切片的场景：**
- 需要 DOM 操作的任务
- 渐进式渲染
- 任务之间有依赖关系
- 需要访问主线程的 API
- 任务可以被中断和恢复

```javascript
// 适合时间切片：DOM 渲染
function renderList(items) {
  const batchSize = 50;
  let index = 0;
  
  function renderBatch() {
    const end = Math.min(index + batchSize, items.length);
    
    for (let i = index; i < end; i++) {
      const element = createListItem(items[i]);
      container.appendChild(element);
    }
    
    index = end;
    
    if (index < items.length) {
      requestAnimationFrame(renderBatch);
    }
  }
  
  renderBatch();
}
```

**判断标准：**
1. **是否需要 DOM 操作** → 需要则用时间切片
2. **任务复杂度** → 高复杂度用 Worker
3. **数据传输成本** → 大数据传输成本高，考虑时间切片
4. **并行性需求** → 需要并行则用 Worker
5. **中断恢复需求** → 需要则用时间切片

</details>

**6. 请分析以下代码的性能问题，并提供优化方案：**

```javascript
function processUserData(users) {
  const results = [];
  
  users.forEach(user => {
    // 复杂的数据处理
    const processed = {
      id: user.id,
      name: user.name.toUpperCase(),
      avatar: generateAvatar(user), // 耗时操作
      stats: calculateStats(user),   // 耗时操作
      recommendations: getRecommendations(user) // 耗时操作
    };
    
    // 立即更新 DOM
    const element = document.createElement('div');
    element.innerHTML = `
      <img src="${processed.avatar}">
      <h3>${processed.name}</h3>
      <p>Stats: ${processed.stats}</p>
    `;
    document.body.appendChild(element);
    
    results.push(processed);
  });
  
  return results;
}
```

<details>
<summary>点击查看答案</summary>

**性能问题分析：**
1. 同步处理大量数据，阻塞主线程
2. 每次循环都操作 DOM，引起重排重绘
3. 耗时操作在主线程执行
4. 没有批量处理和优化

**优化方案：**

```javascript
// 方案1: 时间切片 + 批量 DOM 操作
async function processUserDataOptimized(users) {
  const results = [];
  const fragment = document.createDocumentFragment();
  const batchSize = 50;
  
  for (let i = 0; i < users.length; i += batchSize) {
    const batch = users.slice(i, i + batchSize);
    
    // 处理当前批次
    const batchResults = await processBatch(batch);
    results.push(...batchResults);
    
    // 批量更新 DOM
    batchResults.forEach(processed => {
      const element = createUserElement(processed);
      fragment.appendChild(element);
    });
    
    // 一次性添加到 DOM
    document.body.appendChild(fragment);
    
    // 让出主线程
    await new Promise(resolve => setTimeout(resolve, 0));
  }
  
  return results;
}

// 方案2: Web Worker + 虚拟滚动
class UserListRenderer {
  constructor(container) {
    this.container = container;
    this.worker = new Worker('user-processor.js');
    this.virtualList = new VirtualList(container);
  }
  
  async processUsers(users) {
    // 在 Worker 中处理数据
    const processed = await new Promise(resolve => {
      this.worker.postMessage({ users });
      this.worker.onmessage = e => resolve(e.data);
    });
    
    // 使用虚拟滚动渲染
    this.virtualList.setData(processed);
  }
}

// user-processor.js (Web Worker)
self.onmessage = function(e) {
  const { users } = e.data;
  const results = [];
  
  users.forEach(user => {
    const processed = {
      id: user.id,
      name: user.name.toUpperCase(),
      avatar: generateAvatar(user),
      stats: calculateStats(user),
      recommendations: getRecommendations(user)
    };
    results.push(processed);
  });
  
  self.postMessage(results);
};
```

**关键优化点：**
- 使用时间切片避免长任务阻塞
- 批量 DOM 操作减少重排重绘
- Web Worker 处理计算密集型任务
- 虚拟滚动优化大列表渲染
- 合理的任务拆分和调度

</details>

## 10. 相关资源

- [MDN - Web Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)
- [Google - Long Tasks API](https://developer.chrome.com/docs/web-platform/long-tasks-api/)
- [React Concurrent Features](https://react.dev/blog/2022/03/29/react-v18#what-is-concurrent-react)
- [Performance Observer API](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver)
