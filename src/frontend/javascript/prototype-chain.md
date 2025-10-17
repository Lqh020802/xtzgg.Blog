---
title: 原型链
icon: logos:javascript
---

# 原型链

在 JavaScript 中，**原型链（Prototype Chain）** 是实现对象属性继承与共享的底层机制，基于对象间通过隐式指针形成的链式关联，解决了单继承模型下的代码复用问题。

## 1. 原型链的构成

### 1.1 核心概念

原型链由以下四个部分组成：

```
┌─────────────────┐
│ 构造函数         │
│ (Constructor)   │
└────────┬────────┘
         │ prototype
         ↓
┌─────────────────┐
│ 原型对象         │
│ (Prototype)     │
└────────┬────────┘
         │ __proto__
         ↓
┌─────────────────┐
│ 实例对象         │
│ (Instance)      │
└────────┬────────┘
         │ __proto__
         ↓
┌─────────────────┐
│ 原型链终点       │
│ (null)          │
└─────────────────┘
```

### 1.2 四个关键角色

#### 1. 构造函数（Constructor）

```javascript
// 构造函数
function Person(name, age) {
  this.name = name;
  this.age = age;
}

// 构造函数是一个普通函数
console.log(typeof Person);  // 'function'

// 构造函数有 prototype 属性
console.log(Person.prototype);  // { constructor: Person }
```

#### 2. 原型对象（Prototype Object）

```javascript
// 原型对象是一个普通对象
console.log(typeof Person.prototype);  // 'object'

// 在原型对象上添加方法
Person.prototype.sayHello = function() {
  console.log(`Hello, I'm ${this.name}`);
};

// 原型对象有 constructor 属性，指向构造函数
console.log(Person.prototype.constructor === Person);  // true
```

#### 3. 实例对象（Instance）

```javascript
// 通过 new 创建实例
const person1 = new Person('张三', 25);

// 实例对象有 __proto__ 属性（隐式原型）
console.log(person1.__proto__ === Person.prototype);  // true

// 实例可以访问原型上的方法
person1.sayHello();  // Hello, I'm 张三
```

#### 4. 原型链终点（null）

```javascript
// 原型链的终点是 null
console.log(Object.prototype.__proto__);  // null
```

## 2. 原型链的形成与查找机制

### 2.1 原型链的形成

**原型链由实例的 `__proto__` 逐级向上关联形成。**

```javascript
function Person(name) {
  this.name = name;
}

Person.prototype.sayHello = function() {
  console.log(`Hello, ${this.name}`);
};

const person = new Person('张三');

// 原型链关系
console.log(person.__proto__ === Person.prototype);           // true
console.log(Person.prototype.__proto__ === Object.prototype); // true
console.log(Object.prototype.__proto__ === null);             // true

// 完整的原型链
person
  ↓ __proto__
Person.prototype
  ↓ __proto__
Object.prototype
  ↓ __proto__
null
```

### 2.2 属性查找机制

**当访问对象的某个属性/方法时，JavaScript 引擎遵循以下查找规则：**

```
1. 先在对象自身查找
   ↓ 找到 → 直接返回
   ↓ 未找到
2. 沿 __proto__ 指向的原型对象查找
   ↓ 找到 → 返回
   ↓ 未找到
3. 继续沿原型对象的 __proto__ 向上查找
   ↓ 找到 → 返回
   ↓ 未找到
4. 到达原型链终点（null）
   ↓
5. 返回 undefined
```

### 2.3 查找示例

```javascript
function Person(name) {
  this.name = name;
}

Person.prototype.age = 18;
Person.prototype.sayHello = function() {
  console.log('Hello');
};

Object.prototype.country = 'China';

const person = new Person('张三');

// 1. 查找自身属性（找到）
console.log(person.name);  // '张三'

// 2. 查找原型属性（在 Person.prototype 找到）
console.log(person.age);   // 18
person.sayHello();         // 'Hello'

// 3. 查找顶层原型属性（在 Object.prototype 找到）
console.log(person.country);  // 'China'

// 4. 查找不存在的属性（返回 undefined）
console.log(person.gender);   // undefined

// 5. 验证查找路径
console.log(person.hasOwnProperty('name'));     // true（自身属性）
console.log(person.hasOwnProperty('age'));      // false（原型属性）
console.log(person.hasOwnProperty('country'));  // false（顶层原型属性）
```

### 2.4 查找流程详解

```javascript
function Animal(name) {
  this.name = name;
}

Animal.prototype.eat = function() {
  console.log(`${this.name} is eating`);
};

const dog = new Animal('Dog');

// 访问 dog.eat() 的查找流程：
// 
// 步骤 1：在 dog 自身查找 eat 方法
// ↓ 未找到
// 
// 步骤 2：通过 dog.__proto__ 到 Animal.prototype 查找
// ↓ 找到了 eat 方法
// 
// 步骤 3：执行 eat 方法
dog.eat();  // 'Dog is eating'

// 访问 dog.toString() 的查找流程：
// 
// 步骤 1：在 dog 自身查找 toString 方法
// ↓ 未找到
// 
// 步骤 2：通过 dog.__proto__ 到 Animal.prototype 查找
// ↓ 未找到
// 
// 步骤 3：通过 Animal.prototype.__proto__ 到 Object.prototype 查找
// ↓ 找到了 toString 方法
// 
// 步骤 4：执行 toString 方法
console.log(dog.toString());  // '[object Object]'
```

## 3. 关键属性和方法

### 3.1 prototype（显式原型）

**`prototype` 是构造函数的属性，指向原型对象。**

```javascript
function Person(name) {
  this.name = name;
}

// 构造函数有 prototype 属性
console.log(Person.prototype);

// 可以在 prototype 上添加共享方法
Person.prototype.sayHello = function() {
  console.log(`Hello, ${this.name}`);
};

// 所有实例共享原型上的方法
const p1 = new Person('张三');
const p2 = new Person('李四');

p1.sayHello();  // 'Hello, 张三'
p2.sayHello();  // 'Hello, 李四'

// 两个实例的 sayHello 是同一个函数
console.log(p1.sayHello === p2.sayHello);  // true
```

### 3.2 __proto__（隐式原型）

**`__proto__` 是对象的属性，指向其构造函数的原型对象。**

```javascript
function Person(name) {
  this.name = name;
}

const person = new Person('张三');

// 实例的 __proto__ 指向构造函数的 prototype
console.log(person.__proto__ === Person.prototype);  // true

// __proto__ 是一个访问器属性（getter/setter）
console.log(Object.getOwnPropertyDescriptor(Object.prototype, '__proto__'));

// 推荐使用 Object.getPrototypeOf() 代替 __proto__
console.log(Object.getPrototypeOf(person) === Person.prototype);  // true
```

### 3.3 constructor（构造器）

**`constructor` 是原型对象的属性，指向构造函数。**

```javascript
function Person(name) {
  this.name = name;
}

const person = new Person('张三');

// 原型对象的 constructor 指向构造函数
console.log(Person.prototype.constructor === Person);  // true

// 实例可以通过原型链访问 constructor
console.log(person.constructor === Person);  // true

// 可以通过 constructor 创建新实例
const person2 = new person.constructor('李四');
console.log(person2.name);  // '李四'
```

### 3.4 关系图

```javascript
function Person(name) {
  this.name = name;
}

const person = new Person('张三');

// 完整的关系图
Person.prototype.constructor === Person  // ✅ 原型的 constructor 指向构造函数
person.__proto__ === Person.prototype    // ✅ 实例的 __proto__ 指向原型
person.constructor === Person            // ✅ 实例的 constructor（通过原型链）指向构造函数
```

## 4. 原型链的应用

### 4.1 方法共享

```javascript
function Person(name, age) {
  this.name = name;
  this.age = age;
}

// 将方法定义在原型上，所有实例共享
Person.prototype.sayHello = function() {
  console.log(`Hello, I'm ${this.name}, ${this.age} years old`);
};

Person.prototype.getAge = function() {
  return this.age;
};

// 创建多个实例
const p1 = new Person('张三', 25);
const p2 = new Person('李四', 30);

// 所有实例共享同一个方法（节省内存）
console.log(p1.sayHello === p2.sayHello);  // true

// 对比：如果在构造函数中定义方法（不推荐）
function BadPerson(name) {
  this.name = name;
  this.sayHello = function() {  // ❌ 每个实例都有独立的方法
    console.log(`Hello, ${this.name}`);
  };
}

const b1 = new BadPerson('张三');
const b2 = new BadPerson('李四');

console.log(b1.sayHello === b2.sayHello);  // false（浪费内存）
```

### 4.2 继承

```javascript
// 父类
function Animal(name) {
  this.name = name;
}

Animal.prototype.eat = function() {
  console.log(`${this.name} is eating`);
};

// 子类
function Dog(name, breed) {
  Animal.call(this, name);  // 继承属性
  this.breed = breed;
}

// 继承方法（设置原型链）
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

// 子类添加自己的方法
Dog.prototype.bark = function() {
  console.log(`${this.name} is barking`);
};

// 测试
const dog = new Dog('旺财', '哈士奇');
dog.eat();   // '旺财 is eating'（继承自 Animal）
dog.bark();  // '旺财 is barking'（Dog 自己的方法）

console.log(dog instanceof Dog);     // true
console.log(dog instanceof Animal);  // true
```

### 4.3 判断属性来源

```javascript
function Person(name) {
  this.name = name;
}

Person.prototype.age = 18;

const person = new Person('张三');

// 1. hasOwnProperty：判断是否为自身属性
console.log(person.hasOwnProperty('name'));  // true
console.log(person.hasOwnProperty('age'));   // false

// 2. in 操作符：判断属性是否存在（包括原型链）
console.log('name' in person);  // true
console.log('age' in person);   // true

// 3. 判断是否为原型属性
function isPrototypeProperty(obj, prop) {
  return !obj.hasOwnProperty(prop) && (prop in obj);
}

console.log(isPrototypeProperty(person, 'name'));  // false
console.log(isPrototypeProperty(person, 'age'));   // true
```

### 4.4 遍历属性

```javascript
function Person(name) {
  this.name = name;
}

Person.prototype.age = 18;

const person = new Person('张三');

// for...in 会遍历自身和原型链上的可枚举属性
for (let key in person) {
  console.log(key);  // 'name', 'age'
}

// 只遍历自身属性
for (let key in person) {
  if (person.hasOwnProperty(key)) {
    console.log(key);  // 'name'
  }
}

// Object.keys 只返回自身可枚举属性
console.log(Object.keys(person));  // ['name']

// Object.getOwnPropertyNames 返回自身所有属性（包括不可枚举）
console.log(Object.getOwnPropertyNames(person));  // ['name']
```

## 5. 面试重点：什么是原型链，解决了什么问题

### 5.1 标准答案

**原型链是 JavaScript 实现对象属性共享和继承的核心机制，解决了单继承场景下的代码复用问题。**

通过 `__proto__` 指针将实例、原型对象、顶层原型串联成链式结构，属性查找遵循「**自下而上、找到即停**」的规则。

### 5.2 详细解释

#### 1. 什么是原型链

```javascript
// 原型链是一条由 __proto__ 连接的链
const obj = {};

obj
  ↓ __proto__
Object.prototype
  ↓ __proto__
null
```

#### 2. 解决了什么问题

**问题：如何实现多个对象共享方法？**

```javascript
// ❌ 不使用原型（每个对象都有独立的方法副本，浪费内存）
function Person(name) {
  this.name = name;
  this.sayHello = function() {
    console.log(`Hello, ${this.name}`);
  };
}

const p1 = new Person('张三');
const p2 = new Person('李四');

console.log(p1.sayHello === p2.sayHello);  // false（两个不同的函数）

// ✅ 使用原型（所有实例共享同一个方法）
function BetterPerson(name) {
  this.name = name;
}

BetterPerson.prototype.sayHello = function() {
  console.log(`Hello, ${this.name}`);
};

const b1 = new BetterPerson('张三');
const b2 = new BetterPerson('李四');

console.log(b1.sayHello === b2.sayHello);  // true（共享同一个函数）
```

#### 3. 原型链的优势

- ✅ **代码复用：** 多个实例共享原型上的方法和属性
- ✅ **节省内存：** 方法只存储一份，不会重复创建
- ✅ **动态性：** 可以动态修改原型，影响所有实例
- ✅ **继承机制：** 支持基于原型链的继承

```javascript
function Animal(name) {
  this.name = name;
}

Animal.prototype.eat = function() {
  console.log('Eating');
};

// 创建 1000 个实例，但 eat 方法只存储一份
const animals = Array.from({ length: 1000 }, (_, i) => new Animal(`Animal${i}`));

// 所有实例共享同一个 eat 方法
console.log(animals[0].eat === animals[999].eat);  // true
```

### 5.3 面试回答模板

```
面试官：请说明什么是原型链？

回答：
1. 定义：原型链是 JavaScript 实现继承和属性共享的机制

2. 组成：通过 __proto__ 指针将实例、原型对象、Object.prototype 串联成链

3. 查找规则：访问属性时，先查自身，再沿原型链向上查找，直到找到或到达 null

4. 解决的问题：
   - 实现多个对象共享方法，节省内存
   - 支持继承，实现代码复用
   - 提供动态扩展能力

5. 示例说明：
   const obj = {};
   obj 的原型链：obj → Object.prototype → null
```

## 6. 常见面试题

### Q1：`prototype` 和 `__proto__` 的区别？

```javascript
function Person() {}
const person = new Person();

// prototype：构造函数的属性，指向原型对象
console.log(Person.prototype);  // 原型对象

// __proto__：实例的属性，指向构造函数的原型
console.log(person.__proto__ === Person.prototype);  // true

// 记忆：
// - prototype：函数有，指向"我的原型"
// - __proto__：对象有，指向"我来自哪个原型"
```

### Q2：如何实现继承？

```javascript
// ES5 组合继承（最常用）
function Parent(name) {
  this.name = name;
}

Parent.prototype.sayHello = function() {
  console.log(`Hello, ${this.name}`);
};

function Child(name, age) {
  Parent.call(this, name);  // 继承属性
  this.age = age;
}

Child.prototype = Object.create(Parent.prototype);  // 继承方法
Child.prototype.constructor = Child;

// ES6 class（推荐）
class ParentClass {
  constructor(name) {
    this.name = name;
  }
  
  sayHello() {
    console.log(`Hello, ${this.name}`);
  }
}

class ChildClass extends ParentClass {
  constructor(name, age) {
    super(name);
    this.age = age;
  }
}
```

### Q3：如何判断对象的原型？

```javascript
function Person() {}
const person = new Person();

// 方法 1：instanceof
console.log(person instanceof Person);  // true
console.log(person instanceof Object);  // true

// 方法 2：isPrototypeOf
console.log(Person.prototype.isPrototypeOf(person));  // true
console.log(Object.prototype.isPrototypeOf(person));  // true

// 方法 3：Object.getPrototypeOf（推荐）
console.log(Object.getPrototypeOf(person) === Person.prototype);  // true
```

### Q4：原型链的终点是什么？

```javascript
// 原型链的终点是 null
console.log(Object.prototype.__proto__);  // null

// 完整的原型链
function Person() {}
const person = new Person();

console.log(person.__proto__);                          // Person.prototype
console.log(person.__proto__.__proto__);                // Object.prototype
console.log(person.__proto__.__proto__.__proto__);      // null
```

### Q5：如何避免原型污染？

```javascript
// ❌ 危险：直接修改 Object.prototype
Object.prototype.myMethod = function() {
  console.log('污染了所有对象');
};

const obj = {};
obj.myMethod();  // 所有对象都有这个方法了

// ✅ 安全：使用 Object.create(null) 创建纯净对象
const pureObj = Object.create(null);
console.log(pureObj.__proto__);  // undefined（没有原型）
console.log(pureObj.toString);   // undefined（没有继承任何方法）
```

## 7. 总结

### 7.1 核心要点

- **原型链本质：** 对象通过 `__proto__` 形成的链式关联
- **查找机制：** 自下而上、找到即停
- **核心作用：** 实现属性共享和继承，节省内存
- **关键属性：** `prototype`（构造函数）、`__proto__`（实例）、`constructor`（原型对象）

### 7.2 记忆要点

```javascript
// 1. 构造函数有 prototype
Function.prototype

// 2. 实例有 __proto__
instance.__proto__

// 3. 它们指向同一个原型对象
instance.__proto__ === Constructor.prototype  // true

// 4. 原型对象的 constructor 指向构造函数
Constructor.prototype.constructor === Constructor  // true

// 5. 原型链的终点是 null
Object.prototype.__proto__ === null  // true
```

### 7.3 最佳实践

- ✅ 将共享方法定义在原型上
- ✅ 使用 `Object.getPrototypeOf()` 代替 `__proto__`
- ✅ 使用 ES6 class 语法实现继承（更清晰）
- ❌ 避免修改内置对象的原型（如 Object.prototype）
- ❌ 避免创建过长的原型链（影响性能）

---

> 💡 **核心要点：** 原型链是 JavaScript 继承机制的基础，理解原型链对于掌握 JavaScript 面向对象编程至关重要。实际开发中推荐使用 ES6 class 语法，但底层仍是原型链机制。
