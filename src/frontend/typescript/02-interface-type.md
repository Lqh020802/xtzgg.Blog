---
title: 接口与类型别名
date: 2025-10-22
icon: logos:typescript-icon
category:
  - TypeScript
tag:
  - Interface
  - Type
  - 类型系统
---

# 接口与类型别名

## 一、接口（Interface）

### 1.1 基本用法

```typescript
interface Person {
  name: string;
  age: number;
}

const person: Person = {
  name: 'John',
  age: 30
};
```

### 1.2 可选属性

```typescript
interface Config {
  color?: string;
  width?: number;
}

const config: Config = { color: 'red' };
```

### 1.3 只读属性

```typescript
interface Point {
  readonly x: number;
  readonly y: number;
}

const p: Point = { x: 10, y: 20 };
// p.x = 5; // Error!
```

### 1.4 索引签名

```typescript
interface StringArray {
  [index: number]: string;
}

const myArray: StringArray = ['Bob', 'Fred'];

interface StringDictionary {
  [key: string]: string;
}

const dict: StringDictionary = {
  name: 'John',
  email: 'john@example.com'
};
```

## 二、接口继承

```typescript
interface Shape {
  color: string;
}

interface Circle extends Shape {
  radius: number;
}

const circle: Circle = {
  color: 'red',
  radius: 10
};

// 多重继承
interface PenStroke {
  penWidth: number;
}

interface Square extends Shape, PenStroke {
  sideLength: number;
}
```

## 三、类型别名（Type）

### 3.1 基本用法

```typescript
type Name = string;
type Age = number;
type User = {
  name: Name;
  age: Age;
};
```

### 3.2 联合类型

```typescript
type ID = number | string;
type Status = 'pending' | 'success' | 'error';

function handleStatus(status: Status) {
  // ...
}
```

### 3.3 交叉类型

```typescript
type Person = {
  name: string;
};

type Employee = {
  employeeId: number;
};

type Staff = Person & Employee;

const staff: Staff = {
  name: 'John',
  employeeId: 12345
};
```

## 四、Interface vs Type

### 4.1 相同点

```typescript
// 都可以描述对象
interface IUser {
  name: string;
}

type TUser = {
  name: string;
};

// 都可以被扩展
interface IExtended extends IUser {
  age: number;
}

type TExtended = TUser & { age: number };
```

### 4.2 不同点

```typescript
// Type可以定义联合类型
type ID = number | string;

// Interface可以声明合并
interface User {
  name: string;
}
interface User {
  age: number;
}
// 合并为 { name: string; age: number }

// Type可以使用映射类型
type ReadOnly<T> = {
  readonly [P in keyof T]: T[P];
};
```

## 五、函数接口

```typescript
interface SearchFunc {
  (source: string, subString: string): boolean;
}

const mySearch: SearchFunc = function(src, sub) {
  return src.search(sub) > -1;
};

// 混合类型
interface Counter {
  (start: number): string;
  interval: number;
  reset(): void;
}

function getCounter(): Counter {
  const counter = function(start: number) {} as Counter;
  counter.interval = 123;
  counter.reset = function() {};
  return counter;
}
```

## 六、类接口

```typescript
interface ClockInterface {
  currentTime: Date;
  setTime(d: Date): void;
}

class Clock implements ClockInterface {
  currentTime: Date = new Date();
  
  setTime(d: Date) {
    this.currentTime = d;
  }
}
```

## 七、泛型接口

```typescript
interface GenericIdentityFn<T> {
  (arg: T): T;
}

function identity<T>(arg: T): T {
  return arg;
}

const myIdentity: GenericIdentityFn<number> = identity;
```

## 八、实战示例

```typescript
// API响应接口
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

interface User {
  id: number;
  name: string;
  email: string;
}

type UserResponse = ApiResponse<User>;
type UserListResponse = ApiResponse<User[]>;

// 表单接口
interface FormField {
  label: string;
  type: 'text' | 'email' | 'password';
  required?: boolean;
  validation?: (value: string) => boolean;
}

interface LoginForm {
  username: FormField;
  password: FormField;
}
```

## 九、总结

- Interface主要用于对象形状定义
- Type更灵活，可以定义联合、交叉类型
- Interface支持声明合并
- 优先使用Interface，需要联合类型时使用Type

---

**相关文章：**
- [TypeScript基础入门](./01-basics.md)
- [类与继承](./03-class-inheritance.md)
