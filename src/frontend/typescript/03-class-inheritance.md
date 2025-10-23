---
title: 类与继承
date: 2025-10-22
icon: logos:typescript-icon
category:
  - TypeScript
tag:
  - Class
  - 继承
  - 面向对象
  - OOP
---

# 类与继承

## 一、类的定义

### 1.1 基本类定义

```typescript
class Greeter {
  // 属性声明
  greeting: string;
  
  // 构造函数
  constructor(message: string) {
    this.greeting = message;
  }
  
  // 方法
  greet(): string {
    return "Hello, " + this.greeting;
  }
}

// 创建实例
const greeter = new Greeter("world");
console.log(greeter.greet()); // Hello, world
```

### 1.2 属性初始化方式

```typescript
class User {
  // 直接初始化
  name: string = 'Guest';
  
  // 构造函数初始化
  email: string;
  
  // 可选属性
  phone?: string;
  
  // 只读属性
  readonly id: number;
  
  constructor(email: string, id: number) {
    this.email = email;
    this.id = id;
  }
}

const user = new User('user@example.com', 1);
// user.id = 2; // 错误！readonly 属性不能修改
```

### 1.3 参数属性

```typescript
// 简化写法 - 在构造函数参数中使用访问修饰符
class Person {
  constructor(
    public name: string,
    private age: number,
    protected email: string,
    readonly id: number
  ) {
    // 自动创建并初始化属性
  }
  
  getAge(): number {
    return this.age;
  }
}

const person = new Person('John', 30, 'john@example.com', 1);
console.log(person.name); // John
// console.log(person.age); // 错误！private 属性
```

### 1.4 Getter 和 Setter

```typescript
class Employee {
  private _fullName: string = '';
  
  get fullName(): string {
    return this._fullName;
  }
  
  set fullName(newName: string) {
    if (newName && newName.length > 0) {
      this._fullName = newName;
    } else {
      throw new Error('Name cannot be empty');
    }
  }
}

const employee = new Employee();
employee.fullName = 'John Doe';
console.log(employee.fullName); // John Doe
```

## 二、继承

### 2.1 基本继承

```typescript
class Animal {
  name: string;
  
  constructor(name: string) {
    this.name = name;
  }
  
  move(distanceInMeters: number = 0): void {
    console.log(`${this.name} moved ${distanceInMeters}m.`);
  }
}

class Dog extends Animal {
  breed: string;
  
  constructor(name: string, breed: string) {
    super(name); // 调用父类构造函数
    this.breed = breed;
  }
  
  bark(): void {
    console.log('Woof! Woof!');
  }
}

const dog = new Dog('Buddy', 'Labrador');
dog.bark();      // Woof! Woof!
dog.move(10);    // Buddy moved 10m.
```

### 2.2 方法重写

```typescript
class Animal {
  name: string;
  
  constructor(name: string) {
    this.name = name;
  }
  
  makeSound(): void {
    console.log('Some generic sound');
  }
}

class Cat extends Animal {
  // 重写父类方法
  makeSound(): void {
    console.log('Meow!');
  }
  
  // 调用父类方法
  makeSoundLoudly(): void {
    super.makeSound(); // 调用父类方法
    console.log('MEOW!!!');
  }
}

const cat = new Cat('Kitty');
cat.makeSound();       // Meow!
cat.makeSoundLoudly(); // Some generic sound \n MEOW!!!
```

### 2.3 多层继承

```typescript
class LivingBeing {
  breathe(): void {
    console.log('Breathing...');
  }
}

class Animal extends LivingBeing {
  move(): void {
    console.log('Moving...');
  }
}

class Dog extends Animal {
  bark(): void {
    console.log('Barking...');
  }
}

const dog = new Dog();
dog.breathe(); // 继承自 LivingBeing
dog.move();    // 继承自 Animal
dog.bark();    // Dog 自己的方法
```

## 三、访问修饰符

### 3.1 public（公开）

```typescript
class Person {
  public name: string; // 默认就是 public
  
  constructor(name: string) {
    this.name = name;
  }
  
  public greet(): void {
    console.log(`Hello, I'm ${this.name}`);
  }
}

const person = new Person('John');
console.log(person.name);  // 可以访问
person.greet();            // 可以调用
```

### 3.2 private（私有）

```typescript
class BankAccount {
  private balance: number = 0;
  
  constructor(initialBalance: number) {
    this.balance = initialBalance;
  }
  
  deposit(amount: number): void {
    if (amount > 0) {
      this.balance += amount;
    }
  }
  
  getBalance(): number {
    return this.balance;
  }
}

const account = new BankAccount(1000);
account.deposit(500);
console.log(account.getBalance()); // 1500
// console.log(account.balance); // 错误！private 属性
```

### 3.3 protected（受保护）

```typescript
class Person {
  protected name: string;
  
  constructor(name: string) {
    this.name = name;
  }
}

class Employee extends Person {
  private department: string;
  
  constructor(name: string, department: string) {
    super(name);
    this.department = department;
  }
  
  getElevatorPitch(): string {
    // 可以访问父类的 protected 成员
    return `Hello, my name is ${this.name} and I work in ${this.department}.`;
  }
}

const employee = new Employee('John', 'IT');
console.log(employee.getElevatorPitch());
// console.log(employee.name); // 错误！protected 属性只能在类内部访问
```

### 3.4 readonly（只读）

```typescript
class User {
  readonly id: number;
  readonly createdAt: Date;
  name: string;
  
  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
    this.createdAt = new Date();
  }
  
  updateName(newName: string): void {
    this.name = newName; // OK
    // this.id = 2; // 错误！不能修改 readonly 属性
  }
}
```

## 四、静态成员

### 4.1 静态属性和方法

```typescript
class MathUtils {
  static PI: number = 3.14159;
  
  static calculateCircleArea(radius: number): number {
    return this.PI * radius * radius;
  }
  
  static max(...numbers: number[]): number {
    return Math.max(...numbers);
  }
}

// 通过类名访问静态成员
console.log(MathUtils.PI); // 3.14159
console.log(MathUtils.calculateCircleArea(5)); // 78.53975
console.log(MathUtils.max(1, 5, 3, 9, 2)); // 9
```

### 4.2 静态块

```typescript
class Database {
  static connection: any;
  
  static {
    // 静态初始化块
    console.log('Initializing database connection...');
    this.connection = { connected: true };
  }
  
  static connect(): void {
    if (!this.connection.connected) {
      this.connection.connected = true;
    }
  }
}
```

### 4.3 继承中的静态成员

```typescript
class Base {
  static count: number = 0;
  
  static increment(): void {
    this.count++;
  }
}

class Derived extends Base {
  static decrement(): void {
    this.count--;
  }
}

Base.increment();
console.log(Base.count);    // 1
console.log(Derived.count); // 1 - 共享静态成员

Derived.decrement();
console.log(Base.count);    // 0
```

## 五、抽象类

### 5.1 抽象类定义

```typescript
abstract class Shape {
  abstract name: string;
  
  abstract calculateArea(): number;
  
  // 具体方法
  describe(): void {
    console.log(`This is a ${this.name} with area ${this.calculateArea()}`);
  }
}

class Circle extends Shape {
  name: string = 'Circle';
  
  constructor(private radius: number) {
    super();
  }
  
  calculateArea(): number {
    return Math.PI * this.radius ** 2;
  }
}

class Rectangle extends Shape {
  name: string = 'Rectangle';
  
  constructor(private width: number, private height: number) {
    super();
  }
  
  calculateArea(): number {
    return this.width * this.height;
  }
}

const circle = new Circle(5);
circle.describe(); // This is a Circle with area 78.53981633974483

const rectangle = new Rectangle(4, 6);
rectangle.describe(); // This is a Rectangle with area 24
```

### 5.2 抽象类用于设计模式

```typescript
abstract class DataProcessor {
  // 模板方法
  process(): void {
    this.loadData();
    this.processData();
    this.saveData();
  }
  
  abstract loadData(): void;
  abstract processData(): void;
  abstract saveData(): void;
}

class CSVProcessor extends DataProcessor {
  loadData(): void {
    console.log('Loading CSV data...');
  }
  
  processData(): void {
    console.log('Processing CSV data...');
  }
  
  saveData(): void {
    console.log('Saving CSV data...');
  }
}

const processor = new CSVProcessor();
processor.process();
```

## 六、类实现接口

### 6.1 基本实现

```typescript
interface Printable {
  print(): void;
}

interface Loggable {
  log(): void;
}

class Document implements Printable, Loggable {
  constructor(private content: string) {}
  
  print(): void {
    console.log(`Printing: ${this.content}`);
  }
  
  log(): void {
    console.log(`Logging: ${this.content}`);
  }
}
```

### 6.2 接口继承类

```typescript
class Control {
  private state: any;
}

// 接口继承类
interface SelectableControl extends Control {
  select(): void;
}

class Button extends Control implements SelectableControl {
  select(): void {
    console.log('Button selected');
  }
}
```

## 七、实战应用

### 7.1 用户权限系统

```typescript
abstract class User {
  constructor(
    public id: number,
    public username: string,
    protected role: string
  ) {}
  
  abstract getPermissions(): string[];
  
  hasPermission(permission: string): boolean {
    return this.getPermissions().includes(permission);
  }
}

class Admin extends User {
  constructor(id: number, username: string) {
    super(id, username, 'admin');
  }
  
  getPermissions(): string[] {
    return ['read', 'write', 'delete', 'manage'];
  }
}

class RegularUser extends User {
  constructor(id: number, username: string) {
    super(id, username, 'user');
  }
  
  getPermissions(): string[] {
    return ['read'];
  }
}

const admin = new Admin(1, 'admin');
console.log(admin.hasPermission('delete')); // true

const user = new RegularUser(2, 'john');
console.log(user.hasPermission('delete')); // false
```

### 7.2 商品库存管理

```typescript
class Product {
  private static idCounter: number = 1;
  readonly id: number;
  
  constructor(
    public name: string,
    private _price: number,
    private _stock: number
  ) {
    this.id = Product.idCounter++;
  }
  
  get price(): number {
    return this._price;
  }
  
  set price(value: number) {
    if (value < 0) {
      throw new Error('Price cannot be negative');
    }
    this._price = value;
  }
  
  get stock(): number {
    return this._stock;
  }
  
  sell(quantity: number): boolean {
    if (quantity > this._stock) {
      return false;
    }
    this._stock -= quantity;
    return true;
  }
  
  restock(quantity: number): void {
    this._stock += quantity;
  }
}

const product = new Product('Laptop', 999, 10);
console.log(product.sell(3)); // true
console.log(product.stock);   // 7
product.restock(5);
console.log(product.stock);   // 12
```

### 7.3 单例模式

```typescript
class Database {
  private static instance: Database;
  private connected: boolean = false;
  
  // 私有构造函数，防止外部实例化
  private constructor() {
    this.connect();
  }
  
  private connect(): void {
    console.log('Connecting to database...');
    this.connected = true;
  }
  
  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }
  
  query(sql: string): void {
    if (this.connected) {
      console.log(`Executing: ${sql}`);
    }
  }
}

const db1 = Database.getInstance();
const db2 = Database.getInstance();
console.log(db1 === db2); // true - 同一个实例
```

## 八、面试高频问题

### Q1: TypeScript 中的访问修饰符有哪些？

**答案：**
- **public**：公开，默认修饰符，可在任何地方访问
- **private**：私有，只能在类内部访问
- **protected**：受保护，可以在类及其子类中访问
- **readonly**：只读，只能在声明时或构造函数中赋值

### Q2: abstract class 和 interface 的区别？

**答案：**

| 特性 | Abstract Class | Interface |
|------|----------------|-----------|
| 实例化 | 不能直接实例化 | 不能实例化 |
| 实现 | 可以有具体方法 | 只能声明方法签名（TS中可以有默认实现） |
| 继承 | 单继承（extends） | 多实现（implements） |
| 访问修饰符 | 支持 | 不支持 |
| 构造函数 | 可以有 | 不能有 |

使用场景：
- **抽象类**：有共同实现逻辑的基类
- **接口**：定义对象结构，支持多重实现

### Q3: super 关键字的作用？

**答案：**
1. **调用父类构造函数**：
```typescript
class Child extends Parent {
  constructor() {
    super(); // 必须在访问 this 之前调用
  }
}
```

2. **调用父类方法**：
```typescript
class Child extends Parent {
  method() {
    super.method(); // 调用父类的 method
  }
}
```

### Q4: 如何实现私有属性？

**答案：**
```typescript
// 方法 1: private 修饰符
class Person {
  private age: number;
}

// 方法 2: # 私有字段（ES2022）
class Person {
  #age: number;
  
  constructor(age: number) {
    this.#age = age;
  }
}

// 方法 3: WeakMap（运行时私有）
const privateData = new WeakMap();

class Person {
  constructor(age: number) {
    privateData.set(this, { age });
  }
  
  getAge() {
    return privateData.get(this).age;
  }
}
```

## 九、最佳实践

### 9.1 使用参数属性简化代码

```typescript
// 不推荐
class Person {
  name: string;
  age: number;
  
  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }
}

// 推荐
class Person {
  constructor(
    public name: string,
    public age: number
  ) {}
}
```

### 9.2 合理使用访问修饰符

```typescript
class User {
  // 不需要外部访问的属性使用 private
  private password: string;
  
  // 需要子类访问的使用 protected
  protected role: string;
  
  // 公开的 API 使用 public
  public username: string;
  
  constructor(username: string, password: string) {
    this.username = username;
    this.password = password;
    this.role = 'user';
  }
}
```

### 9.3 使用抽象类定义模板

```typescript
abstract class BaseService {
  abstract getData(): Promise<any>;
  
  async execute() {
    const data = await this.getData();
    this.processData(data);
    return data;
  }
  
  protected processData(data: any): void {
    // 通用处理逻辑
    console.log('Processing:', data);
  }
}
```

## 十、总结

### 核心要点

- **类定义**：属性、方法、构造函数
- **继承**：extends、super、方法重写
- **访问修饰符**：public、private、protected、readonly
- **静态成员**：类级别的属性和方法
- **抽象类**：定义基类，强制子类实现

### 学习建议

1. 理解 OOP 基本概念
2. 掌握访问修饰符的使用场景
3. 学会使用抽象类和接口
4. 实践设计模式
5. 关注代码的可维护性

---

**相关文章：**
- [接口与类型别名](./02-interface-type.md)
- [函数与泛型](./04-function-generic.md)
- [TypeScript基础入门](./01-basics.md)
