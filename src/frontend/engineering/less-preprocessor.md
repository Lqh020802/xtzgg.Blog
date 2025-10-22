---
title: Less预编译器完整指南
date: 2025-10-22
icon: mdi:language-css3
category:
  - 前端工程化
tag:
  - Less
  - CSS预处理器
  - Sass
  - 样式工程化
---

# Less预编译器完整指南

## 一、CSS预处理器基础

### 1.1 什么是CSS预处理器

**CSS预处理器**是使用类似编程语言的语法编写样式，然后编译为标准CSS的工具。

**主流预处理器：**
- **Less**：基于JavaScript，语法简洁
- **Sass/SCSS**：功能最强大，生态完善
- **Stylus**：语法灵活，可省略符号

### 1.2 Less的优势

```less
// 变量
@primary-color: #007bff;
@border-radius: 4px;

// 嵌套
.card {
  border-radius: @border-radius;
  
  .header {
    color: @primary-color;
  }
}

// 混合
.box-shadow(@x: 0, @y: 2px) {
  box-shadow: @x @y 4px rgba(0, 0, 0, 0.1);
}
```

## 二、Less安装与使用

### 2.1 安装方式

```bash
# 全局安装
npm install -g less

# 项目安装
npm install --save-dev less

# Webpack中使用
npm install --save-dev less less-loader
```

### 2.2 命令行使用

```bash
# 编译Less文件
lessc styles.less styles.css

# 压缩输出
lessc --clean-css styles.less styles.min.css

# 生成source map
lessc --source-map styles.less styles.css

# 监听文件变化
lessc --watch styles.less styles.css
```

### 2.3 在Webpack中配置

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.less$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                modifyVars: {
                  'primary-color': '#1DA57A',
                  'border-radius-base': '4px'
                },
                javascriptEnabled: true
              }
            }
          }
        ]
      }
    ]
  }
};
```

### 2.4 在Vite中配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: {
          'primary-color': '#1DA57A'
        },
        javascriptEnabled: true
      }
    }
  }
});
```

## 三、Less核心语法

### 3.1 变量

```less
// 定义变量
@primary-color: #007bff;
@font-size-base: 14px;
@spacing-unit: 8px;

// 使用变量
.button {
  color: @primary-color;
  font-size: @font-size-base;
  padding: @spacing-unit * 2;
}

// 变量插值
@prefix: ~"my-app";

.@{prefix}-container {
  width: 100%;
}

// 编译为 .my-app-container
```

### 3.2 嵌套规则

```less
.nav {
  background: #f8f9fa;
  
  // 后代选择器
  .nav-item {
    padding: 10px;
    
    // &表示父选择器
    &:hover {
      background: #e9ecef;
    }
    
    &.active {
      color: @primary-color;
    }
  }
  
  // 伪类
  &::before {
    content: '';
  }
}
```

### 3.3 混合（Mixins）

```less
// 基础混合
.border-radius(@radius: 4px) {
  border-radius: @radius;
}

.button {
  .border-radius();      // 使用默认值
  .border-radius(8px);   // 传入参数
}

// 多参数混合
.box-shadow(@x: 0, @y: 2px, @blur: 4px, @color: rgba(0,0,0,0.1)) {
  box-shadow: @x @y @blur @color;
}

// 模式匹配
.triangle(@direction, @size, @color) when (@direction = up) {
  border-left: @size solid transparent;
  border-right: @size solid transparent;
  border-bottom: @size solid @color;
}

.triangle(@direction, @size, @color) when (@direction = down) {
  border-left: @size solid transparent;
  border-right: @size solid transparent;
  border-top: @size solid @color;
}

.arrow-up {
  .triangle(up, 10px, #000);
}
```

### 3.4 运算

```less
@base-width: 100px;
@base-height: 50px;

.box {
  width: @base-width * 2;              // 200px
  height: @base-height + 10px;         // 60px
  padding: (20px / 2);                 // 10px
  margin: @base-width - 20px;          // 80px
  
  // 颜色运算
  background: @primary-color + #111;
  
  // 字符串拼接
  font-family: ~"Arial, sans-serif";
}
```

### 3.5 函数

```less
// 颜色函数
@base-color: #428bca;

.box {
  color: lighten(@base-color, 10%);    // 变亮
  background: darken(@base-color, 10%); // 变暗
  border-color: fadein(@base-color, 10%); // 增加不透明度
  
  // 其他颜色函数
  color: saturate(@base-color, 10%);   // 增加饱和度
  color: desaturate(@base-color, 10%); // 降低饱和度
  color: spin(@base-color, 10);        // 旋转色相
  color: mix(@base-color, #fff, 50%);  // 混合颜色
}

// 数学函数
.box {
  width: percentage(0.5);    // 50%
  height: round(10.6px);     // 11px
  padding: ceil(10.1px);     // 11px
  margin: floor(10.9px);     // 10px
}

// 字符串函数
@url: "images/bg.png";
.box {
  background: url("@{url}");
  content: e("Hello \"World\""); // 转义
}
```

## 四、高级特性

### 4.1 命名空间

```less
// 定义命名空间
#bundle {
  .button {
    border: 1px solid #ccc;
  }
  
  .tab {
    background: #f8f9fa;
  }
}

// 使用
.my-button {
  #bundle > .button();
}
```

### 4.2 作用域

```less
@color: red;

.parent {
  @color: blue;
  
  .child {
    color: @color; // blue（使用最近的作用域）
  }
}

.sibling {
  color: @color; // red（使用全局作用域）
}
```

### 4.3 导入

```less
// 导入Less文件
@import "variables.less";
@import "mixins.less";

// 导入CSS文件（内联）
@import (inline) "normalize.css";

// 导入一次（避免重复）
@import (once) "common.less";

// 可选导入
@import (optional) "theme.less";
```

### 4.4 条件语句

```less
// Guards（守卫）
.mixin(@a) when (@a >= 10) {
  background: red;
}

.mixin(@a) when (@a < 10) {
  background: blue;
}

.box {
  .mixin(15); // background: red
}

// 逻辑运算
.mixin(@a) when (@a > 0) and (@a < 10) {
  // and 逻辑
}

.mixin(@a) when (@a = 5), (@a = 10) {
  // or 逻辑（逗号分隔）
}

.mixin(@a) when not (@a = 0) {
  // not 逻辑
}
```

### 4.5 循环

```less
// 使用递归实现循环
.loop(@counter) when (@counter > 0) {
  .loop((@counter - 1));
  
  .item-@{counter} {
    width: (100% / @counter);
  }
}

.loop(3);

// 生成：
// .item-1 { width: 100%; }
// .item-2 { width: 50%; }
// .item-3 { width: 33.333%; }
```

## 五、实战应用

### 5.1 主题定制

```less
// variables.less
@primary-color: #007bff;
@success-color: #28a745;
@warning-color: #ffc107;
@danger-color: #dc3545;

@font-size-base: 14px;
@line-height-base: 1.5;
@border-radius-base: 4px;

// theme.less
.btn {
  padding: 8px 16px;
  font-size: @font-size-base;
  border-radius: @border-radius-base;
  
  &.btn-primary {
    background: @primary-color;
    color: #fff;
  }
  
  &.btn-success {
    background: @success-color;
    color: #fff;
  }
}
```

### 5.2 响应式设计

```less
// breakpoints.less
@screen-xs: 480px;
@screen-sm: 768px;
@screen-md: 992px;
@screen-lg: 1200px;

// 混合
.responsive(@rules) {
  @media (max-width: @screen-sm) {
    @rules();
  }
}

// 使用
.container {
  width: 1200px;
  
  @media (max-width: @screen-lg) {
    width: 992px;
  }
  
  @media (max-width: @screen-md) {
    width: 768px;
  }
  
  @media (max-width: @screen-sm) {
    width: 100%;
  }
}
```

### 5.3 常用Mixins库

```less
// mixins.less

// 清除浮动
.clearfix() {
  &::after {
    content: '';
    display: table;
    clear: both;
  }
}

// 文本溢出省略
.text-ellipsis() {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// 多行文本省略
.text-ellipsis-multiline(@lines: 2) {
  display: -webkit-box;
  -webkit-line-clamp: @lines;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

// Flexbox居中
.flex-center() {
  display: flex;
  align-items: center;
  justify-content: center;
}

// 绝对居中
.absolute-center() {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

// 渐变背景
.gradient(@start-color, @end-color, @direction: to bottom) {
  background: linear-gradient(@direction, @start-color, @end-color);
}
```

### 5.4 组件化开发

```less
// button.less
@import "variables.less";
@import "mixins.less";

.btn {
  display: inline-block;
  padding: 8px 16px;
  font-size: @font-size-base;
  border-radius: @border-radius-base;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
  
  // 尺寸变体
  &.btn-sm {
    padding: 4px 8px;
    font-size: 12px;
  }
  
  &.btn-lg {
    padding: 12px 24px;
    font-size: 16px;
  }
  
  // 颜色变体
  &.btn-primary {
    background: @primary-color;
    color: #fff;
    
    &:hover {
      background: darken(@primary-color, 10%);
    }
  }
  
  &.btn-outline {
    background: transparent;
    border: 1px solid @primary-color;
    color: @primary-color;
    
    &:hover {
      background: @primary-color;
      color: #fff;
    }
  }
  
  // 状态
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}
```

## 六、Less vs Sass

### 6.1 语法对比

```less
// Less
@primary-color: #007bff;

.button {
  color: @primary-color;
  
  &:hover {
    color: darken(@primary-color, 10%);
  }
}
```

```scss
// Sass/SCSS
$primary-color: #007bff;

.button {
  color: $primary-color;
  
  &:hover {
    color: darken($primary-color, 10%);
  }
}
```

### 6.2 功能对比

| 特性 | Less | Sass |
|------|------|------|
| 变量 | @ | $ |
| 编译环境 | JavaScript | Ruby/Dart |
| 混合参数 | 支持 | 支持 |
| 函数 | 内置函数 | 自定义函数 |
| 条件语句 | Guards | @if/@else |
| 循环 | 递归 | @for/@each/@while |
| 继承 | 混合 | @extend |
| 生态 | 中等 | 丰富 |

## 七、性能优化

### 7.1 减少编译时间

```less
// 避免深层嵌套
// ❌ 不推荐
.a {
  .b {
    .c {
      .d {
        .e {
          color: red;
        }
      }
    }
  }
}

// ✅ 推荐（最多3层）
.a {
  .b-c {
    color: red;
  }
}
```

### 7.2 合理使用混合

```less
// ❌ 不推荐：简单属性不需要混合
.border-color() {
  border-color: #ccc;
}

// ✅ 推荐：复杂逻辑使用混合
.button-variant(@color) {
  background: @color;
  border-color: darken(@color, 5%);
  
  &:hover {
    background: lighten(@color, 5%);
  }
}
```

## 八、最佳实践

### 8.1 文件组织

```bash
styles/
├── variables.less      # 变量定义
├── mixins.less         # 混合函数
├── base.less          # 基础样式
├── components/        # 组件样式
│   ├── button.less
│   ├── card.less
│   └── modal.less
├── pages/             # 页面样式
│   ├── home.less
│   └── about.less
└── main.less          # 入口文件
```

```less
// main.less
@import "variables";
@import "mixins";
@import "base";

@import "components/button";
@import "components/card";
@import "components/modal";
```

### 8.2 命名规范

```less
// BEM命名
.block {
  &__element {
    color: red;
    
    &--modifier {
      color: blue;
    }
  }
}

// 编译为：
// .block { }
// .block__element { color: red; }
// .block__element--modifier { color: blue; }
```

## 九、面试高频问题

### Q1: Less和Sass的区别？

**答案：**
1. **语法**：Less用@定义变量，Sass用$
2. **编译环境**：Less基于JavaScript，Sass基于Ruby/Dart
3. **功能**：Sass功能更强大（自定义函数、更灵活的循环）
4. **生态**：Sass生态更丰富

### Q2: 什么是CSS预处理器的优势？

**答案：**
1. 变量：统一管理颜色、字体等
2. 嵌套：提高代码可读性
3. 混合：代码复用
4. 函数：动态计算值
5. 模块化：更好的代码组织

### Q3: 如何优化Less编译性能？

**答案：**
1. 减少嵌套层级
2. 合理使用混合
3. 避免过度使用函数
4. 使用缓存
5. 按需编译

## 十、总结

### 10.1 核心要点

- 掌握变量、嵌套、混合基本语法
- 理解作用域和继承机制
- 合理组织文件结构
- 注意性能优化
- 遵循命名规范

### 10.2 学习路径

1. 学习基本语法
2. 实践常用混合
3. 掌握高级特性
4. 应用到实际项目
5. 优化编译性能

---

**相关文章：**
- [CSS预处理器对比]()
- [前端工程化](./frontend-engineering.md)
