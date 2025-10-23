---
title: 模块与命名空间
date: 2025-10-22
icon: logos:typescript-icon
category:
  - TypeScript
tag:
  - Module
  - Namespace
  - 模块化
---

# 模块与命名空间

## 一、ES模块

### 1.1 导出（Export）

```typescript
// math.ts

// 命名导出
export function add(x: number, y: number): number {
  return x + y;
}

export function subtract(x: number, y: number): number {
  return x - y;
}

export const PI = 3.14159;

// 导出接口
export interface Calculator {
  add(a: number, b: number): number;
  subtract(a: number, b: number): number;
}

// 导出类型
export type Operation = 'add' | 'subtract' | 'multiply' | 'divide';

// 重新导出
export { multiply } from './advanced-math';
```

### 1.2 导入（Import）

```typescript
// 命名导入
import { add, subtract } from './math';

// 重命名导入
import { add as addition } from './math';

// 导入全部
import * as Math from './math';
Math.add(1, 2);

// 默认导入
import Calculator from './calculator';

// 混合导入
import Calculator, { add, PI } from './math';

// 仅导入类型
import type { Calculator } from './math';

// 动态导入
async function loadMath() {
  const math = await import('./math');
  return math.add(1, 2);
}
```

### 1.3 默认导出

```typescript
// calculator.ts
export default class Calculator {
  add(a: number, b: number): number {
    return a + b;
  }
}

// 或者
class Calculator {
  // ...
}
export default Calculator;

// 使用
import Calculator from './calculator';
const calc = new Calculator();
```

## 二、命名空间（Namespace）

### 2.1 基本用法

```typescript
namespace Validation {
  export interface StringValidator {
    isAcceptable(s: string): boolean;
  }
  
  const lettersRegexp = /^[A-Za-z]+$/;
  const numberRegexp = /^[0-9]+$/;
  
  export class LettersOnlyValidator implements StringValidator {
    isAcceptable(s: string) {
      return lettersRegexp.test(s);
    }
  }
  
  export class NumbersOnlyValidator implements StringValidator {
    isAcceptable(s: string) {
      return numberRegexp.test(s);
    }
  }
}

// 使用
const validator = new Validation.LettersOnlyValidator();
validator.isAcceptable("abc"); // true
```

### 2.2 命名空间嵌套

```typescript
namespace Shapes {
  export namespace Polygons {
    export class Triangle {
      constructor(public sides: number = 3) {}
    }
    
    export class Square {
      constructor(public sides: number = 4) {}
    }
  }
  
  export namespace Circles {
    export class Circle {
      constructor(public radius: number) {}
      
      area(): number {
        return Math.PI * this.radius ** 2;
      }
    }
  }
}

// 使用
const triangle = new Shapes.Polygons.Triangle();
const circle = new Shapes.Circles.Circle(10);
```

### 2.3 命名空间别名

```typescript
import Polygons = Shapes.Polygons;

const square = new Polygons.Square();
```

## 三、模块解析

### 3.1 相对导入与非相对导入

```typescript
// 相对导入
import { add } from './math';           // 同目录
import { User } from '../models/user';   // 上级目录
import { API } from '../../api';        // 上上级目录

// 非相对导入
import * as React from 'react';         // node_modules
import { Component } from '@angular/core';
```

### 3.2 路径映射

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@utils/*": ["src/utils/*"]
    }
  }
}
```

```typescript
// 使用路径映射
import { Button } from '@components/Button';
import { formatDate } from '@utils/date';
```

## 四、声明合并

### 4.1 接口合并

```typescript
interface Box {
  height: number;
  width: number;
}

interface Box {
  scale: number;
}

// 合并后的接口
const box: Box = {
  height: 5,
  width: 6,
  scale: 10
};
```

### 4.2 命名空间合并

```typescript
namespace Animals {
  export class Dog {}
}

namespace Animals {
  export class Cat {}
}

// 可以使用
const dog = new Animals.Dog();
const cat = new Animals.Cat();
```

### 4.3 命名空间与类合并

```typescript
class Album {
  label: Album.AlbumLabel = new Album.AlbumLabel();
}

namespace Album {
  export class AlbumLabel {
    name: string = "Default";
  }
}
```

## 五、声明文件（.d.ts）

### 5.1 全局声明

```typescript
// global.d.ts
declare global {
  interface Window {
    myCustomProperty: string;
  }
  
  var MY_GLOBAL: string;
}

export {};
```

### 5.2 模块声明

```typescript
// types/lodash.d.ts
declare module 'lodash' {
  export function map<T, U>(
    collection: T[],
    iteratee: (value: T) => U
  ): U[];
  
  export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): T;
}
```

### 5.3 UMD模块

```typescript
// types/jquery.d.ts
export as namespace jQuery;
export = jQuery;

declare function jQuery(selector: string): any;

declare namespace jQuery {
  function ajax(url: string, settings?: any): any;
}
```

## 六、实战应用

### 6.1 工具函数模块

```typescript
// utils/string.ts
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.slice(0, length) + '...' : str;
}

export function slugify(str: string): string {
  return str.toLowerCase().replace(/\s+/g, '-');
}

// utils/index.ts
export * from './string';
export * from './array';
export * from './object';
```

### 6.2 API模块化

```typescript
// api/user.ts
import { request } from './request';

export interface User {
  id: number;
  name: string;
  email: string;
}

export async function getUser(id: number): Promise<User> {
  return request<User>(`/users/${id}`);
}

export async function updateUser(id: number, data: Partial<User>): Promise<User> {
  return request<User>(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

// api/index.ts
export * from './user';
export * from './post';
export * from './comment';
```

## 七、面试高频问题

### Q1: 模块与命名空间的区别？

**答案：**
- **模块**：
  - 使用ES6模块语法（import/export）
  - 每个文件是独立模块
  - 推荐使用，更符合现代标准
  - 支持Tree Shaking

- **命名空间**：
  - 使用namespace关键字
  - 主要用于组织代码
  - 适合内部模块组织
  - 编译后是IIFE

### Q2: 如何组织大型项目的模块结构？

**答案：**
```
src/
├── api/          # API接口
├── components/   # 组件
├── utils/        # 工具函数
├── types/        # 类型定义
├── constants/    # 常量
├── hooks/        # 自定义Hooks
└── index.ts      # 入口文件
```

### Q3: 三斜线指令的作用？

**答案：**
```typescript
/// <reference path="..." />    // 引用文件
/// <reference types="..." />   // 引用类型包
/// <reference lib="..." />     // 引用库
```
现代项目中很少使用，推荐使用import。

## 八、总结

### 核心要点

- **ES模块**：现代化的模块系统
- **命名空间**：适合内部代码组织
- **声明合并**：扩展已有类型
- **声明文件**：为JavaScript库提供类型

### 最佳实践

1. 优先使用ES模块
2. 合理组织目录结构
3. 使用路径映射简化导入
4. 为第三方库编写类型声明

---

**相关文章：**
- [高级类型](./05-advanced-types.md)
- [装饰器](./07-decorator.md)
- [tsconfig配置详解](./09-tsconfig.md)
