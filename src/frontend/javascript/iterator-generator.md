---
title: 迭代器与生成器完整指南
date: 2025-10-22
icon: logos:javascript
category:
  - JavaScript
tag:
  - JavaScript
  - Iterator
  - Generator
  - 异步编程
---

# 迭代器与生成器完整指南

## 一、迭代器（Iterator）

### 1.1 迭代器协议

```javascript
const myIterator = {
  data: [1, 2, 3],
  index: 0,
  next() {
    if (this.index < this.data.length) {
      return {
        value: this.data[this.index++],
        done: false
      };
    }
    return { done: true };
  },
  [Symbol.iterator]() {
    return this;
  }
};

for (const value of myIterator) {
  console.log(value); // 1, 2, 3
}
```

### 1.2 可迭代对象

```javascript
class Range {
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }
  
  [Symbol.iterator]() {
    let current = this.start;
    const end = this.end;
    
    return {
      next() {
        if (current <= end) {
          return { value: current++, done: false };
        }
        return { done: true };
      }
    };
  }
}

const range = new Range(1, 5);
for (const num of range) {
  console.log(num); // 1, 2, 3, 4, 5
}
```

## 二、生成器（Generator）

### 2.1 基础语法

```javascript
function* numberGenerator() {
  yield 1;
  yield 2;
  yield 3;
}

const gen = numberGenerator();
console.log(gen.next()); // { value: 1, done: false }
console.log(gen.next()); // { value: 2, done: false }
console.log(gen.next()); // { value: 3, done: false }
console.log(gen.next()); // { done: true }
```

### 2.2 生成器实战

```javascript
// 无限序列
function* fibonacci() {
  let [a, b] = [0, 1];
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

const fib = fibonacci();
console.log(fib.next().value); // 0
console.log(fib.next().value); // 1
console.log(fib.next().value); // 1
console.log(fib.next().value); // 2

// 异步流程控制
function* asyncFlow() {
  const user = yield fetchUser();
  const posts = yield fetchPosts(user.id);
  return posts;
}
```

## 三、应用场景

### 3.1 惰性求值

```javascript
function* lazyMap(iterable, mapper) {
  for (const item of iterable) {
    yield mapper(item);
  }
}

const numbers = [1, 2, 3, 4, 5];
const doubled = lazyMap(numbers, x => x * 2);

for (const num of doubled) {
  console.log(num); // 2, 4, 6, 8, 10
}
```

### 3.2 异步迭代

```javascript
async function* asyncGenerator() {
  for (let i = 0; i < 3; i++) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    yield i;
  }
}

(async () => {
  for await (const value of asyncGenerator()) {
    console.log(value); // 0, 1, 2 (每秒一个)
  }
})();
```

### 3.3 数据流处理

```javascript
function* pipeline(...fns) {
  let value = yield;
  
  for (const fn of fns) {
    value = fn(value);
    value = yield value;
  }
}

// 使用
const gen = pipeline(
  x => x * 2,
  x => x + 10,
  x => x / 2
);

gen.next();      // 启动生成器
gen.next(5);     // { value: 10, done: false }
gen.next(10);    // { value: 20, done: false }
gen.next(20);    // { value: 15, done: false }
```

## 四、高级应用

### 4.1 co自动执行器

```javascript
function co(gen) {
  return new Promise((resolve, reject) => {
    const g = gen();
    
    function next(data) {
      const result = g.next(data);
      
      if (result.done) {
        return resolve(result.value);
      }
      
      Promise.resolve(result.value)
        .then(next)
        .catch(reject);
    }
    
    next();
  });
}

// 使用
co(function* () {
  const user = yield fetch('/api/user');
  const posts = yield fetch(`/api/posts/${user.id}`);
  return posts;
}).then(posts => console.log(posts));
```

### 4.2 无限序列

```javascript
// 斐波那契数列
function* fibonacci() {
  let [a, b] = [0, 1];
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

// 素数生成器
function* primes() {
  function isPrime(n) {
    for (let i = 2; i <= Math.sqrt(n); i++) {
      if (n % i === 0) return false;
    }
    return n > 1;
  }
  
  let n = 2;
  while (true) {
    if (isPrime(n)) yield n;
    n++;
  }
}

// 使用
const primesGen = primes();
for (let i = 0; i < 10; i++) {
  console.log(primesGen.next().value);
}
// 2, 3, 5, 7, 11, 13, 17, 19, 23, 29
```

### 4.3 状态机

```javascript
function* trafficLight() {
  while (true) {
    console.log('🔴 Red');
    yield 'red';
    
    console.log('🟡 Yellow');
    yield 'yellow';
    
    console.log('🟢 Green');
    yield 'green';
  }
}

const light = trafficLight();
light.next(); // 🔴 Red
light.next(); // 🟡 Yellow
light.next(); // 🟢 Green
light.next(); // 🔴 Red (循环)
```

### 4.4 双向通信

```javascript
function* doubleGenerator() {
  let value;
  
  while (true) {
    value = yield value ? value * 2 : 0;
  }
}

const gen = doubleGenerator();
console.log(gen.next());     // { value: 0, done: false }
console.log(gen.next(5));    // { value: 10, done: false }
console.log(gen.next(10));   // { value: 20, done: false }
```

## 五、性能优化

### 5.1 懒加载

```javascript
class LazyArray {
  constructor(generator) {
    this.generator = generator;
    this.cache = [];
  }
  
  get(index) {
    if (index < this.cache.length) {
      return this.cache[index];
    }
    
    const gen = this.generator();
    let i = 0;
    
    for (const value of gen) {
      if (i === index) {
        this.cache.push(value);
        return value;
      }
      if (i < this.cache.length) {
        i++;
        continue;
      }
      this.cache.push(value);
      i++;
    }
    
    return undefined;
  }
}

// 使用
const lazyFib = new LazyArray(fibonacci);
console.log(lazyFib.get(10)); // 只计算到第10个
```

### 5.2 批处理

```javascript
function* batch(arr, size) {
  for (let i = 0; i < arr.length; i += size) {
    yield arr.slice(i, i + size);
  }
}

// 处理大数组
const largeArray = Array.from({ length: 1000 }, (_, i) => i);

for (const chunk of batch(largeArray, 100)) {
  // 每次处理100个元素
  console.log(`Processing ${chunk.length} items`);
  // ... 处理逻辑
}
```

## 六、实战案例

### 6.1 分页数据获取

```javascript
async function* fetchPages(url) {
  let page = 1;
  
  while (true) {
    const response = await fetch(`${url}?page=${page}`);
    const data = await response.json();
    
    if (data.items.length === 0) break;
    
    yield data.items;
    page++;
  }
}

// 使用
(async () => {
  for await (const items of fetchPages('/api/data')) {
    console.log('Page items:', items);
  }
})();
```

### 6.2 事件流处理

```javascript
function* clickStream(element) {
  const clicks = [];
  
  element.addEventListener('click', (e) => {
    clicks.push(e);
  });
  
  while (true) {
    if (clicks.length > 0) {
      yield clicks.shift();
    }
  }
}

// 使用
const button = document.querySelector('button');
const stream = clickStream(button);

setInterval(() => {
  const click = stream.next().value;
  if (click) {
    console.log('Click detected:', click);
  }
}, 100);
```

### 6.3 数据转换管道

```javascript
function* map(iterable, mapper) {
  for (const item of iterable) {
    yield mapper(item);
  }
}

function* filter(iterable, predicate) {
  for (const item of iterable) {
    if (predicate(item)) {
      yield item;
    }
  }
}

function* take(iterable, n) {
  let count = 0;
  for (const item of iterable) {
    if (count++ >= n) break;
    yield item;
  }
}

// 使用 - 链式处理
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const result = take(
  filter(
    map(numbers, x => x * 2),
    x => x > 10
  ),
  3
);

console.log([...result]); // [12, 14, 16]
```

## 七、面试高频问题

### Q1: 迭代器和可迭代对象的区别？

**答案：**
- **可迭代对象**：实现了`[Symbol.iterator]`方法的对象
- **迭代器**：实现了`next()`方法的对象

可迭代对象调用`[Symbol.iterator]`返回迭代器。

### Q2: 生成器的优势是什么？

**答案：**
1. **懒计算**：按需生成值，节省内存
2. **无限序列**：可以表示无限数据流
3. **双向通信**：可以向生成器传值
4. **暂停恢复**：可以暂停和恢复执行
5. **简化异步**：配合co库简化异步流程

### Q3: for...of与for...in的区别？

**答案：**
- **for...of**：遍历可迭代对象的值（数组、Set、Map等）
- **for...in**：遍历对象的可枚举属性名

```javascript
const arr = [1, 2, 3];
arr.foo = 'bar';

for (const value of arr) {
  console.log(value); // 1, 2, 3
}

for (const key in arr) {
  console.log(key); // 0, 1, 2, foo
}
```

### Q4: 如何实现自定义可迭代对象？

**答案：**
```javascript
const myIterable = {
  data: [1, 2, 3],
  [Symbol.iterator]() {
    let index = 0;
    const data = this.data;
    
    return {
      next() {
        if (index < data.length) {
          return { value: data[index++], done: false };
        }
        return { done: true };
      }
    };
  }
};

for (const value of myIterable) {
  console.log(value); // 1, 2, 3
}
```

### Q5: Generator与async/await的关系？

**答案：**
async/await本质上是Generator + Promise的语法糖：
- async函数返回Promise
- await相当于yield + 自动执行
- async/await使异步代码看起来像同步代码

## 八、总结

### 8.1 核心要点

- **迭代器协议**：实现next()方法
- **可迭代协议**：实现[Symbol.iterator]
- **生成器函数**：function*语法，yield关键字
- **应用场景**：懒计算、无限序列、异步流程

### 8.2 最佳实践

1. 大数据集使用迭代器节省内存
2. 复杂异步流程使用生成器
3. 数据流处理使用管道模式
4. 注意生成器的异常处理

---

**相关文章：**
- [异步编程](./callback-hell.md)
- [手写Promise](./promise-implementation.md)
- [程序设计与分析](./program-design.md)
