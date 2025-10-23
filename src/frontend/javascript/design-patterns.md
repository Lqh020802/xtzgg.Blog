---
title: JavaScript设计模式
date: 2025-10-22
icon: mdi:palette-outline
category:
  - JavaScript
tag:
  - 设计模式
  - 编程思想
  - 架构设计
---

# JavaScript设计模式

## 一、创建型模式

### 1.1 单例模式

**定义：** 保证一个类只有一个实例，并提供全局访问点。

```javascript
// 懒汉式单例
class Singleton {
  constructor(name) {
    this.name = name;
  }
  
  static getInstance(name) {
    if (!this.instance) {
      this.instance = new Singleton(name);
    }
    return this.instance;
  }
}

const instance1 = Singleton.getInstance('Instance1');
const instance2 = Singleton.getInstance('Instance2');
console.log(instance1 === instance2); // true

// 闭包实现
const Singleton2 = (function() {
  let instance;
  
  return function(name) {
    if (!instance) {
      this.name = name;
      instance = this;
    }
    return instance;
  };
})();

// 实战：全局状态管理
class Store {
  constructor() {
    this.state = {};
  }
  
  static getInstance() {
    if (!this.instance) {
      this.instance = new Store();
    }
    return this.instance;
  }
  
  setState(key, value) {
    this.state[key] = value;
  }
  
  getState(key) {
    return this.state[key];
  }
}
```

### 1.2 工厂模式

**定义：** 创建对象时不暴露创建逻辑，通过共同接口创建对象。

```javascript
// 简单工厂
class User {
  constructor(name, role) {
    this.name = name;
    this.role = role;
  }
}

class UserFactory {
  static createUser(name, role) {
    switch(role) {
      case 'admin':
        return new User(name, ['read', 'write', 'delete']);
      case 'user':
        return new User(name, ['read']);
      default:
        throw new Error('Invalid role');
    }
  }
}

const admin = UserFactory.createUser('John', 'admin');
const user = UserFactory.createUser('Jane', 'user');

// 工厂方法模式
class Product {
  constructor(name) {
    this.name = name;
  }
}

class ConcreteProductA extends Product {
  constructor() {
    super('Product A');
  }
}

class ConcreteProductB extends Product {
  constructor() {
    super('Product B');
  }
}

class Creator {
  factoryMethod() {
    throw new Error('必须实现 factoryMethod');
  }
  
  operation() {
    const product = this.factoryMethod();
    return `Creator: ${product.name}`;
  }
}

class ConcreteCreatorA extends Creator {
  factoryMethod() {
    return new ConcreteProductA();
  }
}

class ConcreteCreatorB extends Creator {
  factoryMethod() {
    return new ConcreteProductB();
  }
}
```

### 1.3 建造者模式

**定义：** 分步骤创建复杂对象。

```javascript
class Computer {
  constructor() {
    this.cpu = '';
    this.memory = '';
    this.disk = '';
  }
}

class ComputerBuilder {
  constructor() {
    this.computer = new Computer();
  }
  
  setCPU(cpu) {
    this.computer.cpu = cpu;
    return this;
  }
  
  setMemory(memory) {
    this.computer.memory = memory;
    return this;
  }
  
  setDisk(disk) {
    this.computer.disk = disk;
    return this;
  }
  
  build() {
    return this.computer;
  }
}

// 使用
const computer = new ComputerBuilder()
  .setCPU('Intel i7')
  .setMemory('16GB')
  .setDisk('512GB SSD')
  .build();
```

### 1.4 原型模式

**定义：** 通过克隆创建对象。

```javascript
const prototype = {
  name: 'Prototype',
  clone() {
    return Object.create(this);
  }
};

const obj1 = prototype.clone();
obj1.name = 'Object 1';

// 深克隆
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj);
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item));
  }
  
  const cloned = {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  
  return cloned;
}
```

## 二、结构型模式

### 2.1 代理模式

**定义：** 为对象提供代理以控制访问。

```javascript
// 虚拟代理 - 图片懒加载
class Image {
  constructor(src) {
    this.src = src;
    this.el = document.createElement('img');
  }
  
  setSrc(src) {
    this.el.src = src;
  }
}

class ProxyImage {
  constructor(src) {
    this.realImage = new Image(src);
    this.placeholderSrc = 'loading.gif';
  }
  
  setSrc(src) {
    this.realImage.setSrc(this.placeholderSrc);
    
    const img = new Image();
    img.onload = () => {
      this.realImage.setSrc(src);
    };
    img.src = src;
  }
}

// 缓存代理
const mult = function(...args) {
  return args.reduce((a, b) => a * b, 1);
};

const proxyMult = (function() {
  const cache = {};
  
  return function(...args) {
    const key = args.join(',');
    
    if (key in cache) {
      console.log('从缓存获取');
      return cache[key];
    }
    
    const result = mult(...args);
    cache[key] = result;
    return result;
  };
})();

console.log(proxyMult(1, 2, 3, 4)); // 24
console.log(proxyMult(1, 2, 3, 4)); // 从缓存获取 24
```

### 2.2 装饰器模式

**定义：** 动态给对象添加新功能。

```javascript
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

let coffee = new Coffee();
coffee = new MilkDecorator(coffee);
coffee = new SugarDecorator(coffee);
console.log(coffee.cost()); // 13

// 函数装饰器
function readonly(target, key, descriptor) {
  descriptor.writable = false;
  return descriptor;
}

function log(target, key, descriptor) {
  const original = descriptor.value;
  
  descriptor.value = function(...args) {
    console.log(`Calling ${key} with`, args);
    return original.apply(this, args);
  };
  
  return descriptor;
}
```

### 2.3 适配器模式

**定义：** 将接口转换为客户期望的接口。

```javascript
// 旧接口
class OldAPI {
  request(url) {
    return `Old API: ${url}`;
  }
}

// 新接口
class NewAPI {
  fetch(url) {
    return `New API: ${url}`;
  }
}

// 适配器
class APIAdapter {
  constructor() {
    this.newAPI = new NewAPI();
  }
  
  request(url) {
    return this.newAPI.fetch(url);
  }
}

// 使用
const adapter = new APIAdapter();
console.log(adapter.request('/api/users'));
```

### 2.4 外观模式

**定义：** 为复杂子系统提供简单接口。

```javascript
// 复杂的子系统
class CPU {
  freeze() { console.log('CPU freeze'); }
  jump() { console.log('CPU jump'); }
  execute() { console.log('CPU execute'); }
}

class Memory {
  load() { console.log('Memory load'); }
}

class HardDrive {
  read() { console.log('HardDrive read'); }
}

// 外观
class ComputerFacade {
  constructor() {
    this.cpu = new CPU();
    this.memory = new Memory();
    this.hardDrive = new HardDrive();
  }
  
  start() {
    this.cpu.freeze();
    this.memory.load();
    this.hardDrive.read();
    this.cpu.jump();
    this.cpu.execute();
  }
}

const computer = new ComputerFacade();
computer.start();
```

## 三、行为型模式

### 3.1 观察者模式

**定义：** 对象间一对多依赖，一个对象状态改变，所有依赖者得到通知。

```javascript
class Subject {
  constructor() {
    this.observers = [];
  }
  
  attach(observer) {
    this.observers.push(observer);
  }
  
  detach(observer) {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
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
    console.log(`${this.name} received:`, data);
  }
}

// 使用
const subject = new Subject();
const observer1 = new Observer('Observer1');
const observer2 = new Observer('Observer2');

subject.attach(observer1);
subject.attach(observer2);
subject.notify('Hello!');
```

### 3.2 发布-订阅模式

**定义：** 基于事件通道的观察者模式。

```javascript
class EventBus {
  constructor() {
    this.events = {};
  }
  
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }
  
  off(event, callback) {
    if (this.events[event]) {
      const index = this.events[event].indexOf(callback);
      if (index > -1) {
        this.events[event].splice(index, 1);
      }
    }
  }
  
  emit(event, ...args) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(...args));
    }
  }
  
  once(event, callback) {
    const wrapper = (...args) => {
      callback(...args);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }
}

// 使用
const eventBus = new EventBus();

eventBus.on('userLogin', (user) => {
  console.log('User logged in:', user);
});

eventBus.emit('userLogin', { name: 'John' });
```

### 3.3 策略模式

**定义：** 定义算法族，封装每个算法，使它们可互换。

```javascript
// 计算奖金
const strategies = {
  S: salary => salary * 4,
  A: salary => salary * 3,
  B: salary => salary * 2
};

function calculateBonus(level, salary) {
  return strategies[level](salary);
}

console.log(calculateBonus('S', 10000)); // 40000

// 表单验证
const validators = {
  required: (value, errorMsg) => {
    return value ? '' : errorMsg;
  },
  minLength: (value, length, errorMsg) => {
    return value.length >= length ? '' : errorMsg;
  },
  email: (value, errorMsg) => {
    const reg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return reg.test(value) ? '' : errorMsg;
  }
};

class Validator {
  constructor() {
    this.rules = [];
  }
  
  add(value, rules) {
    rules.forEach(rule => {
      this.rules.push(() => {
        const [strategy, ...args] = rule;
        return validators[strategy](value, ...args);
      });
    });
  }
  
  validate() {
    for (let rule of this.rules) {
      const error = rule();
      if (error) {
        return error;
      }
    }
    return '';
  }
}

const validator = new Validator();
validator.add('', [['required', '用户名不能为空']]);
validator.add('abc', [['minLength', 6, '用户名长度不能少于6位']]);
console.log(validator.validate());
```

### 3.4 命令模式

**定义：** 将请求封装成对象。

```javascript
class Command {
  constructor(receiver) {
    this.receiver = receiver;
  }
  
  execute() {
    throw new Error('必须实现 execute 方法');
  }
}

class TurnOnCommand extends Command {
  execute() {
    this.receiver.turnOn();
  }
}

class TurnOffCommand extends Command {
  execute() {
    this.receiver.turnOff();
  }
}

class Light {
  turnOn() {
    console.log('Light is on');
  }
  
  turnOff() {
    console.log('Light is off');
  }
}

class RemoteControl {
  setCommand(command) {
    this.command = command;
  }
  
  pressButton() {
    this.command.execute();
  }
}

// 使用
const light = new Light();
const turnOn = new TurnOnCommand(light);
const turnOff = new TurnOffCommand(light);

const remote = new RemoteControl();
remote.setCommand(turnOn);
remote.pressButton(); // Light is on

remote.setCommand(turnOff);
remote.pressButton(); // Light is off
```

### 3.5 迭代器模式

**定义：** 提供顺序访问聚合对象元素的方法。

```javascript
class Iterator {
  constructor(items) {
    this.items = items;
    this.index = 0;
  }
  
  hasNext() {
    return this.index < this.items.length;
  }
  
  next() {
    return this.items[this.index++];
  }
}

// ES6 迭代器
class Collection {
  constructor(items) {
    this.items = items;
  }
  
  [Symbol.iterator]() {
    let index = 0;
    const items = this.items;
    
    return {
      next() {
        if (index < items.length) {
          return { value: items[index++], done: false };
        }
        return { done: true };
      }
    };
  }
}

const collection = new Collection([1, 2, 3, 4, 5]);
for (let item of collection) {
  console.log(item);
}
```

## 四、实战应用

### 4.1 插件系统

```javascript
class PluginSystem {
  constructor() {
    this.plugins = [];
  }
  
  use(plugin) {
    this.plugins.push(plugin);
    return this;
  }
  
  apply(context) {
    this.plugins.forEach(plugin => plugin(context));
  }
}

// 使用
const system = new PluginSystem();

system.use((ctx) => {
  ctx.log = (...args) => console.log('[LOG]', ...args);
});

system.use((ctx) => {
  ctx.error = (...args) => console.error('[ERROR]', ...args);
});

const context = {};
system.apply(context);

context.log('Hello'); // [LOG] Hello
context.error('Error'); // [ERROR] Error
```

### 4.2 中间件模式

```javascript
class Middleware {
  constructor() {
    this.middlewares = [];
  }
  
  use(fn) {
    this.middlewares.push(fn);
    return this;
  }
  
  async execute(context) {
    let index = 0;
    
    const next = async () => {
      if (index < this.middlewares.length) {
        const middleware = this.middlewares[index++];
        await middleware(context, next);
      }
    };
    
    await next();
  }
}

// 使用
const app = new Middleware();

app.use(async (ctx, next) => {
  console.log('Middleware 1 before');
  await next();
  console.log('Middleware 1 after');
});

app.use(async (ctx, next) => {
  console.log('Middleware 2 before');
  await next();
  console.log('Middleware 2 after');
});

app.execute({});
```

## 五、总结

### 设计原则

1. **单一职责原则**：一个类只负责一个功能
2. **开闭原则**：对扩展开放，对修改关闭
3. **里氏替换原则**：子类可以替换父类
4. **接口隔离原则**：使用多个专门接口
5. **依赖倒置原则**：依赖抽象而非具体

### 常用模式

| 模式 | 用途 | 示例 |
|------|------|------|
| 单例 | 全局唯一实例 | Store、Router |
| 工厂 | 创建对象 | React.createElement |
| 观察者 | 事件监听 | EventEmitter |
| 发布订阅 | 解耦通信 | EventBus |
| 代理 | 控制访问 | Proxy |
| 装饰器 | 增强功能 | @decorator |
| 策略 | 算法切换 | 表单验证 |
| 中间件 | 流程控制 | Express、Koa |

---

**相关文章：**
- [程序设计与分析](./program-design.md)
- [手写MVVM框架](./mvvm-implementation.md)
