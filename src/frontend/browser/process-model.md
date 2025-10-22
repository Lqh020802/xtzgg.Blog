---
title: 浏览器进程模型
icon: mdi:web
category:
  - 浏览器原理
tag:
  - 浏览器
  - 进程模型
  - 架构
  - 多进程
---

# 浏览器进程模型

## 1. 进程（Process）

### 1.1 什么是进程

**进程可以理解为一块内存空间**，操作系统为每个应用程序分配独立的内存区域。

### 1.2 进程的特点

#### 独立性

```
应用程序 A 的进程 ←→ 独立内存空间
应用程序 B 的进程 ←→ 独立内存空间
应用程序 C 的进程 ←→ 独立内存空间
```

- ✅ **各个应用程序之间的进程相互独立**
- ✅ **一个进程崩溃不会影响其他进程**
- ✅ **提高系统稳定性和安全性**

#### 进程间通信（IPC）

**不同的进程间进行通信，需要双方的同意**

```javascript
// 示例：主进程与渲染进程通信（Electron）
// 主进程
ipcMain.on('message-from-renderer', (event, data) => {
  console.log('收到渲染进程消息：', data);
  event.reply('message-from-main', '主进程收到了');
});

// 渲染进程
ipcRenderer.send('message-from-renderer', 'Hello Main Process');
ipcRenderer.on('message-from-main', (event, data) => {
  console.log('收到主进程消息：', data);
});
```

## 2. 线程（Thread）

### 2.1 什么是线程

**线程是进程内部的执行单元**，每个进程至少有一个线程。

### 2.2 主线程

- **每个应用程序至少有一个线程，该线程被称为 "主线程"**
- 主线程负责执行程序的主要逻辑
- 浏览器的渲染进程中，主线程负责执行 JavaScript 代码

### 2.3 多线程

**如果一个程序中需要同时执行多块代码，通过主线程开启多线程**

```
进程（浏览器）
├── 主线程（执行 JS、渲染页面）
├── 网络线程（处理网络请求）
├── 定时器线程（处理计时器）
├── UI 线程（处理用户交互）
└── Web Worker 线程（执行复杂计算）
```

### 2.4 线程的优势

- ⚡ **提高程序执行效率**（并行处理任务）
- 🔄 **避免主线程阻塞**（耗时任务交给其他线程）
- 🚀 **提升用户体验**（页面不会卡顿）

## 3. 浏览器的多进程架构

### 3.1 浏览器进程

```
浏览器（Chrome 示例）
├── 浏览器主进程（Browser Process）
│   └── 负责地址栏、书签、前进后退按钮等
│
├── GPU 进程（GPU Process）
│   └── 负责绘制页面
│
├── 网络进程（Network Process）
│   └── 负责网络资源加载
│
├── 渲染进程（Renderer Process）  ← 核心
│   └── 每个标签页一个渲染进程
│
└── 插件进程（Plugin Process）
    └── 负责插件运行（如 Flash）
```

### 3.2 多进程的好处

#### 1. 安全性

```
恶意网页进程崩溃
    ↓
不会影响其他标签页
    ↓
浏览器仍然稳定运行
```

#### 2. 流畅性

```
一个标签页卡死
    ↓
其他标签页不受影响
    ↓
可以关闭卡死的标签页
```

#### 3. 高性能

```
多个标签页并行渲染
    ↓
充分利用多核 CPU
    ↓
提升整体性能
```

## 4. 渲染进程（最重要）

### 4.1 渲染进程的职责

**渲染进程需要做的任务：**

- 📄 **解析 HTML**
- 🎨 **解析 CSS**
- 🧮 **计算样式**
- 📐 **布局**（Layout）
- 🖼️ **处理图层**（Layer）
- 🎬 **每秒把页面画 60 次**（渲染）
- ⚙️ **执行全局 JS 代码**
- 🖱️ **执行事件处理函数**
- ⏰ **执行计时器的回调函数**
- ...等等

### 4.2 渲染进程的线程

```
渲染进程
├── GUI 渲染线程（主线程）
│   ├── 解析 HTML/CSS
│   ├── 构建 DOM 树
│   ├── 布局和绘制
│   └── 执行 JavaScript
│
├── JS 引擎线程（V8）
│   └── 执行 JavaScript 代码
│
├── 事件触发线程
│   └── 管理事件队列
│
├── 定时器线程
│   └── 处理 setTimeout/setInterval
│
└── 网络请求线程
    └── 处理 Ajax/Fetch 请求
```

### 4.3 单线程的 JavaScript

**JavaScript 运行在渲染进程的主线程上，是单线程的。**

```javascript
// JavaScript 是单线程执行的
console.log('1');  // 先执行
console.log('2');  // 再执行
console.log('3');  // 最后执行

// 不能同时执行多段 JavaScript 代码
```

## 5. 事件循环（Event Loop）- 核心机制

### 5.1 什么是事件循环

**事件循环（Event Loop）** 也称为 **消息循环**，是浏览器渲染主线程的工作方式。

```
启动渲染主线程
    ↓
进入无限循环（事件循环）
    ↓
不断从任务队列取任务执行
    ↓
永不停止（除非关闭页面）
```

### 5.2 事件循环的工作流程

#### 完整流程图

```
┌─────────────────────────────────────┐
│  1. 从宏任务队列取出第一个任务       │
│     (script、setTimeout、setInterval) │
└───────────────┬─────────────────────┘
                ↓
┌─────────────────────────────────────┐
│  2. 执行宏任务                      │
└───────────────┬─────────────────────┘
                ↓
┌─────────────────────────────────────┐
│  3. 清空微任务队列                   │
│     (Promise.then、MutationObserver) │
│     - 执行所有微任务                │
│     - 新产生的微任务也会立即执行     │
└───────────────┬─────────────────────┘
                ↓
┌─────────────────────────────────────┐
│  4. UI 渲染（如有需要）              │
│     - 更新 DOM                      │
│     - 更新样式                      │
│     - 重新布局和绘制                │
└───────────────┬─────────────────────┘
                ↓
┌─────────────────────────────────────┐
│  5. 回到步骤 1，开始下一轮循环       │
└─────────────────────────────────────┘
```

### 5.3 详细执行步骤

#### 步骤 1：取出宏任务

```javascript
// 宏任务队列
[
  script,           // ← 取出这个
  setTimeout回调,
  setInterval回调
]
```

#### 步骤 2：执行宏任务

```javascript
// 执行当前宏任务
console.log('宏任务执行中');

// 可能产生新的微任务
Promise.resolve().then(() => {
  console.log('产生的微任务');
});
```

#### 步骤 3：清空微任务队列

```javascript
// 微任务队列
[
  Promise.then回调1,
  Promise.then回调2,
  MutationObserver回调
]

// 按顺序执行所有微任务
// 如果执行微任务时产生新的微任务，也会追加到队列末尾并执行
```

**关键特性：微任务插队**

```javascript
console.log('1');

setTimeout(() => {
  console.log('宏任务');
}, 0);

Promise.resolve().then(() => {
  console.log('微任务1');
  Promise.resolve().then(() => {
    console.log('微任务2');
  });
});

console.log('2');

// 输出顺序：
// 1
// 2
// 微任务1
// 微任务2
// 宏任务

// 解释：
// 1. 执行同步代码：1, 2
// 2. 当前宏任务结束，清空微任务队列：微任务1, 微任务2
// 3. 下一轮循环，执行下一个宏任务：宏任务
```

#### 步骤 4：UI 渲染

```javascript
// 如果有 DOM 更新、样式变化、布局变化
// 浏览器会在微任务清空后进行渲染

document.body.style.background = 'red';
// ↓ 微任务执行完后才会渲染

Promise.resolve().then(() => {
  console.log('微任务执行');
});
// ↓ UI 渲染发生在这里
```

#### 步骤 5：下一轮循环

```javascript
// 回到步骤 1，取下一个宏任务
// 如果宏任务队列为空，主线程休眠
// 有新任务时，被唤醒
```

### 5.4 其他线程的协作

```
定时器线程
  ↓ 计时结束
  └→ 将回调函数放入宏任务队列

网络线程
  ↓ 请求响应
  └→ 将回调函数放入宏任务队列

事件线程
  ↓ 事件触发
  └→ 将回调函数放入宏任务队列

主线程（如果休眠）
  ← 被唤醒
  ← 继续事件循环
```

### 5.5 宏任务 vs 微任务（重要）

在 JavaScript 异步编程模型中，**微任务（Microtasks）** 与 **宏任务（Macrotasks）** 是基于事件循环（Event Loop）机制的任务调度分类，二者的核心差异体现在**执行优先级与调度时机**上，直接决定了异步代码的执行顺序。

#### 宏任务（Macrotasks）

**本质：** 由**宿主环境**（浏览器/Node.js）发起的异步任务，通常是比较耗时的操作或非即时性任务，**执行优先级比较低**。

**包含类型：**

```javascript
// 1. 全局脚本（作为首个宏任务）
<script>
  console.log('全局脚本');
</script>

// 2. 定时器 API
setTimeout(() => {
  console.log('setTimeout');
}, 0);

setInterval(() => {
  console.log('setInterval');
}, 1000);

// 3. I/O 操作
// 网络请求回调
fetch('/api/data').then(response => {
  console.log('Fetch 回调');
});

// XMLHttpRequest
xhr.onload = function() {
  console.log('XHR 回调');
};

// Node.js 文件读写
fs.readFile('file.txt', (err, data) => {
  console.log('文件读取回调');
});

// 4. DOM 事件回调
button.addEventListener('click', () => {
  console.log('点击事件');
});

window.addEventListener('load', () => {
  console.log('页面加载完成');
});

// 5. UI 渲染任务（浏览器内部）
// 浏览器在微任务清空后自动执行
```

#### 微任务（Microtasks）

**本质：** 由 **JavaScript 引擎自身**发起的异步任务，通常是即时性操作（如 Promise 决议），**执行优先级高于宏任务**。

**包含类型：**

```javascript
// 1. Promise 的回调
Promise.resolve().then(() => {
  console.log('Promise.then');
});

Promise.reject().catch(() => {
  console.log('Promise.catch');
});

Promise.resolve().finally(() => {
  console.log('Promise.finally');
});

// 2. async/await 的后续逻辑
// await 表达式后的代码会被封装为微任务
async function test() {
  console.log('1');
  await Promise.resolve();
  console.log('2');  // 这行代码会被封装为微任务
}

// 3. MutationObserver
const observer = new MutationObserver(() => {
  console.log('DOM 变化');
});
observer.observe(document.body, { childList: true });

// 4. queueMicrotask
queueMicrotask(() => {
  console.log('手动添加的微任务');
});

// 5. process.nextTick（Node.js）
process.nextTick(() => {
  console.log('nextTick');
});
```

#### 快速对比表格

| 类型 | 常见任务 | 执行时机 | 优先级 |
|------|---------|---------|--------|
| **宏任务** | `<script>` 代码块<br>`setTimeout`<br>`setInterval`<br>UI 渲染<br>I/O 操作<br>DOM 事件 | 每次循环执行一个 | 低 |
| **微任务** | `Promise.then`<br>`async/await`<br>`MutationObserver`<br>`queueMicrotask`<br>`process.nextTick` | 当前宏任务后立即清空所有 | 高 |

#### 执行顺序示例

```javascript
console.log('1');  // 同步代码

setTimeout(() => {
  console.log('2');  // 宏任务
}, 0);

Promise.resolve().then(() => {
  console.log('3');  // 微任务
});

console.log('4');  // 同步代码

// 输出顺序：1 → 4 → 3 → 2

// 解释：
// 1. 执行同步代码：1, 4
// 2. 当前宏任务结束，清空微任务队列：3
// 3. 下一轮循环，执行下一个宏任务：2
```

### 5.6 完整示例

```javascript
console.log('1');  // 同步代码

setTimeout(() => {
  console.log('2');  // 宏任务
  Promise.resolve().then(() => {
    console.log('3');  // 微任务
  });
}, 0);

Promise.resolve().then(() => {
  console.log('4');  // 微任务
  setTimeout(() => {
    console.log('5');  // 宏任务
  }, 0);
});

console.log('6');  // 同步代码

// 输出顺序：1 → 6 → 4 → 2 → 3 → 5

// 分析：
// 第1轮循环：
//   宏任务：执行 script（同步代码）→ 输出 1, 6
//   微任务：执行 Promise.then → 输出 4
// 第2轮循环：
//   宏任务：执行 setTimeout → 输出 2
//   微任务：执行 Promise.then → 输出 3
// 第3轮循环：
//   宏任务：执行 setTimeout → 输出 5
```

## 6. 异步任务

### 6.1 什么是异步任务

**代码在执行过程中，无法立即完成的任务即称为异步任务。**

### 6.2 常见的异步任务

```javascript
// 1. 定时器
setTimeout(() => {
  console.log('3秒后执行');
}, 3000);

// 2. 网络请求
fetch('/api/data').then(res => {
  console.log('请求完成');
});

// 3. 事件监听
button.addEventListener('click', () => {
  console.log('点击后执行');
});

// 4. 文件读取（Node.js）
fs.readFile('file.txt', (err, data) => {
  console.log('文件读取完成');
});
```

### 6.3 为什么要有异步任务

#### 问题场景

```javascript
// 如果是同步的（假设）
console.log('开始');

// 等待 3 秒（阻塞主线程）
sleep(3000);  // ❌ 主线程被阻塞，什么都做不了

console.log('结束');

// 这 3 秒期间：
// - 页面卡死，无法交互
// - 其他任务无法执行
// - 用户体验极差
```

#### 异步解决方案

```javascript
console.log('开始');

// 异步执行（不阻塞主线程）
setTimeout(() => {
  console.log('3秒后执行');
}, 3000);

console.log('结束');

// 输出：开始 → 结束 → 3秒后执行

// 优点：
// - 主线程立即执行后续代码
// - 页面不会卡顿
// - 用户可以正常交互
```

### 6.4 异步任务的处理流程

```
主线程遇到异步任务
    ↓
将任务交给其他线程处理
    ├→ 定时器线程（setTimeout）
    ├→ 网络线程（fetch）
    └→ 事件线程（addEventListener）
    ↓
主线程立即执行后续代码（不等待）
    ↓
其他线程完成任务
    ↓
将回调函数放入任务队列
    ↓
主线程从队列取出任务执行
```

## 7. 如何理解 JS 的异步（面试重点）

### 7.1 核心观点

**JavaScript 是一门单线程语言**，这是因为 **JS 运行在浏览器的渲染进程中，而渲染进程只有一个主线程**。

### 7.2 为什么是单线程

#### 原因 1：DOM 操作的安全性

```javascript
// 如果 JS 是多线程的（假设）

// 线程 A
document.body.remove();

// 线程 B（同时执行）
document.body.style.background = 'red';

// 冲突：body 已被删除，无法设置样式
// 需要复杂的锁机制来避免冲突
```

#### 原因 2：简化编程模型

```javascript
// 单线程：代码按顺序执行，易于理解
let count = 0;
count++;
console.log(count);  // 1

// 多线程：需要考虑并发问题，复杂度高
```

### 7.3 单线程的问题

**渲染主线程承担着很多工作：**

- 📄 解析 HTML
- 🎨 渲染页面
- ⚙️ 运行 JavaScript
- 🖱️ 处理用户交互
- ...

**如果使用同步方式：**

```javascript
// 同步方式（假设）
const data = fetch('/api/data');  // 等待 2 秒
console.log(data);

// 问题：
// 1. 主线程等待 2 秒，白白浪费时间
// 2. 消息队列中的其他任务无法执行
// 3. 页面无法渲染，用户无法交互
// 4. 给用户造成页面卡死的假象
```

### 7.4 异步的解决方案

**完整理解（重要）：**

JavaScript 是一门单线程语言，这是因为 JS 运行在浏览器的渲染进程中，而渲染进程只有一个主线程。

渲染进程承担着很多工作如：解析 HTML、运行 JS、渲染页面等。

如果使用同步的方式，则会让渲染主线程白白浪费时间进行等待，从而导致消息队列中的其他任务无法进行执行就会产生**阻塞**，一方面会导致渲染主线程白白浪费时间，另一方面可能会导致页面无法及时更新，给用户造成页面卡死现象。

所以浏览器采用异步任务的方式进行避免这个现象的产生，当遇到计时器、网络、事件监听等任务时，主线程会将这些任务交给其他线程（如定时器线程）去做，自身立即结束任务的执行。渲染进程继续去执行后续的代码，当其他线程完成时，会将回调函数包装成任务，放在消息队列末尾进行排队，等待主线程的调用。

在这种模式下，浏览器永不阻塞，从而保证单线程的流畅运行。

#### 工作流程

```
主线程遇到异步任务
    ↓
将任务交给其他线程（如网络线程）
    ↓
主线程立即结束当前任务
    ↓
主线程继续执行后续代码
    ↓
其他线程完成任务后
    ↓
将回调函数包装成任务
    ↓
放入消息队列末尾排队
    ↓
等待主线程调用
```

#### 代码示例

```javascript
console.log('1');

// 异步任务：交给网络线程处理
fetch('/api/data').then(data => {
  console.log('3');  // 请求完成后执行
});

console.log('2');

// 输出：1 → 2 → 3

// 流程：
// 1. 执行 console.log('1')
// 2. 遇到 fetch，交给网络线程，主线程继续
// 3. 执行 console.log('2')
// 4. 网络请求完成，回调函数进入队列
// 5. 主线程取出回调函数，执行 console.log('3')
```

### 7.5 异步的优势

**在这种模式下，浏览器永不阻塞，从而保证单线程的流畅运行。**

- ✅ **主线程永不等待**
- ✅ **页面流畅渲染**
- ✅ **用户交互及时响应**
- ✅ **充分利用多线程能力**

## 8. 完整示例演示

### 8.1 异步执行顺序

```javascript
console.log('script start');

setTimeout(function() {
  console.log('setTimeout');
}, 0);

Promise.resolve().then(function() {
  console.log('promise1');
}).then(function() {
  console.log('promise2');
});

console.log('script end');

// 输出顺序：
// script start
// script end
// promise1
// promise2
// setTimeout

// 解释：
// 1. 执行同步代码：script start, script end
// 2. 清空微任务队列：promise1, promise2
// 3. 执行宏任务：setTimeout
```

### 8.2 复杂示例

```javascript
async function async1() {
  console.log('async1 start');
  await async2();
  console.log('async1 end');  // 相当于 Promise.then
}

async function async2() {
  console.log('async2');
}

console.log('script start');

setTimeout(() => {
  console.log('setTimeout');
}, 0);

async1();

new Promise(resolve => {
  console.log('promise1');
  resolve();
}).then(() => {
  console.log('promise2');
});

console.log('script end');

// 输出顺序：
// script start
// async1 start
// async2
// promise1
// script end
// async1 end
// promise2
// setTimeout
```

### 8.3 视觉演示

> 💡 **提示：** 可以将图片和 HTML 演示文件放在 `/assets/images/javascript/` 目录下，然后在此引用。

```markdown
<!-- 如果有图片 -->
![事件循环示意图](/assets/images/javascript/event-loop.png)

<!-- 如果有HTML演示 -->
可以访问：/demos/event-loop.html 查看交互式演示
```

## 9. 常见面试题

### Q1：JavaScript 是单线程还是多线程？

**答：单线程。** JavaScript 运行在浏览器渲染进程的主线程上，一次只能执行一段代码。但浏览器本身是多进程、多线程的。

### Q2：为什么 JavaScript 要设计成单线程？

**答：** 为了避免 DOM 操作的冲突。如果多个线程同时操作 DOM，会导致不可预期的结果。单线程简化了编程模型，避免了复杂的锁机制。

### Q3：setTimeout(fn, 0) 会立即执行吗？

**答：不会。** 即使延迟时间为 0，回调函数也会被放入宏任务队列，需要等待当前宏任务和所有微任务执行完毕后，才会在下一轮事件循环中执行。

### Q4：微任务和宏任务的区别？

**答：**
- **宏任务：** 每次循环执行一个，如 `setTimeout`、`setInterval`
- **微任务：** 当前宏任务执行完后立即清空所有微任务，如 `Promise.then`

### Q5：async/await 是宏任务还是微任务？

**答：微任务。** `await` 后面的代码相当于 `Promise.then`，会被放入微任务队列。

```javascript
async function test() {
  console.log('1');
  await Promise.resolve();
  console.log('2');  // 相当于 Promise.then(() => console.log('2'))
}

test();
console.log('3');

// 输出：1 → 3 → 2
```

---

> 💡 **核心要点：** 浏览器采用多进程架构保证稳定性，JavaScript 运行在单线程的渲染主线程上，通过事件循环和异步任务机制实现非阻塞执行，保证页面流畅。
