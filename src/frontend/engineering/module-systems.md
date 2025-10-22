---
title: 前端模块化完整指南
date: 2025-10-22
icon: mdi:puzzle
category:
  - 前端工程化
tag:
  - 模块化
  - CommonJS
  - ES Module
  - AMD
  - UMD
---

# 前端模块化完整指南

## 一、模块化基础

### 1.1 什么是模块化

**模块化**是将复杂程序按照功能划分为独立的代码块，每个模块具有独立的作用域，通过特定的接口进行通信。

**核心优势：**
- 避免命名冲突
- 提高代码复用性
- 便于维护和协作
- 支持按需加载

### 1.2 模块化发展历程

```javascript
// 阶段1：全局变量（无模块化）
var name = '张三';
function getName() { return name; }

// 阶段2：命名空间
var MyApp = {
  name: '张三',
  getName: function() { return this.name; }
};

// 阶段3：IIFE（立即执行函数）
var MyModule = (function() {
  var name = '张三';
  return {
    getName: function() { return name; }
  };
})();

// 阶段4：CommonJS/ES Module（现代模块化）
export const name = '张三';
export function getName() { return name; }
```

## 二、CommonJS规范

### 2.1 基本语法

```javascript
// 导出方式
// math.js
function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

module.exports = {
  add,
  subtract
};

// 或者单独导出
exports.add = add;
exports.subtract = subtract;

// 导入方式
const math = require('./math');
console.log(math.add(1, 2)); // 3

// 解构导入
const { add, subtract } = require('./math');
```

### 2.2 加载机制

**特点：**
- 同步加载
- 运行时加载
- 值的拷贝
- 缓存机制

```javascript
// 缓存示例
// counter.js
let count = 0;
module.exports = {
  count,
  increment() {
    count++;
  },
  getCount() {
    return count;
  }
};

// main.js
const counter1 = require('./counter');
const counter2 = require('./counter');

console.log(counter1 === counter2); // true，同一个实例

counter1.increment();
console.log(counter1.getCount()); // 1
console.log(counter2.getCount()); // 1，共享状态
```

### 2.3 循环依赖处理

```javascript
// a.js
exports.done = false;
const b = require('./b');
console.log('在a中，b.done =', b.done);
exports.done = true;

// b.js
exports.done = false;
const a = require('./a');
console.log('在b中，a.done =', a.done);
exports.done = true;

// main.js
const a = require('./a');
const b = require('./b');
// 输出：
// 在b中，a.done = false
// 在a中，b.done = true
```

## 三、ES Module规范

### 3.1 基本语法

```javascript
// 导出方式
// math.js

// 命名导出
export const PI = 3.14;
export function add(a, b) {
  return a + b;
}

// 批量导出
const multiply = (a, b) => a * b;
const divide = (a, b) => a / b;
export { multiply, divide };

// 默认导出
export default function subtract(a, b) {
  return a - b;
}

// 导入方式
// 命名导入
import { add, PI } from './math.js';

// 重命名导入
import { multiply as mul } from './math.js';

// 导入所有
import * as math from './math.js';

// 导入默认
import subtract from './math.js';

// 混合导入
import subtract, { add, PI } from './math.js';
```

### 3.2 动态导入

```javascript
// 按需加载
button.addEventListener('click', async () => {
  const module = await import('./heavy-module.js');
  module.init();
});

// 条件加载
if (condition) {
  import('./module-a.js').then(module => {
    module.run();
  });
} else {
  import('./module-b.js').then(module => {
    module.run();
  });
}
```

### 3.3 ES Module特性

**与CommonJS对比：**

| 特性 | CommonJS | ES Module |
|------|----------|-----------|
| 加载时机 | 运行时 | 编译时 |
| 加载方式 | 同步 | 异步 |
| 输出 | 值拷贝 | 值引用 |
| this指向 | 当前模块 | undefined |
| 支持环境 | Node.js | 浏览器+Node.js |

```javascript
// 值引用示例
// counter.js
export let count = 0;
export function increment() {
  count++;
}

// main.js
import { count, increment } from './counter.js';
console.log(count); // 0
increment();
console.log(count); // 1，引用同一个值
```

## 四、AMD规范

### 4.1 基本语法

```javascript
// 定义模块
define('myModule', ['dependency1', 'dependency2'], function(dep1, dep2) {
  return {
    method: function() {
      // 使用依赖
      dep1.doSomething();
      dep2.doSomethingElse();
    }
  };
});

// 使用模块
require(['myModule'], function(myModule) {
  myModule.method();
});
```

### 4.2 RequireJS配置

```javascript
require.config({
  baseUrl: 'js',
  paths: {
    'jquery': 'lib/jquery',
    'underscore': 'lib/underscore'
  },
  shim: {
    'underscore': {
      exports: '_'
    }
  }
});
```

## 五、UMD规范

### 5.1 兼容多种规范

```javascript
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD
    define(['dependency'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS
    module.exports = factory(require('dependency'));
  } else {
    // 浏览器全局变量
    root.MyModule = factory(root.Dependency);
  }
}(typeof self !== 'undefined' ? self : this, function (Dependency) {
  // 模块代码
  return {
    method: function() {}
  };
}));
```

## 六、模块打包工具

### 6.1 Webpack配置

```javascript
module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  }
};
```

### 6.2 Rollup配置

```javascript
export default {
  input: 'src/main.js',
  output: {
    file: 'dist/bundle.js',
    format: 'esm' // 'cjs', 'umd', 'iife'
  },
  plugins: [
    resolve(),
    commonjs(),
    babel()
  ]
};
```

## 七、最佳实践

### 7.1 模块设计原则

```javascript
// ✅ 单一职责
export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ✅ 避免副作用
export function pureFunction(input) {
  return input * 2; // 不修改外部状态
}

// ❌ 避免循环依赖
// 使用依赖注入或事件系统解决
```

### 7.2 命名规范

```javascript
// 模块文件名：kebab-case
// user-service.js, data-utils.js

// 类名：PascalCase
export class UserService {}

// 函数/变量：camelCase
export function getUserById() {}
export const apiConfig = {};

// 常量：UPPER_SNAKE_CASE
export const MAX_RETRY_COUNT = 3;
```

## 八、面试高频问题

### Q1: CommonJS和ES Module的区别？

**答案：**

1. **加载时机**：CommonJS运行时加载，ES Module编译时加载
2. **输出机制**：CommonJS值拷贝，ES Module值引用
3. **this指向**：CommonJS指向当前模块，ES Module指向undefined
4. **循环依赖**：CommonJS返回已执行部分，ES Module支持更好

### Q2: 如何处理循环依赖？

**答案：**

```javascript
// 方法1：重构代码，消除循环依赖
// 方法2：使用依赖注入
// 方法3：延迟require
function getB() {
  return require('./b');
}
```

### Q3: Tree Shaking的原理？

**答案：**

基于ES Module的静态分析，在编译时确定模块依赖关系，移除未使用的代码。要求：
- 使用ES Module语法
- 避免使用CommonJS
- 配置sideEffects

## 九、总结

### 9.1 技术选型

- **Node.js项目**：CommonJS或ES Module（Node 14+）
- **浏览器项目**：ES Module + 打包工具
- **库开发**：UMD或同时提供多种格式

### 9.2 学习路径

1. 掌握ES Module基本语法
2. 理解CommonJS在Node.js中的应用
3. 学习模块打包工具（Webpack/Rollup）
4. 实践项目中的模块化设计

---

**相关文章：**
- [Webpack完整指南](./webpack-complete-guide.md)
- [包管理器详解](./package-managers.md)
