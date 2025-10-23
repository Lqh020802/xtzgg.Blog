---
title: 函数与泛型
date: 2025-10-22
icon: logos:typescript-icon
category:
  - TypeScript
tag:
  - Function
  - Generic
  - 泛型
  - 函数类型
---

# 函数与泛型

## 一、函数类型定义

### 1.1 函数声明

```typescript
// 普通函数
function add(x: number, y: number): number {
  return x + y;
}

// 箭头函数
const subtract = (x: number, y: number): number => x - y;

// 匿名函数（类型推断）
const numbers = [1, 2, 3];
numbers.forEach((num) => console.log(num)); // num 自动推断为 number
```

### 1.2 函数类型表达式

```typescript
// 定义函数类型
type MathOperation = (x: number, y: number) => number;

const multiply: MathOperation = (x, y) => x * y;
const divide: MathOperation = (x, y) => x / y;

// 使用接口定义函数类型
interface Calculator {
  (x: number, y: number): number;
}

const add: Calculator = (x, y) => x + y;
```

### 1.3 调用签名

```typescript
type DescribableFunction = {
  description: string;
  (arg: number): string;
};

function doSomething(fn: DescribableFunction) {
  console.log(fn.description + " returned " + fn(6));
}

function myFunc(arg: number): string {
  return `Value is ${arg}`;
}
myFunc.description = "My function";

doSomething(myFunc);
```

### 1.4 构造签名

```typescript
// 构造函数类型
type SomeConstructor = {
  new (s: string): object;
};

function create(Ctor: SomeConstructor): object {
  return new Ctor("hello");
}

class Person {
  constructor(public name: string) {}
}

const person = create(Person);
```

## 二、函数参数

### 2.1 可选参数

```typescript
function buildName(firstName: string, lastName?: string): string {
  return lastName ? `${firstName} ${lastName}` : firstName;
}

console.log(buildName("John")); // John
console.log(buildName("John", "Doe")); // John Doe
```

### 2.2 默认参数

```typescript
function greet(name: string, greeting: string = "Hello"): string {
  return `${greeting}, ${name}!`;
}

console.log(greet("John")); // Hello, John!
console.log(greet("John", "Hi")); // Hi, John!

// 默认参数可以在前面
function calculate(x = 10, y: number): number {
  return x + y;
}

calculate(undefined, 5); // 15
```

### 2.3 剩余参数

```typescript
function sum(...numbers: number[]): number {
  return numbers.reduce((acc, num) => acc + num, 0);
}

console.log(sum(1, 2, 3, 4)); // 10
console.log(sum(1, 2)); // 3

// 剩余参数与其他参数结合
function multiply(multiplier: number, ...numbers: number[]): number[] {
  return numbers.map(n => n * multiplier);
}

console.log(multiply(2, 1, 2, 3)); // [2, 4, 6]
```

### 2.4 参数解构

```typescript
// 对象解构
function printUser({ name, age }: { name: string; age: number }): void {
  console.log(`${name} is ${age} years old`);
}

printUser({ name: "John", age: 30 });

// 使用类型别名
type User = { name: string; age: number };

function printUser2({ name, age }: User): void {
  console.log(`${name} is ${age} years old`);
}

// 数组解构
function sum2([a, b]: [number, number]): number {
  return a + b;
}

sum2([1, 2]); // 3
```

## 三、函数重载

### 3.1 基本重载

```typescript
// 重载签名
function reverse(x: string): string;
function reverse(x: number): number;

// 实现签名
function reverse(x: string | number): string | number {
  if (typeof x === 'string') {
    return x.split('').reverse().join('');
  }
  return Number(x.toString().split('').reverse().join(''));
}

console.log(reverse("hello")); // "olleh"
console.log(reverse(12345)); // 54321
```

### 3.2 复杂重载

```typescript
function makeDate(timestamp: number): Date;
function makeDate(year: number, month: number, day: number): Date;
function makeDate(yearOrTimestamp: number, month?: number, day?: number): Date {
  if (month !== undefined && day !== undefined) {
    return new Date(yearOrTimestamp, month, day);
  }
  return new Date(yearOrTimestamp);
}

const date1 = makeDate(1234567890000);
const date2 = makeDate(2024, 10, 22);
// const date3 = makeDate(2024, 10); // 错误：没有匹配的重载
```

### 3.3 重载的最佳实践

```typescript
// 不好的重载
function len(s: string): number;
function len(arr: any[]): number;
function len(x: any): number {
  return x.length;
}

// 更好的方式：使用联合类型
function len2(x: string | any[]): number {
  return x.length;
}
```

## 四、this 类型

### 4.1 this 参数

```typescript
interface DB {
  filterUsers(filter: (this: User) => boolean): User[];
}

interface User {
  id: number;
  admin: boolean;
}

const db: DB = {
  filterUsers(filter: (this: User) => boolean) {
    const users: User[] = [
      { id: 1, admin: true },
      { id: 2, admin: false }
    ];
    
    return users.filter(user => filter.call(user));
  }
};

const admins = db.filterUsers(function(this: User) {
  return this.admin;
});
```

### 4.2 this 类型返回值

```typescript
class Calculator {
  protected value = 0;
  
  add(n: number): this {
    this.value += n;
    return this;
  }
  
  subtract(n: number): this {
    this.value -= n;
    return this;
  }
  
  getValue(): number {
    return this.value;
  }
}

class ScientificCalculator extends Calculator {
  square(): this {
    this.value = this.value ** 2;
    return this;
  }
}

const calc = new ScientificCalculator();
calc.add(5).square().subtract(10).getValue(); // 15
```

## 五、泛型函数

### 5.1 基本泛型函数

```typescript
// 泛型函数
function identity<T>(arg: T): T {
  return arg;
}

// 显式指定类型
const num = identity<number>(42);

// 类型推断
const str = identity("hello"); // T 推断为 string

// 泛型数组
function loggingIdentity<T>(arg: T[]): T[] {
  console.log(arg.length);
  return arg;
}

loggingIdentity([1, 2, 3]);
```

### 5.2 多个泛型参数

```typescript
function pair<T, U>(first: T, second: U): [T, U] {
  return [first, second];
}

const p1 = pair("hello", 42); // [string, number]
const p2 = pair(true, "world"); // [boolean, string]

// 交换元组
function swap<T, U>(tuple: [T, U]): [U, T] {
  return [tuple[1], tuple[0]];
}

const swapped = swap(["hello", 42]); // [number, string]
```

### 5.3 泛型接口

```typescript
interface GenericIdentityFn<T> {
  (arg: T): T;
}

function identity<T>(arg: T): T {
  return arg;
}

const myIdentity: GenericIdentityFn<number> = identity;
const result = myIdentity(42); // number

// 泛型接口定义对象
interface Container<T> {
  value: T;
  getValue(): T;
  setValue(value: T): void;
}

const stringContainer: Container<string> = {
  value: "hello",
  getValue() {
    return this.value;
  },
  setValue(value: string) {
    this.value = value;
  }
};
```

### 5.4 泛型类

```typescript
class GenericNumber<T> {
  zeroValue: T;
  add: (x: T, y: T) => T;
  
  constructor(zeroValue: T, add: (x: T, y: T) => T) {
    this.zeroValue = zeroValue;
    this.add = add;
  }
}

const myGenericNumber = new GenericNumber<number>(0, (x, y) => x + y);
console.log(myGenericNumber.add(5, 10)); // 15

const stringNumeric = new GenericNumber<string>("", (x, y) => x + y);
console.log(stringNumeric.add("Hello ", "World")); // "Hello World"
```

## 六、泛型约束

### 6.1 基本约束

```typescript
interface Lengthwise {
  length: number;
}

function loggingIdentity<T extends Lengthwise>(arg: T): T {
  console.log(arg.length); // OK: T 必须有 length 属性
  return arg;
}

loggingIdentity("hello"); // OK
loggingIdentity([1, 2, 3]); // OK
loggingIdentity({ length: 10, value: 3 }); // OK
// loggingIdentity(3); // 错误：number 没有 length 属性
```

### 6.2 使用类型参数约束

```typescript
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const person = { name: "John", age: 30 };

getProperty(person, "name"); // OK
getProperty(person, "age"); // OK
// getProperty(person, "email"); // 错误：email 不存在
```

### 6.3 在泛型约束中使用类类型

```typescript
function create<T>(c: new () => T): T {
  return new c();
}

class Person {
  name = "John";
}

const person = create(Person); // Person

// 更复杂的例子
class BeeKeeper {
  hasMask = true;
}

class ZooKeeper {
  nametag = "Mike";
}

class Animal {
  numLegs = 4;
}

class Bee extends Animal {
  keeper: BeeKeeper = new BeeKeeper();
}

class Lion extends Animal {
  keeper: ZooKeeper = new ZooKeeper();
}

function createInstance<A extends Animal>(c: new () => A): A {
  return new c();
}

const bee = createInstance(Bee);
console.log(bee.keeper.hasMask); // true
```

## 七、实战应用

### 7.1 通用 API 请求

```typescript
interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
}

async function request<T>(
  url: string,
  options?: RequestOptions
): Promise<ApiResponse<T>> {
  const response = await fetch(url, {
    method: options?.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    },
    body: options?.body ? JSON.stringify(options.body) : undefined
  });
  
  return response.json();
}

// 使用
interface User {
  id: number;
  name: string;
  email: string;
}

const userResponse = await request<User>('/api/user/1');
console.log(userResponse.data.name);

const usersResponse = await request<User[]>('/api/users');
console.log(usersResponse.data.length);
```

### 7.2 状态管理工具

```typescript
type Listener<T> = (state: T) => void;

class Store<T> {
  private state: T;
  private listeners: Listener<T>[] = [];
  
  constructor(initialState: T) {
    this.state = initialState;
  }
  
  getState(): T {
    return this.state;
  }
  
  setState(newState: Partial<T>): void {
    this.state = { ...this.state, ...newState };
    this.notify();
  }
  
  subscribe(listener: Listener<T>): () => void {
    this.listeners.push(listener);
    
    // 返回取消订阅函数
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
  
  private notify(): void {
    this.listeners.forEach(listener => listener(this.state));
  }
}

// 使用
interface AppState {
  count: number;
  user: { name: string } | null;
}

const store = new Store<AppState>({
  count: 0,
  user: null
});

const unsubscribe = store.subscribe(state => {
  console.log('State changed:', state);
});

store.setState({ count: 1 });
store.setState({ user: { name: 'John' } });
```

### 7.3 数组工具函数

```typescript
// 去重
function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

// 分组
function groupBy<T, K extends keyof any>(
  arr: T[],
  key: (item: T) => K
): Record<K, T[]> {
  return arr.reduce((result, item) => {
    const k = key(item);
    if (!result[k]) {
      result[k] = [];
    }
    result[k].push(item);
    return result;
  }, {} as Record<K, T[]>);
}

// 使用
interface Product {
  id: number;
  name: string;
  category: string;
}

const products: Product[] = [
  { id: 1, name: 'Laptop', category: 'Electronics' },
  { id: 2, name: 'Phone', category: 'Electronics' },
  { id: 3, name: 'Book', category: 'Books' }
];

const grouped = groupBy(products, item => item.category);
// { Electronics: [...], Books: [...] }
```

## 八、面试高频问题

### Q1: 什么时候使用函数重载？

**答案：**
当函数根据不同的参数类型或数量返回不同类型的结果时使用。

```typescript
function getValue(key: 'name'): string;
function getValue(key: 'age'): number;
function getValue(key: string): string | number {
  const data = { name: 'John', age: 30 };
  return data[key as keyof typeof data];
}
```

但如果可以用联合类型解决，优先使用联合类型。

### Q2: 泛型的作用是什么？

**答案：**
1. **类型复用**：避免重复定义相似的类型
2. **类型安全**：保持输入输出类型的一致性
3. **灵活性**：让函数/类适用于多种类型

```typescript
// 没有泛型
function identityNumber(arg: number): number {
  return arg;
}

function identityString(arg: string): string {
  return arg;
}

// 使用泛型
function identity<T>(arg: T): T {
  return arg;
}
```

### Q3: extends 在泛型中的作用？

**答案：**
用于约束泛型参数必须满足某个条件。

```typescript
// 约束必须有 length 属性
function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
}

// 约束必须是对象的键
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
```

### Q4: 如何定义一个接受任意函数的泛型？

**答案：**
```typescript
type AnyFunction = (...args: any[]) => any;

function once<T extends AnyFunction>(fn: T): T {
  let called = false;
  let result: ReturnType<T>;
  
  return ((...args: Parameters<T>) => {
    if (!called) {
      called = true;
      result = fn(...args);
    }
    return result;
  }) as T;
}
```

## 九、最佳实践

### 9.1 泛型命名

```typescript
// 单个泛型：使用 T
function identity<T>(arg: T): T {
  return arg;
}

// 多个泛型：使用有意义的名称
function map<Input, Output>(
  arr: Input[],
  func: (arg: Input) => Output
): Output[] {
  return arr.map(func);
}

// 或使用传统命名
function pair<T, U>(first: T, second: U): [T, U] {
  return [first, second];
}
```

### 9.2 避免过度使用泛型

```typescript
// 不好：不需要泛型
function greet<T extends string>(name: T): string {
  return `Hello, ${name}`;
}

// 好：直接使用 string
function greet(name: string): string {
  return `Hello, ${name}`;
}
```

### 9.3 使用泛型约束

```typescript
// 不好：没有约束
function longest<T>(a: T, b: T): T {
  // return a.length >= b.length ? a : b; // 错误
  return a;
}

// 好：添加约束
function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
}
```

## 十、总结

### 核心要点

- **函数类型**：多种定义方式，支持重载
- **泛型**：类型复用，保持类型安全
- **泛型约束**：限制泛型参数范围
- **实战应用**：API 请求、状态管理、工具函数

### 学习建议

1. 理解泛型的本质是类型参数化
2. 掌握泛型约束的使用
3. 学会在实际项目中应用泛型
4. 避免过度设计，保持简单

---

**相关文章：**
- [类与继承](./03-class-inheritance.md)
- [高级类型](./05-advanced-types.md)
- [TypeScript基础入门](./01-basics.md)
