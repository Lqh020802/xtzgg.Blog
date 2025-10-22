---
title: JavaScript程序设计与分析
date: 2025-10-22
icon: logos:javascript
category:
  - JavaScript
tag:
  - JavaScript
  - 设计模式
  - 算法
  - 性能优化
---

# JavaScript程序设计与分析

## 一、设计原则

### 1.1 SOLID原则

```javascript
// 1. 单一职责原则（Single Responsibility Principle）
// ❌ 不好的设计
class User {
  constructor(name) {
    this.name = name;
  }
  
  saveToDatabase() {
    // 保存用户到数据库
  }
  
  sendEmail() {
    // 发送邮件
  }
}

// ✅ 好的设计
class User {
  constructor(name) {
    this.name = name;
  }
}

class UserRepository {
  save(user) {
    // 保存用户到数据库
  }
}

class EmailService {
  send(user, message) {
    // 发送邮件
  }
}

// 2. 开放封闭原则（Open-Closed Principle）
// 对扩展开放，对修改封闭
class Shape {
  area() {
    throw new Error('Must implement area method');
  }
}

class Circle extends Shape {
  constructor(radius) {
    super();
    this.radius = radius;
  }
  
  area() {
    return Math.PI * this.radius ** 2;
  }
}

class Rectangle extends Shape {
  constructor(width, height) {
    super();
    this.width = width;
    this.height = height;
  }
  
  area() {
    return this.width * this.height;
  }
}

// 3. 里氏替换原则（Liskov Substitution Principle）
// 子类可以替换父类
class Bird {
  fly() {
    console.log('Flying...');
  }
}

class Duck extends Bird {
  swim() {
    console.log('Swimming...');
  }
}

// 4. 接口隔离原则（Interface Segregation Principle）
// 客户端不应该依赖它不需要的接口
class Printer {
  print() {}
}

class Scanner {
  scan() {}
}

class AllInOnePrinter {
  constructor() {
    this.printer = new Printer();
    this.scanner = new Scanner();
  }
  
  print() {
    this.printer.print();
  }
  
  scan() {
    this.scanner.scan();
  }
}

// 5. 依赖倒置原则（Dependency Inversion Principle）
// 依赖抽象而不是具体实现
class Database {
  connect() {
    throw new Error('Must implement connect');
  }
}

class MySQLDatabase extends Database {
  connect() {
    console.log('Connecting to MySQL...');
  }
}

class UserService {
  constructor(database) {
    this.db = database; // 依赖抽象
  }
  
  getUser(id) {
    this.db.connect();
    // 获取用户
  }
}
```

## 二、设计模式

### 2.1 创建型模式

```javascript
// 1. 单例模式
class Singleton {
  static instance = null;
  
  static getInstance() {
    if (!Singleton.instance) {
      Singleton.instance = new Singleton();
    }
    return Singleton.instance;
  }
  
  constructor() {
    if (Singleton.instance) {
      return Singleton.instance;
    }
    Singleton.instance = this;
  }
}

// 2. 工厂模式
class ShapeFactory {
  static createShape(type) {
    switch(type) {
      case 'circle':
        return new Circle();
      case 'rectangle':
        return new Rectangle();
      default:
        throw new Error('Unknown shape type');
    }
  }
}

// 3. 建造者模式
class Computer {
  constructor(builder) {
    this.cpu = builder.cpu;
    this.ram = builder.ram;
    this.storage = builder.storage;
  }
}

class ComputerBuilder {
  setCPU(cpu) {
    this.cpu = cpu;
    return this;
  }
  
  setRAM(ram) {
    this.ram = ram;
    return this;
  }
  
  setStorage(storage) {
    this.storage = storage;
    return this;
  }
  
  build() {
    return new Computer(this);
  }
}

// 使用
const computer = new ComputerBuilder()
  .setCPU('Intel i9')
  .setRAM('32GB')
  .setStorage('1TB SSD')
  .build();
```

### 2.2 结构型模式

```javascript
// 1. 代理模式
class Image {
  constructor(filename) {
    this.filename = filename;
  }
  
  display() {
    console.log(`Displaying ${this.filename}`);
  }
}

class ImageProxy {
  constructor(filename) {
    this.filename = filename;
    this.image = null;
  }
  
  display() {
    if (!this.image) {
      this.image = new Image(this.filename);
    }
    this.image.display();
  }
}

// 2. 装饰器模式
class Coffee {
  cost() {
    return 10;
  }
}

class MilkDecorator {
  constructor(coffee) {
    this.coffee = coffee;
  }
  
  cost() {
    return this.coffee.cost() + 2;
  }
}

class SugarDecorator {
  constructor(coffee) {
    this.coffee = coffee;
  }
  
  cost() {
    return this.coffee.cost() + 1;
  }
}

// 使用
let coffee = new Coffee();
coffee = new MilkDecorator(coffee);
coffee = new SugarDecorator(coffee);
console.log(coffee.cost()); // 13

// 3. 适配器模式
class OldAPI {
  request() {
    return 'Old data';
  }
}

class NewAPI {
  fetch() {
    return 'New data';
  }
}

class APIAdapter {
  constructor(api) {
    this.api = api;
  }
  
  request() {
    return this.api.fetch();
  }
}
```

### 2.3 行为型模式

```javascript
// 1. 观察者模式
class Subject {
  constructor() {
    this.observers = [];
  }
  
  subscribe(observer) {
    this.observers.push(observer);
  }
  
  unsubscribe(observer) {
    this.observers = this.observers.filter(obs => obs !== observer);
  }
  
  notify(data) {
    this.observers.forEach(observer => observer.update(data));
  }
}

class Observer {
  constructor(name) {
    this.name = name;
  }
  
  update(data) {
    console.log(`${this.name} received: ${data}`);
  }
}

// 2. 策略模式
class PaymentStrategy {
  pay(amount) {
    throw new Error('Must implement pay method');
  }
}

class CreditCardPayment extends PaymentStrategy {
  pay(amount) {
    console.log(`Paid ${amount} using Credit Card`);
  }
}

class PayPalPayment extends PaymentStrategy {
  pay(amount) {
    console.log(`Paid ${amount} using PayPal`);
  }
}

class ShoppingCart {
  constructor(paymentStrategy) {
    this.paymentStrategy = paymentStrategy;
  }
  
  checkout(amount) {
    this.paymentStrategy.pay(amount);
  }
}

// 3. 命令模式
class Command {
  execute() {}
  undo() {}
}

class LightOnCommand extends Command {
  constructor(light) {
    super();
    this.light = light;
  }
  
  execute() {
    this.light.on();
  }
  
  undo() {
    this.light.off();
  }
}

class RemoteControl {
  constructor() {
    this.history = [];
  }
  
  execute(command) {
    command.execute();
    this.history.push(command);
  }
  
  undo() {
    const command = this.history.pop();
    if (command) {
      command.undo();
    }
  }
}
```

## 三、算法与数据结构

### 3.1 时间复杂度分析

```javascript
// O(1) - 常数时间
function getFirst(arr) {
  return arr[0];
}

// O(n) - 线性时间
function findMax(arr) {
  let max = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      max = arr[i];
    }
  }
  return max;
}

// O(n²) - 平方时间
function bubbleSort(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}

// O(log n) - 对数时间
function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (arr[mid] === target) {
      return mid;
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  return -1;
}

// O(n log n) - 线性对数时间
function quickSort(arr) {
  if (arr.length <= 1) return arr;
  
  const pivot = arr[arr.length - 1];
  const left = arr.filter((x, i) => x <= pivot && i < arr.length - 1);
  const right = arr.filter(x => x > pivot);
  
  return [...quickSort(left), pivot, ...quickSort(right)];
}
```

### 3.2 常用数据结构

```javascript
// 1. 栈（Stack）
class Stack {
  constructor() {
    this.items = [];
  }
  
  push(element) {
    this.items.push(element);
  }
  
  pop() {
    return this.items.pop();
  }
  
  peek() {
    return this.items[this.items.length - 1];
  }
  
  isEmpty() {
    return this.items.length === 0;
  }
  
  size() {
    return this.items.length;
  }
}

// 2. 队列（Queue）
class Queue {
  constructor() {
    this.items = [];
  }
  
  enqueue(element) {
    this.items.push(element);
  }
  
  dequeue() {
    return this.items.shift();
  }
  
  front() {
    return this.items[0];
  }
  
  isEmpty() {
    return this.items.length === 0;
  }
}

// 3. 链表（Linked List）
class Node {
  constructor(data) {
    this.data = data;
    this.next = null;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
    this.size = 0;
  }
  
  add(data) {
    const node = new Node(data);
    
    if (!this.head) {
      this.head = node;
    } else {
      let current = this.head;
      while (current.next) {
        current = current.next;
      }
      current.next = node;
    }
    
    this.size++;
  }
  
  remove(data) {
    if (!this.head) return;
    
    if (this.head.data === data) {
      this.head = this.head.next;
      this.size--;
      return;
    }
    
    let current = this.head;
    while (current.next) {
      if (current.next.data === data) {
        current.next = current.next.next;
        this.size--;
        return;
      }
      current = current.next;
    }
  }
}

// 4. 二叉树（Binary Tree）
class TreeNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

class BinaryTree {
  constructor() {
    this.root = null;
  }
  
  insert(value) {
    const node = new TreeNode(value);
    
    if (!this.root) {
      this.root = node;
      return;
    }
    
    const insertNode = (root, node) => {
      if (node.value < root.value) {
        if (!root.left) {
          root.left = node;
        } else {
          insertNode(root.left, node);
        }
      } else {
        if (!root.right) {
          root.right = node;
        } else {
          insertNode(root.right, node);
        }
      }
    };
    
    insertNode(this.root, node);
  }
  
  // 中序遍历
  inorderTraversal(node = this.root, result = []) {
    if (node) {
      this.inorderTraversal(node.left, result);
      result.push(node.value);
      this.inorderTraversal(node.right, result);
    }
    return result;
  }
}
```

## 四、性能优化

### 4.1 缓存优化

```javascript
// 记忆化（Memoization）
function memoize(fn) {
  const cache = new Map();
  
  return function(...args) {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn.apply(this, args);
    cache.set(key, result);
    
    return result;
  };
}

// 斐波那契数列优化
const fibonacci = memoize(function(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
});
```

### 4.2 函数式编程

```javascript
// 纯函数
const add = (a, b) => a + b;

// 高阶函数
const map = (fn) => (arr) => arr.map(fn);
const filter = (fn) => (arr) => arr.filter(fn);
const reduce = (fn, init) => (arr) => arr.reduce(fn, init);

// 函数组合
const compose = (...fns) => (x) => 
  fns.reduceRight((acc, fn) => fn(acc), x);

const pipe = (...fns) => (x) => 
  fns.reduce((acc, fn) => fn(acc), x);

// 柯里化
const curry = (fn) => {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return (...moreArgs) => curried.apply(this, [...args, ...moreArgs]);
  };
};
```

## 五、面试高频问题

### Q1: 什么是闭包？应用场景？

**答案：**
闭包是指函数可以访问其外部作用域的变量。

应用场景：
1. 数据私有化
2. 防抖节流
3. 函数柯里化
4. 模块化

### Q2: 如何实现深拷贝？

**答案：**
```javascript
function deepClone(obj, hash = new WeakMap()) {
  if (obj === null) return obj;
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof RegExp) return new RegExp(obj);
  if (typeof obj !== 'object') return obj;
  
  if (hash.has(obj)) return hash.get(obj);
  
  const cloneObj = new obj.constructor();
  hash.set(obj, cloneObj);
  
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloneObj[key] = deepClone(obj[key], hash);
    }
  }
  
  return cloneObj;
}
```

## 六、总结

### 6.1 核心要点

- **设计原则**：SOLID原则指导代码设计
- **设计模式**：解决常见问题的最佳实践
- **算法**：理解时间空间复杂度
- **优化**：缓存、函数式编程提升性能

### 6.2 学习建议

1. 掌握设计原则和模式
2. 练习算法和数据结构
3. 学习性能优化技巧
4. 实践项目应用

---

**相关文章：**
- [手写Promise](./promise-implementation.md)
- [代理与反射](./proxy-reflect.md)
