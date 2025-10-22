---
title: Proxy与Reflect深入解析
date: 2025-10-22
icon: logos:javascript
category:
  - JavaScript
tag:
  - JavaScript
  - Proxy
  - Reflect
  - 元编程
---

# Proxy与Reflect深入解析

## 一、Proxy基础

### 1.1 什么是Proxy

Proxy用于创建对象的代理,从而实现基本操作的拦截和自定义。

```javascript
const target = { name: 'John' };
const handler = {
  get(target, prop) {
    console.log('Getting', prop);
    return target[prop];
  }
};

const proxy = new Proxy(target, handler);
console.log(proxy.name); // Getting name, John
```

## 二、Proxy陷阱

```javascript
const handler = {
  get(target, prop) {},
  set(target, prop, value) {},
  has(target, prop) {},
  deleteProperty(target, prop) {},
  ownKeys(target) {},
  apply(target, thisArg, args) {},
  construct(target, args) {}
};
```

## 三、Reflect API

Reflect提供拦截JavaScript操作的方法。

```javascript
const obj = { x: 1, y: 2 };

Reflect.get(obj, 'x'); // 1
Reflect.set(obj, 'z', 3); // true
Reflect.has(obj, 'x'); // true
Reflect.deleteProperty(obj, 'x'); // true
```

## 四、实战应用

### 4.1 数据验证

```javascript
const validator = {
  set(target, prop, value) {
    if (prop === 'age' && typeof value !== 'number') {
      throw new TypeError('Age must be a number');
    }
    return Reflect.set(target, prop, value);
  }
};

const person = new Proxy({}, validator);
person.age = 25; // OK
person.age = '25'; // TypeError
```

### 4.2 数据绑定

```javascript
function createReactive(target, callback) {
  return new Proxy(target, {
    set(target, prop, value) {
      const result = Reflect.set(target, prop, value);
      callback(prop, value);
      return result;
    }
  });
}

const data = createReactive({}, (prop, value) => {
  console.log('Updated:', prop, '=', value);
});

data.name = 'Vue'; // Updated: name = Vue
```

### 4.3 访问日志

```javascript
function createLogger(target) {
  return new Proxy(target, {
    get(target, prop) {
      console.log(`[GET] ${prop} = ${target[prop]}`);
      return Reflect.get(target, prop);
    },
    set(target, prop, value) {
      console.log(`[SET] ${prop} = ${value}`);
      return Reflect.set(target, prop, value);
    }
  });
}

const obj = createLogger({ name: 'John', age: 25 });
obj.name;        // [GET] name = John
obj.age = 26;    // [SET] age = 26
```

### 4.4 属性保护

```javascript
function createProtected(target, protectedProps = []) {
  return new Proxy(target, {
    get(target, prop) {
      if (protectedProps.includes(prop)) {
        throw new Error(`Property ${prop} is protected`);
      }
      return Reflect.get(target, prop);
    },
    set(target, prop, value) {
      if (protectedProps.includes(prop)) {
        throw new Error(`Property ${prop} is read-only`);
      }
      return Reflect.set(target, prop, value);
    }
  });
}

const user = createProtected(
  { name: 'John', password: '123456' },
  ['password']
);

console.log(user.name);      // John
console.log(user.password);  // Error: Property password is protected
```

## 五、Proxy所有陷阱详解

### 5.1 get陷阱

```javascript
const handler = {
  get(target, prop, receiver) {
    console.log(`Getting ${prop}`);
    
    // 支持负索引
    if (Array.isArray(target) && typeof prop === 'string') {
      const index = Number(prop);
      if (index < 0) {
        prop = String(target.length + index);
      }
    }
    
    return Reflect.get(target, prop, receiver);
  }
};

const arr = new Proxy([1, 2, 3], handler);
console.log(arr[-1]); // 3
```

### 5.2 set陷阱

```javascript
const handler = {
  set(target, prop, value, receiver) {
    // 类型检查
    if (prop === 'age' && !Number.isInteger(value)) {
      throw new TypeError('Age must be an integer');
    }
    
    // 范围检查
    if (prop === 'age' && (value < 0 || value > 150)) {
      throw new RangeError('Age must be between 0 and 150');
    }
    
    return Reflect.set(target, prop, value, receiver);
  }
};

const person = new Proxy({}, handler);
person.age = 25;     // OK
person.age = 25.5;   // TypeError
person.age = 200;    // RangeError
```

### 5.3 has陷阱

```javascript
const handler = {
  has(target, prop) {
    // 隐藏私有属性
    if (prop.startsWith('_')) {
      return false;
    }
    return Reflect.has(target, prop);
  }
};

const obj = new Proxy(
  { public: 1, _private: 2 },
  handler
);

console.log('public' in obj);   // true
console.log('_private' in obj); // false
```

### 5.4 deleteProperty陷阱

```javascript
const handler = {
  deleteProperty(target, prop) {
    // 防止删除重要属性
    if (prop === 'id') {
      throw new Error('Cannot delete id property');
    }
    
    console.log(`Deleting ${prop}`);
    return Reflect.deleteProperty(target, prop);
  }
};

const obj = new Proxy({ id: 1, name: 'John' }, handler);
delete obj.name;  // OK, Deleting name
delete obj.id;    // Error: Cannot delete id property
```

### 5.5 apply陷阱

```javascript
function sum(a, b) {
  return a + b;
}

const handler = {
  apply(target, thisArg, args) {
    console.log(`Calling with args: ${args}`);
    
    // 参数验证
    if (args.some(arg => typeof arg !== 'number')) {
      throw new TypeError('All arguments must be numbers');
    }
    
    return Reflect.apply(target, thisArg, args);
  }
};

const sumProxy = new Proxy(sum, handler);
console.log(sumProxy(1, 2));    // 3
console.log(sumProxy(1, '2'));  // TypeError
```

### 5.6 construct陷阱

```javascript
class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
}

const handler = {
  construct(target, args) {
    console.log(`Creating instance with: ${args}`);
    
    // 参数验证
    if (args.length < 2) {
      throw new Error('Missing required arguments');
    }
    
    return Reflect.construct(target, args);
  }
};

const PersonProxy = new Proxy(Person, handler);
const p1 = new PersonProxy('John', 25);  // OK
const p2 = new PersonProxy('John');      // Error
```

## 六、Reflect完整API

```javascript
// 1. Reflect.get - 读取属性
Reflect.get({ x: 1, y: 2 }, 'x'); // 1

// 2. Reflect.set - 设置属性
Reflect.set({ x: 1 }, 'y', 2); // true

// 3. Reflect.has - 检查属性
Reflect.has({ x: 1 }, 'x'); // true

// 4. Reflect.deleteProperty - 删除属性
Reflect.deleteProperty({ x: 1, y: 2 }, 'x'); // true

// 5. Reflect.ownKeys - 获取所有键
Reflect.ownKeys({ x: 1, y: 2 }); // ['x', 'y']

// 6. Reflect.getPrototypeOf - 获取原型
Reflect.getPrototypeOf([]); // Array.prototype

// 7. Reflect.setPrototypeOf - 设置原型
Reflect.setPrototypeOf({}, Array.prototype);

// 8. Reflect.apply - 调用函数
Reflect.apply(Math.max, null, [1, 2, 3]); // 3

// 9. Reflect.construct - 调用构造函数
Reflect.construct(Array, [1, 2, 3]); // [1, 2, 3]

// 10. Reflect.defineProperty - 定义属性
Reflect.defineProperty({}, 'x', { value: 1 });

// 11. Reflect.getOwnPropertyDescriptor - 获取属性描述符
Reflect.getOwnPropertyDescriptor({ x: 1 }, 'x');

// 12. Reflect.preventExtensions - 阻止扩展
Reflect.preventExtensions({});

// 13. Reflect.isExtensible - 检查是否可扩展
Reflect.isExtensible({}); // true
```

## 七、Vue3响应式原理

```javascript
// 简化版Vue3响应式实现
function reactive(target) {
  const handler = {
    get(target, key, receiver) {
      // 依赖收集
      track(target, key);
      
      const result = Reflect.get(target, key, receiver);
      
      // 如果是对象，递归代理
      if (typeof result === 'object' && result !== null) {
        return reactive(result);
      }
      
      return result;
    },
    
    set(target, key, value, receiver) {
      const oldValue = target[key];
      const result = Reflect.set(target, key, value, receiver);
      
      // 触发更新
      if (oldValue !== value) {
        trigger(target, key);
      }
      
      return result;
    }
  };
  
  return new Proxy(target, handler);
}

// 依赖收集
let activeEffect = null;
const targetMap = new WeakMap();

function track(target, key) {
  if (!activeEffect) return;
  
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }
  
  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = new Set()));
  }
  
  dep.add(activeEffect);
}

// 触发更新
function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;
  
  const dep = depsMap.get(key);
  if (dep) {
    dep.forEach(effect => effect());
  }
}

// 使用
const state = reactive({ count: 0 });

activeEffect = () => console.log('Count:', state.count);
activeEffect(); // Count: 0

state.count++; // Count: 1
```

## 八、面试高频问题

### Q1: Proxy与Object.defineProperty的区别？

**答案：**
1. **监听方式**：Proxy监听整个对象，defineProperty监听单个属性
2. **数组支持**：Proxy可以监听数组变化，defineProperty需要重写数组方法
3. **属性新增**：Proxy可以监听属性新增，defineProperty不行
4. **性能**：Proxy性能更好，不需要遍历所有属性
5. **兼容性**：defineProperty兼容性更好，Proxy不支持IE

### Q2: Reflect的作用是什么？

**答案：**
1. **统一操作接口**：将Object的一些操作移到Reflect上
2. **函数式操作**：让操作变成函数行为
3. **返回值有意义**：返回布尔值而非抛出错误
4. **配合Proxy**：Reflect方法与Proxy陷阱一一对应

### Q3: Proxy可以被检测吗？

**答案：**
无法直接检测，但可以通过以下方式：
```javascript
function isProxy(obj) {
  try {
    // 尝试访问内部属性
    return obj[Symbol.toStringTag] === 'Proxy';
  } catch {
    return false;
  }
}
```

## 九、总结

### 9.1 核心要点

- **Proxy**：拦截和自定义对象操作
- **Reflect**：提供统一的对象操作API
- **13种陷阱**：覆盖对象的所有操作
- **应用场景**：数据验证、监听、Vue3响应式

### 9.2 最佳实践

1. 使用Reflect完成默认操作
2. 在陷阱中进行必要的验证
3. 注意性能开销
4. 合理使用缓存

---

**相关文章：**
- [Vue 3.0源码解析](../vue/vue3-source-code.md)
- [程序设计与分析](./program-design.md)
