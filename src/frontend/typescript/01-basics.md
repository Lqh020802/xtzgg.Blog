---
title: TypeScript基础入门
date: 2025-10-22
icon: logos:typescript-icon
category:
  - TypeScript
tag:
  - TypeScript
  - 基础
  - 类型系统
---

# TypeScript基础入门

## 一、环境搭建

### 1.1 安装TypeScript

```bash
# 全局安装
npm install -g typescript

# 查看版本
tsc --version

# 项目安装
npm install --save-dev typescript
```

### 1.2 初始化配置

```bash
# 生成tsconfig.json
tsc --init
```

### 1.3 编译运行

```bash
# 编译单个文件
tsc hello.ts

# 监听模式
tsc --watch

# 使用ts-node直接运行
npx ts-node hello.ts
```

## 二、基本类型

### 2.1 原始类型

```typescript
// 布尔值
let isDone: boolean = false;

// 数字
let decimal: number = 6;
let hex: number = 0xf00d;
let binary: number = 0b1010;

// 字符串
let color: string = "blue";
let fullName: string = `Bob ${color}`;

// undefined和null
let u: undefined = undefined;
let n: null = null;

// Symbol
let sym: symbol = Symbol('key');

// BigInt
let big: bigint = 100n;
```

### 2.2 数组

```typescript
// 两种定义方式
let list1: number[] = [1, 2, 3];
let list2: Array<number> = [1, 2, 3];

// 只读数组
let readonlyList: ReadonlyArray<number> = [1, 2, 3];
// readonlyList[0] = 4; // 错误！
```

### 2.3 元组（Tuple）

```typescript
// 声明元组类型
let x: [string, number];
x = ['hello', 10]; // OK
// x = [10, 'hello']; // Error

// 可选元素
let tuple: [string, number?] = ['hello'];

// 剩余元素
let rest: [string, ...number[]] = ['hello', 1, 2, 3];
```

### 2.4 枚举（Enum）

```typescript
// 数字枚举
enum Direction {
  Up = 1,
  Down,
  Left,
  Right
}
let dir: Direction = Direction.Up; // 1

// 字符串枚举
enum Color {
  Red = 'RED',
  Green = 'GREEN',
  Blue = 'BLUE'
}

// 常量枚举
const enum Enum {
  A = 1,
  B = A * 2
}
```

### 2.5 Any与Unknown

```typescript
// any：关闭类型检查
let notSure: any = 4;
notSure = "maybe a string";
notSure = false;

// unknown：类型安全的any
let value: unknown;
value = true;
value = 42;
value = "Hello";

// 使用前需要类型检查
if (typeof value === 'string') {
  console.log(value.toUpperCase());
}
```

### 2.6 Void、Never

```typescript
// void：没有返回值
function warnUser(): void {
  console.log("This is a warning");
}

// never：永不返回
function error(message: string): never {
  throw new Error(message);
}

function infiniteLoop(): never {
  while (true) {}
}
```

## 三、类型推断

### 3.1 基本推断

```typescript
// TypeScript会自动推断类型
let x = 3; // 推断为number
// x = '3'; // 错误！

let arr = [0, 1, null]; // 推断为 (number | null)[]
```

### 3.2 最佳通用类型

```typescript
let zoo = [new Rhino(), new Elephant(), new Snake()];
// 推断为 (Rhino | Elephant | Snake)[]
```

### 3.3 上下文类型

```typescript
window.onmousedown = function(mouseEvent) {
  console.log(mouseEvent.button); // 正确
  // console.log(mouseEvent.kangaroo); // 错误！
};
```

## 四、类型断言

### 4.1 as语法

```typescript
let someValue: unknown = "this is a string";
let strLength: number = (someValue as string).length;
```

### 4.2 尖括号语法

```typescript
let someValue: unknown = "this is a string";
let strLength: number = (<string>someValue).length;
```

### 4.3 非空断言

```typescript
function liveDangerously(x?: number | null) {
  // 使用!断言x不为null或undefined
  console.log(x!.toFixed());
}
```

## 五、字面量类型

### 5.1 字符串字面量

```typescript
type Direction = "North" | "South" | "East" | "West";

function move(direction: Direction) {
  // ...
}

move("North"); // OK
// move("Northeast"); // Error
```

### 5.2 数字字面量

```typescript
function rollDice(): 1 | 2 | 3 | 4 | 5 | 6 {
  return (Math.floor(Math.random() * 6) + 1) as 1 | 2 | 3 | 4 | 5 | 6;
}
```

### 5.3 布尔字面量

```typescript
type Success = true;
type Failure = false;
```

## 六、联合与交叉类型

### 6.1 联合类型

```typescript
function printId(id: number | string) {
  if (typeof id === "string") {
    console.log(id.toUpperCase());
  } else {
    console.log(id);
  }
}
```

### 6.2 交叉类型

```typescript
interface Person {
  name: string;
}

interface Contact {
  phone: string;
}

type Employee = Person & Contact;

const emp: Employee = {
  name: "John",
  phone: "123456"
};
```

## 七、类型别名

```typescript
// 基本别名
type Name = string;
type NameResolver = () => string;
type NameOrResolver = Name | NameResolver;

// 泛型别名
type Container<T> = { value: T };

// 对象类型别名
type Point = {
  x: number;
  y: number;
};
```

## 八、实战示例

### 8.1 用户信息类型

```typescript
type User = {
  id: number;
  name: string;
  email: string;
  age?: number;
  readonly createdAt: Date;
};

function createUser(name: string, email: string): User {
  return {
    id: Math.random(),
    name,
    email,
    createdAt: new Date()
  };
}
```

### 8.2 API响应类型

```typescript
type ApiResponse<T> = {
  code: number;
  message: string;
  data: T;
};

type UserResponse = ApiResponse<User>;

async function fetchUser(id: number): Promise<UserResponse> {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}
```

## 九、面试高频问题

### Q1: TypeScript相比JavaScript的优势？

**答案：**
1. 静态类型检查，减少运行时错误
2. 更好的IDE支持（智能提示、重构）
3. 更好的代码可维护性
4. 接口和类型系统增强代码可读性
5. 支持最新ES特性

### Q2: any和unknown的区别？

**答案：**
- **any**：关闭类型检查，可以赋值给任何类型
- **unknown**：类型安全的any，使用前必须进行类型检查

### Q3: interface和type的区别？

**答案：**
- interface可以被扩展和合并
- type可以定义联合类型、交叉类型
- interface主要用于对象形状定义
- type更灵活，可以定义原始类型别名

## 十、总结

### 核心要点

- TypeScript是JavaScript的超集
- 提供静态类型检查
- 基本类型：boolean、number、string等
- 高级类型：联合、交叉、字面量
- 类型推断和类型断言

### 学习路径

1. 掌握基本类型
2. 理解类型推断
3. 学习类型断言
4. 练习实际项目

---

**相关文章：**
- [接口与类型别名](./02-interface-type.md)
- [类与继承](./03-class-inheritance.md)
