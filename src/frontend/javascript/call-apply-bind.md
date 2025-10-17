---
title: 手写 call/apply/bind
icon: logos:javascript
---

# 手写 call/apply/bind

## 1. 手写 call 函数

### 1.1 call 函数核心作用

call 函数的核心作用：**改变函数执行时的上下文（this指向）**，并立即执行该函数，同时支持传递参数。

### 1.2 call 函数代码实现

```javascript
// 在Function原型上添加myCall方法，让所有函数都能调用
Function.prototype.myCall = function(context) {
  // 1. 处理context为null/undefined的情况，此时this应指向全局对象
  context = context === null || context === undefined ? globalThis : Object(context)

  // 3. 生成一个唯一的属性名，避免覆盖context原有的属性
  const fnKey = Symbol('fn');
  
  // 4. 将当前函数（this）赋值给context的临时属性
  context[fnKey] = this;
  
  // 5. 提取除context外的其他参数
  const args = [...arguments].slice(1);
  
  // 6. 调用函数，此时函数内部的this会指向context
  const result = context[fnKey](...args);
  
  // 7. 删除临时属性，避免污染context
  delete context[fnKey];
  
  // 8. 返回函数执行结果
  return result;
};

// 测试示例
const person = {
  name: '张三'
};

function sayHello(age, hobby) {
  console.log(`我是${this.name}，今年${age}岁，喜欢${hobby}`);
  return '执行完毕';
}

// 使用自定义的myCall
const result = sayHello.myCall(person, 20, '打篮球');
console.log(result); // 输出：执行完毕
```

### 1.3 call 与 apply、bind 的区别

| 方法 | 参数传递方式 | 执行时机 | 返回值 |
|------|------------|---------|--------|
| **call** | 参数列表传递 | 立即执行 | 函数执行结果 |
| **apply** | 数组传递参数 | 立即执行 | 函数执行结果 |
| **bind** | 参数列表传递 | 返回新函数 | 绑定后的新函数 |

**示例对比：**

```javascript
const obj = { name: '李四' };

function greet(age, city) {
  console.log(`${this.name}, ${age}岁, 来自${city}`);
}

// call - 参数列表传递，立即执行
greet.call(obj, 25, '北京');

// apply - 数组传递参数，立即执行
greet.apply(obj, [25, '北京']);

// bind - 参数列表传递，返回新函数（需手动调用）
const boundGreet = greet.bind(obj, 25, '北京');
boundGreet(); // 手动调用
```

## 2. 手写 apply 函数

```javascript
Function.prototype.myApply = function(context, args) {
  // 处理context
  context = context === null || context === undefined ? globalThis : Object(context);
  
  // 生成唯一属性名
  const fnKey = Symbol('fn');
  
  // 将函数赋值给context
  context[fnKey] = this;
  
  // 执行函数，传入参数数组
  const result = context[fnKey](...(args || []));
  
  // 清理临时属性
  delete context[fnKey];
  
  return result;
};
```

## 3. 手写 bind 函数

```javascript
Function.prototype.myBind = function(context, ...args) {
  // 保存原函数
  const fn = this;
  
  // 返回一个新函数
  return function(...newArgs) {
    // 合并参数
    const allArgs = [...args, ...newArgs];
    
    // 使用apply执行原函数，改变this指向
    return fn.apply(context, allArgs);
  };
};
```

## 4. 实际应用场景

### 4.1 借用方法

```javascript
// 借用数组方法
const arrayLike = {
  0: 'a',
  1: 'b',
  2: 'c',
  length: 3
};

// 借用数组的slice方法
const arr = Array.prototype.slice.call(arrayLike);
console.log(arr); // ['a', 'b', 'c']
```

### 4.2 函数柯里化

```javascript
function add(a, b, c) {
  return a + b + c;
}

// 使用bind实现柯里化
const add5 = add.bind(null, 5);
console.log(add5(10, 15)); // 30
```

### 4.3 保存this引用

```javascript
const obj = {
  name: '王五',
  sayName: function() {
    setTimeout(function() {
      console.log(this.name);
    }.bind(this), 1000);
  }
};

obj.sayName(); // 1秒后输出：王五
```

## 5. 注意事项

### 5.1 箭头函数不能使用

```javascript
const arrowFn = () => {
  console.log(this);
};

// 箭头函数没有自己的this，call/apply/bind无法改变其this指向
arrowFn.call({ name: 'test' }); // this仍然指向外层作用域
```

### 5.2 原始值会被转换为对象

```javascript
function test() {
  console.log(this);
}

test.call(123); // Number {123}
test.call('hello'); // String {'hello'}
test.call(true); // Boolean {true}
```

---

> 💡 **核心要点：** call/apply/bind 都是用来改变函数 this 指向的方法，区别在于参数传递方式和执行时机。
