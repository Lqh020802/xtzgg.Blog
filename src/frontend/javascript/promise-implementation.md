---
title: 手写Promise完整实现
date: 2025-10-22
icon: logos:javascript
category:
  - JavaScript
tag:
  - JavaScript
  - Promise
  - 异步编程
  - 手写实现
---

# 手写Promise完整实现

## 一、Promise基础

### 1.1 Promise状态

```javascript
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';
```

## 二、Promise实现

```javascript
class MyPromise {
  constructor(executor) {
    this.state = PENDING;
    this.value = undefined;
    this.reason = undefined;
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];
    
    const resolve = (value) => {
      if (this.state === PENDING) {
        this.state = FULFILLED;
        this.value = value;
        this.onFulfilledCallbacks.forEach(fn => fn());
      }
    };
    
    const reject = (reason) => {
      if (this.state === PENDING) {
        this.state = REJECTED;
        this.reason = reason;
        this.onRejectedCallbacks.forEach(fn => fn());
      }
    };
    
    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }
  
  then(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
    onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason };
    
    const promise2 = new MyPromise((resolve, reject) => {
      if (this.state === FULFILLED) {
        setTimeout(() => {
          try {
            const x = onFulfilled(this.value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        }, 0);
      }
      
      if (this.state === REJECTED) {
        setTimeout(() => {
          try {
            const x = onRejected(this.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        }, 0);
      }
      
      if (this.state === PENDING) {
        this.onFulfilledCallbacks.push(() => {
          setTimeout(() => {
            try {
              const x = onFulfilled(this.value);
              resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          }, 0);
        });
        
        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              const x = onRejected(this.reason);
              resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          }, 0);
        });
      }
    });
    
    return promise2;
  }
  
  catch(onRejected) {
    return this.then(null, onRejected);
  }
  
  static resolve(value) {
    return new MyPromise((resolve) => resolve(value));
  }
  
  static reject(reason) {
    return new MyPromise((resolve, reject) => reject(reason));
  }
  
  static all(promises) {
    return new MyPromise((resolve, reject) => {
      const results = [];
      let count = 0;
      
      promises.forEach((promise, index) => {
        Promise.resolve(promise).then(value => {
          results[index] = value;
          count++;
          if (count === promises.length) {
            resolve(results);
          }
        }, reject);
      });
    });
  }
  
  static race(promises) {
    return new MyPromise((resolve, reject) => {
      promises.forEach(promise => {
        Promise.resolve(promise).then(resolve, reject);
      });
    });
  }
}

function resolvePromise(promise2, x, resolve, reject) {
  if (promise2 === x) {
    return reject(new TypeError('Chaining cycle'));
  }
  
  if (x instanceof MyPromise) {
    x.then(resolve, reject);
  } else {
    resolve(x);
  }
}
```

## 三、完整的resolvePromise

```javascript
function resolvePromise(promise2, x, resolve, reject) {
  // 防止循环引用
  if (promise2 === x) {
    return reject(new TypeError('Chaining cycle detected for promise'));
  }
  
  let called = false;
  
  if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
    try {
      const then = x.then;
      
      if (typeof then === 'function') {
        // x是Promise
        then.call(
          x,
          y => {
            if (called) return;
            called = true;
            resolvePromise(promise2, y, resolve, reject);
          },
          r => {
            if (called) return;
            called = true;
            reject(r);
          }
        );
      } else {
        resolve(x);
      }
    } catch (e) {
      if (called) return;
      called = true;
      reject(e);
    }
  } else {
    resolve(x);
  }
}
```

## 四、Promise扩展方法

### 4.1 Promise.allSettled

```javascript
MyPromise.allSettled = function(promises) {
  return new MyPromise((resolve) => {
    const results = [];
    let count = 0;
    
    if (promises.length === 0) {
      resolve(results);
      return;
    }
    
    promises.forEach((promise, index) => {
      MyPromise.resolve(promise).then(
        value => {
          results[index] = { status: 'fulfilled', value };
          count++;
          if (count === promises.length) {
            resolve(results);
          }
        },
        reason => {
          results[index] = { status: 'rejected', reason };
          count++;
          if (count === promises.length) {
            resolve(results);
          }
        }
      );
    });
  });
};
```

### 4.2 Promise.any

```javascript
MyPromise.any = function(promises) {
  return new MyPromise((resolve, reject) => {
    const errors = [];
    let count = 0;
    
    if (promises.length === 0) {
      reject(new AggregateError([], 'All promises were rejected'));
      return;
    }
    
    promises.forEach((promise, index) => {
      MyPromise.resolve(promise).then(
        resolve,
        error => {
          errors[index] = error;
          count++;
          if (count === promises.length) {
            reject(new AggregateError(errors, 'All promises were rejected'));
          }
        }
      );
    });
  });
};
```

### 4.3 Promise.finally

```javascript
MyPromise.prototype.finally = function(callback) {
  return this.then(
    value => MyPromise.resolve(callback()).then(() => value),
    reason => MyPromise.resolve(callback()).then(() => { throw reason; })
  );
};
```

## 五、使用示例

### 5.1 基础使用

```javascript
const promise = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve('Success!');
  }, 1000);
});

promise
  .then(value => {
    console.log(value); // Success!
    return value + ' Again';
  })
  .then(value => {
    console.log(value); // Success! Again
  })
  .catch(error => {
    console.error(error);
  });
```

### 5.2 链式调用

```javascript
MyPromise.resolve(1)
  .then(value => value + 1)
  .then(value => value * 2)
  .then(value => {
    console.log(value); // 4
  });
```

### 5.3 错误处理

```javascript
new MyPromise((resolve, reject) => {
  throw new Error('Something went wrong');
})
  .then(value => console.log(value))
  .catch(error => {
    console.error('Caught:', error.message);
  })
  .finally(() => {
    console.log('Cleanup');
  });
```

## 六、测试用例

```javascript
// 测试异步resolve
function test1() {
  const promise = new MyPromise((resolve) => {
    setTimeout(() => resolve('async'), 100);
  });
  
  promise.then(value => {
    console.assert(value === 'async', 'Test 1 failed');
  });
}

// 测试链式调用
function test2() {
  MyPromise.resolve(1)
    .then(v => v + 1)
    .then(v => {
      console.assert(v === 2, 'Test 2 failed');
    });
}

// 测试Promise.all
function test3() {
  MyPromise.all([
    MyPromise.resolve(1),
    MyPromise.resolve(2),
    MyPromise.resolve(3)
  ]).then(values => {
    console.assert(
      JSON.stringify(values) === '[1,2,3]',
      'Test 3 failed'
    );
  });
}

// 测试错误处理
function test4() {
  MyPromise.reject('error')
    .catch(reason => {
      console.assert(reason === 'error', 'Test 4 failed');
    });
}
```

## 七、面试高频问题

### Q1: Promise解决了什么问题？

**答案：**
1. **回调地狱**：通过链式调用避免多层嵌套
2. **错误处理**：统一的错误处理机制
3. **并发控制**：Promise.all/race等方法
4. **状态管理**：不可变的状态转换

### Q2: Promise的三种状态？

**答案：**
- **Pending（进行中）**：初始状态
- **Fulfilled（已成功）**：操作成功完成
- **Rejected（已失败）**：操作失败

状态只能从Pending转换为Fulfilled或Rejected，且不可逆。

### Q3: then方法的返回值？

**答案：**
then方法返回一个新的Promise，这使得链式调用成为可能。返回值处理：
1. 返回普通值：自动包装成fulfilled的Promise
2. 返回Promise：等待该Promise状态改变
3. 抛出错误：返回rejected的Promise
4. 无返回值：返回fulfilled的Promise（值为undefined）

### Q4: Promise.all与Promise.race的区别？

**答案：**
- **Promise.all**：等待所有Promise完成，全部成功才成功，有一个失败就失败
- **Promise.race**：返回最先完成的Promise结果，无论成功还是失败

### Q5: 如何实现Promise串行执行？

**答案：**
```javascript
function runPromiseInSequence(arr, input) {
  return arr.reduce(
    (promiseChain, currentFunction) => 
      promiseChain.then(currentFunction),
    Promise.resolve(input)
  );
}

// 使用
const funcs = [
  x => Promise.resolve(x + 1),
  x => Promise.resolve(x * 2),
  x => Promise.resolve(x - 3)
];

runPromiseInSequence(funcs, 5).then(console.log); // 9
```

## 八、总结

### 8.1 核心要点

- **状态管理**：三种状态，单向不可逆转换
- **异步处理**：基于回调队列实现
- **链式调用**：每个then返回新Promise
- **错误处理**：catch捕获链上所有错误

### 8.2 实现要点

1. 维护状态和值
2. 实现then的异步调用
3. 处理Promise嵌套
4. 实现链式调用
5. 处理边界情况

---

**相关文章：**
- [程序设计与分析](./program-design.md)
- [异步编程](./callback-hell.md)
- [迭代器与生成器](./iterator-generator.md)
