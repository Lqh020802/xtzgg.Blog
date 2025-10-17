---
title: 垃圾回收机制
icon: logos:javascript
---

# 垃圾回收机制

## 1. 什么是垃圾回收机制

**JavaScript 的垃圾回收机制（Garbage Collection, GC）** 是自动管理内存的机制：浏览器或 JavaScript 引擎定期找出**"不再被引用的对象"**，释放其占用的内存，避免内存泄漏。

**其核心逻辑是"识别无用数据并回收内存"**，无需开发者手动操作（区别于 C/C++ 等手动管理内存的语言）。

### 1.1 为什么需要垃圾回收

```javascript
// 没有垃圾回收的问题
function createData() {
  const largeArray = new Array(1000000).fill('data'); // 分配大量内存
  // 函数执行完后，如果不回收内存，会导致内存泄漏
  return largeArray;
}

for (let i = 0; i < 1000; i++) {
  createData(); // 每次调用都分配内存
}
// 如果没有垃圾回收，内存会持续增长，最终耗尽
```

### 1.2 垃圾回收的好处

- ✅ **自动化：** 开发者无需手动管理内存
- ✅ **安全：** 避免野指针、内存泄漏等问题
- ✅ **高效：** 引擎优化的回收策略，性能更好
- ✅ **专注业务：** 开发者可以专注于业务逻辑

### 1.3 什么是"垃圾"

**"垃圾"是指不再被引用的对象，无法通过任何途径访问到的数据。**

```javascript
let obj = { name: 'test' };
// obj 被引用，不是垃圾

obj = null;
// 原对象不再被引用，成为垃圾，等待回收
```

## 2. 常见的垃圾回收算法

JavaScript 引擎（如 V8）主要采用以下算法，结合场景优化内存回收效率：

### 2.1 标记-清除算法（Mark-and-Sweep，最常用）

**这是现代 JavaScript 引擎的基础算法。**

#### 核心步骤

```
第一阶段：标记（Mark）
├─ 从根对象（window、global、调用栈）出发
├─ 遍历所有可访问的对象
└─ 标记为"活跃对象"（被引用）

第二阶段：清除（Sweep）
├─ 遍历堆内存中所有对象
├─ 清除未被标记的对象（垃圾）
├─ 释放其内存
└─ 将内存加入空闲列表
```

#### 可视化示例

```javascript
// 初始状态
const obj1 = { name: 'A' };      // 被引用 → 活跃
const obj2 = { name: 'B' };      // 被引用 → 活跃
let obj3 = { name: 'C' };        // 被引用 → 活跃

// 解除引用
obj3 = null;                      // C 不再被引用 → 垃圾

// GC 标记阶段
// 从根对象（window、调用栈）出发
// obj1 ✓ 标记为活跃
// obj2 ✓ 标记为活跃
// obj3 指向的对象 ✗ 未标记（无引用）

// GC 清除阶段
// C 对象被回收，内存释放
```

#### 详细示例

```javascript
let obj = { name: 'test' };
// 步骤 1：obj 引用对象 → 对象被标记为活跃

obj = null;
// 步骤 2：解除引用 → 对象不再活跃

// 步骤 3：下次 GC 时
// - 标记阶段：对象未被标记（无引用）
// - 清除阶段：对象被回收，内存释放
```

#### 优缺点

**优点：**
- ✅ 实现简单
- ✅ 适用于大多数场景
- ✅ 能解决循环引用问题

**缺点：**
- ❌ 清除后会产生**内存碎片**（空闲内存分散）
- ❌ 可能导致后续大对象无法分配连续内存
- ❌ 需要暂停程序执行（Stop-the-World）

```javascript
// 内存碎片问题示意
// 内存状态：[已用][空闲][已用][空闲][已用]
// 即使总空闲内存足够，但不连续，无法分配大对象
```

### 2.2 引用计数算法（Reference Counting，早期算法）

**通过记录对象被引用的"次数"判断是否为垃圾。**

#### 核心逻辑

```
当对象被引用时 → 计数 +1
当引用解除时 → 计数 -1
当计数为 0 时 → 对象被视为垃圾，立即回收
```

#### 示例

```javascript
let obj1 = { name: 'A' };  // 引用计数：1
let obj2 = obj1;            // 引用计数：2（obj1 和 obj2 都引用）

obj1 = null;                // 引用计数：1（只剩 obj2 引用）
obj2 = null;                // 引用计数：0 → 对象被回收
```

#### 循环引用问题

```javascript
function createCycle() {
  const obj1 = {};
  const obj2 = {};
  
  obj1.ref = obj2; // obj1 引用 obj2
  obj2.ref = obj1; // obj2 引用 obj1（循环引用）
}

createCycle();

// 函数执行后：
// obj1 和 obj2 互相引用，引用计数都不为 0
// 但外部已无法访问这两个对象
// 引用计数算法无法回收 → 内存泄漏 ❌
```

#### 优缺点

**优点：**
- ✅ 实现简单
- ✅ 回收及时（计数为 0 立即回收）
- ✅ 不需要暂停程序

**缺点：**
- ❌ **无法解决循环引用**（致命缺陷）
- ❌ 需要额外空间存储计数
- ❌ 频繁更新计数影响性能

**现代 JavaScript 引擎（如 V8）已不再单独使用此算法，仅作为辅助优化。**

### 2.3 标记-整理算法（Mark-Compact）

**在标记-清除的基础上，增加"整理"步骤，解决内存碎片问题。**

#### 核心步骤

```
第一阶段：标记（Mark）
├─ 与标记-清除相同
└─ 标记所有活跃对象

第二阶段：整理（Compact）
├─ 将所有活跃对象移动到内存一端
├─ 清除边界外的内存
└─ 解决内存碎片问题
```

#### 可视化

```
整理前：[A][空][B][空][C][空][空]
         ↓
整理后：[A][B][C][空][空][空][空]
        ↑连续的活跃对象  ↑连续的空闲空间
```

#### 优缺点

**优点：**
- ✅ 解决内存碎片问题
- ✅ 空闲内存连续，方便分配大对象

**缺点：**
- ❌ 需要移动对象，成本较高
- ❌ 更新所有对象引用

## 3. V8 引擎的优化：分代回收

**V8 引擎（Chrome、Node.js 等使用）基于"大部分对象存活时间短"的特性，将内存分为两代，针对性优化回收效率。**

### 3.1 分代策略

```
JavaScript 堆内存
├── 新生代（Young Generation）
│   ├── 存储短期对象（临时变量、函数局部变量）
│   ├── 空间小（1-8MB）
│   ├── 回收频繁（Scavenge 算法）
│   └── 回收速度快
│
└── 老生代（Old Generation）
    ├── 存储长期对象（全局变量、闭包）
    ├── 空间大（几百MB）
    ├── 回收较少（标记-清除 + 标记-整理）
    └── 回收速度慢
```

### 3.2 新生代回收（Scavenge 算法）

#### 核心机制

```
新生代内存
├── From 空间（活跃区）
└── To 空间（空闲区）

回收过程：
1. 将 From 空间中的活跃对象复制到 To 空间
2. 清空 From 空间
3. From 和 To 空间互换角色
4. 完成回收
```

#### 示例

```javascript
function test() {
  const temp = { data: 'temporary' };
  // temp 是临时变量，存储在新生代
  console.log(temp);
  // 函数执行完后，temp 很快被回收
}

test();
// temp 对象在新生代中经过 1-2 次回收后被清理
```

#### 特点

- ✅ **速度极快：** 复制算法，效率高
- ❌ **空间利用率低：** 只使用 50% 空间（From 和 To 互换）
- ✅ **适合短期对象：** 大部分对象生命周期短

### 3.3 老生代回收

#### 使用算法

```
老生代回收
├── 主要：标记-清除（Mark-Sweep）
│   └── 处理大部分回收
│
└── 辅助：标记-整理（Mark-Compact）
    └── 当空间碎片过多时触发
```

#### 示例

```javascript
// 全局变量，存储在老生代
const globalCache = {
  data: new Array(10000).fill('cache')
};

// 闭包持有的变量，存储在老生代
function createCounter() {
  let count = 0; // count 被闭包持有，存储在老生代
  return function() {
    return ++count;
  };
}

const counter = createCounter();
```

### 3.4 晋升机制

**新生代对象经过多次回收仍存活，会被"晋升"到老生代（认为其生命周期长）。**

#### 晋升条件

```
1. 对象在新生代中经历过一次 Scavenge 回收
2. To 空间使用率超过 25%
```

#### 示例

```javascript
// 第一次 GC
const obj = { name: 'test' };
// obj 在新生代，经历第一次 Scavenge

// 第二次 GC
// obj 仍然存活，被晋升到老生代

// 后续 GC
// obj 在老生代，使用标记-清除算法
```

### 3.5 完整流程

```javascript
// 1. 创建对象（新生代）
function createData() {
  const temp = { data: 'temp' }; // 新生代
  globalObj.ref = temp;          // temp 被全局引用
}

createData();

// 2. 第一次 GC（新生代 Scavenge）
// temp 仍被 globalObj 引用，复制到 To 空间

// 3. 第二次 GC（晋升到老生代）
// temp 再次存活，晋升到老生代

// 4. 后续 GC（老生代 Mark-Sweep）
// temp 在老生代中，使用标记-清除算法

// 5. 解除引用
globalObj.ref = null;

// 6. 下次老生代 GC
// temp 被标记为垃圾，回收内存
```

## 4. 增量标记（Incremental Marking）

**为了避免长时间的 GC 暂停（Stop-the-World），V8 引入增量标记。**

### 4.1 核心思想

```
传统标记：
├── 一次性完成标记
└── 长时间暂停程序（几百毫秒）

增量标记：
├── 将标记分成多个小步骤
├── 每个步骤只标记一部分对象
├── 步骤之间程序可以继续执行
└── 减少每次暂停时间（几毫秒）
```

### 4.2 三色标记法

```javascript
// 白色：未访问的对象（可能是垃圾）
// 灰色：已访问但其引用的对象未访问
// 黑色：已访问且其引用的对象也已访问

// 标记过程
// 初始：所有对象都是白色
// 步骤 1：将根对象标记为灰色
// 步骤 2：遍历灰色对象，将其标记为黑色，其引用标记为灰色
// 步骤 3：重复步骤 2，直到没有灰色对象
// 结果：黑色对象是活跃的，白色对象是垃圾
```

## 5. 内存泄漏

### 5.1 什么是内存泄漏

**内存泄漏是指不再使用的内存没有被及时释放，导致内存占用持续增长。**

### 5.2 常见的内存泄漏场景

#### 1. 全局变量

```javascript
// ❌ 意外的全局变量
function foo() {
  bar = 'global variable'; // 忘记声明，成为全局变量
}
foo();
// bar 永远不会被回收

// ✅ 正确做法
function foo() {
  const bar = 'local variable'; // 使用 const/let 声明
}
```

#### 2. 被遗忘的定时器

```javascript
// ❌ 未清除的定时器
const timer = setInterval(() => {
  const data = fetchData(); // 持续创建对象
  console.log(data);
}, 1000);
// timer 一直运行，内存持续增长

// ✅ 正确做法
const timer = setInterval(() => {
  const data = fetchData();
  console.log(data);
}, 1000);

// 不需要时清除
clearInterval(timer);
```

#### 3. 闭包

```javascript
// ❌ 闭包导致的内存泄漏
function createLeak() {
  const largeData = new Array(1000000).fill('data');
  
  return function() {
    console.log(largeData[0]); // 闭包持有 largeData
  };
}

const leak = createLeak();
// largeData 一直被闭包持有，无法回收

// ✅ 正确做法
function createNoLeak() {
  const largeData = new Array(1000000).fill('data');
  const firstItem = largeData[0]; // 只保存需要的数据
  
  return function() {
    console.log(firstItem);
  };
}
```

#### 4. DOM 引用

```javascript
// ❌ DOM 引用未清除
const elements = [];
document.querySelectorAll('.item').forEach(el => {
  elements.push(el); // 保存 DOM 引用
});

// 即使 DOM 被移除，elements 仍持有引用
document.querySelector('.container').innerHTML = '';
// DOM 元素无法被回收 ❌

// ✅ 正确做法
const elements = [];
document.querySelectorAll('.item').forEach(el => {
  elements.push(el);
});

// 清除引用
elements.length = 0;
document.querySelector('.container').innerHTML = '';
```

#### 5. 事件监听器

```javascript
// ❌ 未移除的事件监听器
const button = document.getElementById('btn');

function handleClick() {
  console.log('clicked');
}

button.addEventListener('click', handleClick);

// button 被移除，但事件监听器仍然存在
button.remove();
// handleClick 无法被回收 ❌

// ✅ 正确做法
button.addEventListener('click', handleClick);

// 移除前清除监听器
button.removeEventListener('click', handleClick);
button.remove();
```

### 5.3 检测内存泄漏

```javascript
// 1. 使用 Chrome DevTools Memory Profiler
// - 打开 Chrome DevTools
// - 切换到 Memory 标签
// - 点击 "Take snapshot" 拍摄快照
// - 对比多个快照，查找持续增长的对象

// 2. 使用 Performance Monitor
// - Chrome DevTools → Performance Monitor
// - 观察 "JS heap size" 指标
// - 如果持续增长，可能存在内存泄漏

// 3. 代码检测
let memoryUsage = [];

setInterval(() => {
  if (performance.memory) {
    memoryUsage.push({
      time: Date.now(),
      usedJSHeapSize: performance.memory.usedJSHeapSize,
      totalJSHeapSize: performance.memory.totalJSHeapSize
    });
    
    // 分析内存使用趋势
    console.log('内存使用：', memoryUsage);
  }
}, 1000);
```

## 6. 面试重点

### 6.1 标准答案

**"JavaScript 的垃圾回收机制是引擎自动管理内存的过程，核心是识别并回收'不再被引用的对象'。**

**主要算法包括：**

1. **标记-清除：** 从根对象标记活跃对象，清除未标记的垃圾，是现代引擎的基础。
2. **引用计数：** 通过引用次数判断垃圾，但无法解决循环引用，已较少单独使用。

**V8 引擎通过'分代回收'优化：** 新生代用 Scavenge 算法高效回收短期对象，老生代用标记-清除+整理处理长期对象，配合晋升机制平衡效率。

**在开发过程中需注意避免内存泄漏：** 及时解除全局引用、清理闭包和 DOM 引用，让 GC 能正常回收无用内存。理解垃圾回收有助于写出更高效、稳定的代码，尤其在处理大对象或长生命周期应用时。"

### 6.2 面试回答模板

```
面试官：请说明 JavaScript 的垃圾回收机制？

回答：
1. 定义：
   - 自动管理内存，识别并回收不再使用的对象
   - 无需手动管理，避免内存泄漏

2. 主要算法：
   - 标记-清除：主流算法，标记活跃对象，清除垃圾
   - 引用计数：早期算法，无法解决循环引用
   - 标记-整理：解决内存碎片问题

3. V8 优化（分代回收）：
   - 新生代：Scavenge 算法，快速回收短期对象
   - 老生代：标记-清除+整理，处理长期对象
   - 晋升机制：存活对象晋升到老生代

4. 增量标记：
   - 减少 GC 暂停时间
   - 分步执行，不阻塞主线程

5. 避免内存泄漏：
   - 及时清除全局变量、定时器
   - 避免闭包持有大对象
   - 清理 DOM 引用和事件监听器
```

### 6.3 常见追问

#### Q1：什么是内存泄漏？如何避免？

```javascript
// 内存泄漏：不再使用的内存没有被释放

// 常见场景：
// 1. 全局变量
window.leaked = largeData; // ❌

// 2. 未清除的定时器
const timer = setInterval(...); // ❌
clearInterval(timer);           // ✅

// 3. 闭包
function outer() {
  const large = new Array(1000000);
  return () => console.log(large); // ❌ 持有大对象
}

// 4. DOM 引用
const el = document.getElementById('id');
el.remove();
el = null; // ✅ 清除引用
```

#### Q2：为什么要分代回收？

```
原因：
1. 大部分对象生命周期很短（临时变量）
2. 少部分对象生命周期很长（全局变量）

优势：
1. 新生代空间小，回收快，适合短期对象
2. 老生代空间大，回收慢，适合长期对象
3. 分而治之，提高整体效率
```

#### Q3：如何手动触发垃圾回收？

```javascript
// 浏览器：
// - 无法手动触发
// - 引擎自动管理

// Node.js：
// - 使用 --expose-gc 标志启动
// - 调用 global.gc()

// 启动命令
node --expose-gc app.js

// 代码中
if (global.gc) {
  global.gc(); // 手动触发 GC
}

// 注意：不建议频繁手动触发，影响性能
```

## 7. 最佳实践

### 7.1 编码建议

```javascript
// ✅ 1. 使用 let/const 代替 var
const data = 'value'; // 块级作用域，易于回收

// ✅ 2. 及时解除引用
let largeObject = { /* 大对象 */ };
// 使用完后
largeObject = null;

// ✅ 3. 避免创建全局变量
function process() {
  const temp = getData(); // 局部变量
  return temp;
}

// ✅ 4. 清理定时器
const timer = setInterval(...);
// 不需要时
clearInterval(timer);

// ✅ 5. WeakMap/WeakSet
const cache = new WeakMap();
cache.set(obj, data); // 弱引用，不阻止 GC
```

### 7.2 性能优化

```javascript
// 1. 对象池（复用对象）
class ObjectPool {
  constructor() {
    this.pool = [];
  }
  
  acquire() {
    return this.pool.pop() || {};
  }
  
  release(obj) {
    // 清空对象并放回池中
    Object.keys(obj).forEach(key => delete obj[key]);
    this.pool.push(obj);
  }
}

// 2. 避免频繁创建对象
// ❌ 错误
for (let i = 0; i < 1000000; i++) {
  const obj = { value: i }; // 创建百万个对象
}

// ✅ 正确
const obj = {};
for (let i = 0; i < 1000000; i++) {
  obj.value = i; // 复用同一个对象
}
```

## 8. 总结

### 8.1 核心要点

- **垃圾回收：** 自动管理内存，回收不再使用的对象
- **主要算法：** 标记-清除（主流）、引用计数（淘汰）、标记-整理（优化）
- **V8 优化：** 分代回收（新生代+老生代）、增量标记、晋升机制
- **内存泄漏：** 全局变量、定时器、闭包、DOM 引用、事件监听器

### 8.2 记忆要点

```
垃圾回收 = 自动找垃圾 + 释放内存

算法：
- 标记-清除：主流，标记活跃对象
- 引用计数：淘汰，无法处理循环引用

V8 分代：
- 新生代：短期对象，Scavenge 算法
- 老生代：长期对象，标记-清除+整理

避免泄漏：
- 清除：全局变量、定时器、事件监听器
- 解除：DOM 引用、闭包引用
```

---

> 💡 **核心要点：** JavaScript 的垃圾回收机制自动管理内存，开发者需要理解其工作原理，避免内存泄漏。V8 引擎通过分代回收和增量标记等优化技术，在保证性能的同时有效管理内存。
