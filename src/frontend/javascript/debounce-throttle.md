---
title: 防抖和节流
icon: logos:javascript
---

# 防抖和节流

**防抖（Debounce）** 和 **节流（Throttle）** 是 JavaScript 中用于控制高频事件触发频率的两种优化技术，常用于处理 `resize`、`scroll`、`input`、`click` 等可能被频繁触发的事件，避免因事件密集执行导致的性能问题（如频繁 DOM 操作、接口请求）。

**二者核心目标相同，但适用场景和实现逻辑不同。**

## 1. 问题场景

### 1.1 高频事件的性能问题

```javascript
// ❌ 问题：搜索输入框，每次输入都发请求
input.addEventListener('input', function(e) {
  fetch(`/api/search?keyword=${e.target.value}`);
  // 用户输入 "javascript" 会触发 10 次请求！
  // j -> ja -> jav -> java -> javas -> javasc -> javascr -> javascri -> javascrip -> javascript
});

// ❌ 问题：窗口缩放，频繁计算布局
window.addEventListener('resize', function() {
  calculateLayout(); // 每毫秒触发多次，严重卡顿
});

// ❌ 问题：滚动加载，过度检查
window.addEventListener('scroll', function() {
  checkIfReachBottom(); // 滚动时每毫秒触发多次
});
```

### 1.2 性能问题的影响

- 🔥 **CPU 占用高：** 频繁执行 JavaScript 代码
- 🌐 **网络浪费：** 发送大量无效请求
- 🎨 **页面卡顿：** 阻塞渲染线程
- 💰 **服务器压力：** 后端接口承受高并发

## 2. 防抖（Debounce）

### 2.1 核心逻辑

**当事件被触发后，延迟指定时间执行回调；若在延迟期间事件再次被触发，则重置延迟时间，直到最后一次触发后延迟时间结束，才执行一次回调。**

**形象理解：** "频繁触发时，只认最后一次，等待平静后再执行。"

```
事件触发：|—|—|—|——————|
         ↓  ↓  ↓        ↓
防抖执行：               ✓（只执行最后一次）
         ↑  ↑  ↑
       取消 取消 取消
```

### 2.2 代码实现

```javascript
function debounce(fn, delay) {
  let timer = null; // 闭包保存定时器
  
  return function(...args) {
    // 若已有定时器，清除并重新计时
    if (timer) {
      clearTimeout(timer);
    }
    
    // 延迟 delay 后执行原函数
    timer = setTimeout(() => {
      fn.apply(this, args); // 绑定 this 和参数
      timer = null; // 执行后清空定时器
    }, delay);
  };
}

// 使用示例
const searchInput = document.getElementById('search');

const handleSearch = debounce(function(e) {
  console.log('发送搜索请求：', e.target.value);
  fetch(`/api/search?keyword=${e.target.value}`);
}, 500);

searchInput.addEventListener('input', handleSearch);
```

### 2.3 执行流程

```javascript
// 用户输入 "hello" 的过程
// 0ms: 输入 'h' → 设置 500ms 后执行
// 100ms: 输入 'e' → 清除上次定时器，重新设置 500ms 后执行
// 200ms: 输入 'l' → 清除上次定时器，重新设置 500ms 后执行
// 300ms: 输入 'l' → 清除上次定时器，重新设置 500ms 后执行
// 400ms: 输入 'o' → 清除上次定时器，重新设置 500ms 后执行
// 900ms: 延迟时间到 → 执行搜索请求（只执行 1 次）

// 如果没有防抖，会执行 5 次请求
```

### 2.4 适用场景

#### 1. 搜索输入框联想

```javascript
// 搜索框防抖
const searchInput = document.getElementById('search');

const handleSearch = debounce(async function(e) {
  const keyword = e.target.value;
  if (keyword.length < 2) return;
  
  try {
    const response = await fetch(`/api/search?q=${keyword}`);
    const suggestions = await response.json();
    showSuggestions(suggestions);
  } catch (err) {
    console.error('搜索失败：', err);
  }
}, 300);

searchInput.addEventListener('input', handleSearch);
```

#### 2. 窗口大小调整

```javascript
// resize 防抖
const handleResize = debounce(function() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  
  console.log(`窗口尺寸：${width} x ${height}`);
  calculateLayout();
  adjustComponents();
}, 200);

window.addEventListener('resize', handleResize);
```

#### 3. 按钮防重复点击

```javascript
// 提交按钮防抖
const submitBtn = document.getElementById('submit');

const handleSubmit = debounce(async function() {
  console.log('提交表单');
  
  try {
    const response = await fetch('/api/submit', {
      method: 'POST',
      body: JSON.stringify(formData)
    });
    
    if (response.ok) {
      alert('提交成功');
    }
  } catch (err) {
    console.error('提交失败：', err);
  }
}, 1000);

submitBtn.addEventListener('click', handleSubmit);
```

### 2.5 增强版防抖（支持立即执行）

```javascript
function debounce(fn, delay, immediate = false) {
  let timer = null;
  
  return function(...args) {
    const callNow = immediate && !timer;
    
    if (timer) {
      clearTimeout(timer);
    }
    
    timer = setTimeout(() => {
      timer = null;
      if (!immediate) {
        fn.apply(this, args);
      }
    }, delay);
    
    // 立即执行：第一次触发立即执行，后续触发等待
    if (callNow) {
      fn.apply(this, args);
    }
  };
}

// 使用示例：立即执行第一次，后续防抖
const handleClick = debounce(function() {
  console.log('按钮被点击');
}, 1000, true);

button.addEventListener('click', handleClick);
```

## 3. 节流（Throttle）

### 3.1 核心逻辑

**设定一个时间间隔，事件触发后立即执行一次回调，之后在间隔时间内的新触发全部忽略，直到间隔时间结束，才允许下一次执行。**

**形象理解：** "像水龙头滴水，固定时间间隔滴一次，再频繁触发也不加快频率。"

```
事件触发：|—|—|—|—|—|—|—|—|
         ↓     ↓     ↓
节流执行：✓     ✓     ✓（每隔固定时间执行一次）
```

### 3.2 代码实现（时间戳版）

```javascript
function throttle(fn, interval) {
  let lastTime = 0; // 闭包保存上一次执行时间
  
  return function(...args) {
    const now = Date.now(); // 当前时间戳
    
    // 若当前时间 - 上次执行时间 >= 间隔，则执行
    if (now - lastTime >= interval) {
      fn.apply(this, args);
      lastTime = now; // 更新上次执行时间
    }
  };
}

// 使用示例
const handleScroll = throttle(function() {
  console.log('滚动位置：', window.scrollY);
  checkIfReachBottom();
}, 200);

window.addEventListener('scroll', handleScroll);
```

### 3.3 代码实现（定时器版）

```javascript
function throttle(fn, interval) {
  let timer = null;
  
  return function(...args) {
    if (timer) return; // 若定时器存在，忽略本次触发
    
    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = null; // 清空定时器，允许下次执行
    }, interval);
  };
}
```

### 3.4 执行流程

```javascript
// 用户快速滚动页面（每 50ms 触发一次）
// 0ms: 触发 → 立即执行（第1次）
// 50ms: 触发 → 忽略（距上次执行 < 200ms）
// 100ms: 触发 → 忽略（距上次执行 < 200ms）
// 150ms: 触发 → 忽略（距上次执行 < 200ms）
// 200ms: 触发 → 执行（距上次执行 >= 200ms）（第2次）
// 250ms: 触发 → 忽略
// 300ms: 触发 → 忽略
// 350ms: 触发 → 忽略
// 400ms: 触发 → 执行（第3次）

// 如果没有节流，会执行 9 次
// 使用节流后，只执行 3 次
```

### 3.5 适用场景

#### 1. 滚动加载

```javascript
// 滚动到底部加载更多
const handleScroll = throttle(function() {
  const scrollTop = window.scrollY;
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;
  
  // 距离底部 100px 时加载
  if (scrollTop + windowHeight >= documentHeight - 100) {
    loadMoreData();
  }
}, 200);

window.addEventListener('scroll', handleScroll);
```

#### 2. 鼠标移动追踪

```javascript
// 鼠标移动时显示坐标
const handleMouseMove = throttle(function(e) {
  const x = e.clientX;
  const y = e.clientY;
  
  console.log(`鼠标位置：(${x}, ${y})`);
  updateCursor(x, y);
}, 100);

document.addEventListener('mousemove', handleMouseMove);
```

#### 3. 高频点击事件

```javascript
// 游戏射击按钮（限制每秒最多点击 5 次）
const handleShoot = throttle(function() {
  console.log('发射子弹');
  shoot();
}, 200); // 200ms = 1秒最多5次

shootButton.addEventListener('click', handleShoot);
```

### 3.6 增强版节流（首次执行 + 尾部执行）

```javascript
function throttle(fn, interval, options = {}) {
  let lastTime = 0;
  let timer = null;
  
  const { leading = true, trailing = true } = options;
  
  return function(...args) {
    const now = Date.now();
    
    // leading: false 时，首次不执行
    if (!lastTime && !leading) {
      lastTime = now;
    }
    
    const remaining = interval - (now - lastTime);
    
    if (remaining <= 0 || remaining > interval) {
      // 时间到了，立即执行
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      
      fn.apply(this, args);
      lastTime = now;
    } else if (!timer && trailing) {
      // trailing: true 时，设置定时器执行最后一次
      timer = setTimeout(() => {
        fn.apply(this, args);
        lastTime = Date.now();
        timer = null;
      }, remaining);
    }
  };
}
```

## 4. 防抖 vs 节流

### 4.1 核心区别

| 对比项 | 防抖（Debounce） | 节流（Throttle） |
|--------|-----------------|-----------------|
| **执行时机** | 最后一次触发后延迟执行 | 每隔固定时间执行一次 |
| **执行次数** | 多次触发只执行 1 次 | 多次触发执行 N 次（按间隔） |
| **形象比喻** | 等电梯：等所有人到齐再走 | 滴水龙头：固定频率滴水 |
| **适用场景** | 输入框搜索、窗口 resize | 滚动加载、鼠标移动 |

### 4.2 可视化对比

```javascript
// 假设用户快速触发事件 10 次，每次间隔 100ms

// 1. 无优化：执行 10 次
|—|—|—|—|—|—|—|—|—|—|
✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓

// 2. 防抖（500ms）：只执行最后 1 次
|—|—|—|—|—|—|—|—|—|—————|
                      ✓

// 3. 节流（300ms）：每 300ms 执行 1 次，共 4 次
|—|—|—|—|—|—|—|—|—|—|
✓     ✓     ✓     ✓
```

### 4.3 代码对比

```javascript
// 场景：用户在 1 秒内输入 "hello"（5 个字符，每个字符间隔 200ms）

// 1. 防抖（500ms）
const debounced = debounce(search, 500);
// 结果：只在最后一个字符输入 500ms 后执行 1 次

// 2. 节流（500ms）
const throttled = throttle(search, 500);
// 结果：首次立即执行，第二次在 500ms 后执行，共 2 次

// 3. 无优化
// 结果：每个字符都执行，共 5 次
```

### 4.4 选择建议

```javascript
// 防抖场景：需要"等待操作结束后再执行"
✓ 搜索输入框联想（等用户停止输入）
✓ 表单验证（等用户输入完成）
✓ 窗口 resize 后的布局计算（等调整完成）
✓ 按钮防重复点击（等用户停止点击）

// 节流场景：需要"按固定频率执行"
✓ 滚动加载（定期检查是否到底）
✓ 鼠标移动追踪（定期更新位置）
✓ 视频播放进度（定期保存进度）
✓ 输入框实时字数统计（定期更新计数）
```

## 5. 实战应用

### 5.1 搜索框防抖 + 取消请求

```javascript
let controller = null;

const search = debounce(async function(keyword) {
  // 取消上一次请求
  if (controller) {
    controller.abort();
  }
  
  controller = new AbortController();
  
  try {
    const response = await fetch(`/api/search?q=${keyword}`, {
      signal: controller.signal
    });
    const data = await response.json();
    showResults(data);
  } catch (err) {
    if (err.name === 'AbortError') {
      console.log('请求被取消');
    } else {
      console.error('搜索失败：', err);
    }
  }
}, 300);

searchInput.addEventListener('input', (e) => {
  search(e.target.value);
});
```

### 5.2 滚动加载节流 + Loading 状态

```javascript
let isLoading = false;

const loadMore = throttle(async function() {
  if (isLoading) return;
  
  const scrollTop = window.scrollY;
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;
  
  if (scrollTop + windowHeight >= documentHeight - 100) {
    isLoading = true;
    showLoading();
    
    try {
      const data = await fetchMoreData();
      appendData(data);
    } catch (err) {
      console.error('加载失败：', err);
    } finally {
      isLoading = false;
      hideLoading();
    }
  }
}, 200);

window.addEventListener('scroll', loadMore);
```

### 5.3 窗口 resize 防抖 + 节流结合

```javascript
// 需求：resize 时实时显示尺寸（节流），停止后计算布局（防抖）

// 实时显示（节流）
const updateSize = throttle(function() {
  sizeDisplay.textContent = `${window.innerWidth} x ${window.innerHeight}`;
}, 100);

// 布局计算（防抖）
const calculateLayout = debounce(function() {
  console.log('重新计算布局');
  // 执行复杂的布局计算
  adjustLayout();
}, 500);

window.addEventListener('resize', function() {
  updateSize();      // 实时更新尺寸显示
  calculateLayout(); // 停止后才计算布局
});
```

### 5.4 使用 Lodash 工具库

```javascript
import { debounce, throttle } from 'lodash';

// 防抖
const debouncedSearch = debounce(search, 300, {
  leading: false,   // 首次不立即执行
  trailing: true,   // 最后一次触发后执行
  maxWait: 1000     // 最长等待时间（即使持续触发也会执行）
});

// 节流
const throttledScroll = throttle(handleScroll, 200, {
  leading: true,    // 首次立即执行
  trailing: true    // 最后一次也执行
});

// 取消
debouncedSearch.cancel();  // 取消延迟执行
throttledScroll.cancel();  // 取消节流
```

## 6. 面试重点

### 6.1 标准答案

**防抖和节流都是控制高频事件触发频率的优化技术，核心是避免频繁执行耗时操作（如 DOM 操作、接口请求）导致的性能问题，但二者逻辑不同：**

**防抖：** 事件触发后延迟一段时间执行回调，若期间再次触发则重置延迟，最终只执行最后一次。适合需要**"等待操作结束后再执行"**的场景，比如搜索输入联想、窗口 resize 后的布局计算。

**节流：** 设定固定时间间隔，事件触发后立即执行一次，间隔内的新触发全部忽略，确保每隔一段时间最多执行一次。适合需要**"按固定频率执行"**的场景，比如滚动加载、鼠标移动追踪。

**实现上，** 防抖通过闭包保存定时器，触发时清除旧定时器并新建；节流通过时间戳或定时器控制，确保间隔内只执行一次。实际开发中需根据场景选择，比如输入框用防抖，滚动事件用节流。

### 6.2 面试回答模板

```
面试官：请说明防抖和节流的区别？

回答：
1. 定义：
   - 防抖：多次触发只执行最后一次，等待平静后执行
   - 节流：按固定时间间隔执行，控制执行频率

2. 执行时机：
   - 防抖：最后一次触发后延迟执行
   - 节流：每隔固定时间执行一次

3. 执行次数：
   - 防抖：多次触发只执行 1 次
   - 节流：多次触发执行 N 次

4. 适用场景：
   - 防抖：搜索输入、resize、按钮防抖
   - 节流：滚动加载、鼠标移动、进度保存

5. 实现原理：
   - 防抖：clearTimeout + setTimeout
   - 节流：时间戳 or 定时器

6. 代码演示：
   [展示防抖和节流的实现代码]
```

### 6.3 常见追问

#### Q1：手写防抖函数

```javascript
function debounce(fn, delay) {
  let timer = null;
  
  return function(...args) {
    if (timer) clearTimeout(timer);
    
    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = null;
    }, delay);
  };
}
```

#### Q2：手写节流函数

```javascript
function throttle(fn, interval) {
  let lastTime = 0;
  
  return function(...args) {
    const now = Date.now();
    
    if (now - lastTime >= interval) {
      fn.apply(this, args);
      lastTime = now;
    }
  };
}
```

#### Q3：如何取消防抖/节流？

```javascript
function debounce(fn, delay) {
  let timer = null;
  
  const debounced = function(...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = null;
    }, delay);
  };
  
  // 添加 cancel 方法
  debounced.cancel = function() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };
  
  return debounced;
}

// 使用
const debouncedFn = debounce(fn, 1000);
debouncedFn.cancel(); // 取消延迟执行
```

## 7. 总结

### 7.1 核心要点

- **防抖：** 等待平静后执行最后一次
- **节流：** 按固定频率执行
- **目的：** 优化高频事件性能
- **实现：** 闭包 + 定时器/时间戳

### 7.2 记忆口诀

```
防抖像电梯：等所有人到齐再走（等待平静）
节流像水滴：固定频率滴水（固定间隔）

防抖用于"最后"：搜索、resize、提交
节流用于"定期"：滚动、移动、保存
```

### 7.3 最佳实践

```javascript
// ✅ 推荐：使用成熟库（如 Lodash）
import { debounce, throttle } from 'lodash';

const search = debounce(handleSearch, 300);
const scroll = throttle(handleScroll, 200);

// ✅ 推荐：根据场景选择
搜索输入 → 防抖（等用户输入完成）
滚动加载 → 节流（定期检查）
窗口 resize → 防抖（等调整完成）

// ✅ 推荐：合理设置延迟时间
防抖：300-500ms（用户感知不到延迟）
节流：100-200ms（既流畅又不过度执行）

// ❌ 避免：过度使用
// 不是所有事件都需要防抖/节流
// 只在高频事件+耗时操作时使用
```

---

> 💡 **核心要点：** 防抖和节流是前端性能优化的重要手段。防抖等待平静后执行最后一次，节流按固定频率执行。实际开发中应根据具体场景选择合适的优化策略。
