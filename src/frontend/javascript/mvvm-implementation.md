---
title: 手写MVVM框架
date: 2025-10-22
icon: logos:vue
category:
  - JavaScript
tag:
  - MVVM
  - 响应式原理
  - Vue
  - 框架设计
---

# 手写MVVM框架

## 一、MVVM 核心概念

### 1.1 什么是 MVVM

**MVVM**（Model-View-ViewModel）是一种软件架构模式：

- **Model**：数据模型，负责业务逻辑和数据
- **View**：视图层，负责页面展示
- **ViewModel**：视图模型，连接 Model 和 View

### 1.2 核心特性

```
View <---双向绑定---> ViewModel <----> Model

特性：
1. 数据驱动视图
2. 双向数据绑定
3. 自动更新 DOM
```

## 二、实现响应式系统

### 2.1 基于 Object.defineProperty

```javascript
class Observer {
  constructor(data) {
    this.walk(data);
  }
  
  walk(data) {
    if (!data || typeof data !== 'object') {
      return;
    }
    
    Object.keys(data).forEach(key => {
      this.defineReactive(data, key, data[key]);
    });
  }
  
  defineReactive(obj, key, val) {
    const dep = new Dep();
    
    // 递归观察子属性
    this.walk(val);
    
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get() {
        // 依赖收集
        if (Dep.target) {
          dep.addSub(Dep.target);
        }
        return val;
      },
      set(newVal) {
        if (newVal === val) {
          return;
        }
        val = newVal;
        // 通知更新
        dep.notify();
      }
    });
  }
}
```

### 2.2 基于 Proxy（Vue 3）

```javascript
class Observer {
  constructor(data) {
    return this.createProxy(data);
  }
  
  createProxy(data) {
    const dep = new Dep();
    
    return new Proxy(data, {
      get(target, key, receiver) {
        // 依赖收集
        if (Dep.target) {
          dep.addSub(Dep.target);
        }
        
        const result = Reflect.get(target, key, receiver);
        
        // 深度代理
        if (typeof result === 'object' && result !== null) {
          return new Observer(result);
        }
        
        return result;
      },
      
      set(target, key, value, receiver) {
        const oldValue = target[key];
        const result = Reflect.set(target, key, value, receiver);
        
        // 通知更新
        if (oldValue !== value) {
          dep.notify();
        }
        
        return result;
      }
    });
  }
}
```

## 三、依赖收集

### 3.1 Dep 类

```javascript
class Dep {
  constructor() {
    this.subs = [];
  }
  
  // 添加订阅者
  addSub(sub) {
    if (!this.subs.includes(sub)) {
      this.subs.push(sub);
    }
  }
  
  // 移除订阅者
  removeSub(sub) {
    const index = this.subs.indexOf(sub);
    if (index > -1) {
      this.subs.splice(index, 1);
    }
  }
  
  // 通知所有订阅者更新
  notify() {
    this.subs.forEach(sub => sub.update());
  }
}

// 当前正在收集的依赖
Dep.target = null;

// 依赖栈
const targetStack = [];

// 推入依赖
function pushTarget(target) {
  targetStack.push(target);
  Dep.target = target;
}

// 弹出依赖
function popTarget() {
  targetStack.pop();
  Dep.target = targetStack[targetStack.length - 1];
}
```

### 3.2 Watcher 类

```javascript
class Watcher {
  constructor(vm, exp, cb) {
    this.vm = vm;
    this.exp = exp; // 表达式
    this.cb = cb;   // 回调函数
    this.value = this.get();
  }
  
  get() {
    // 将当前 watcher 设置为依赖收集目标
    pushTarget(this);
    
    // 触发 getter，收集依赖
    const value = this.vm[this.exp];
    
    // 收集完成，移除目标
    popTarget();
    
    return value;
  }
  
  update() {
    const oldValue = this.value;
    const newValue = this.get();
    
    if (oldValue !== newValue) {
      this.value = newValue;
      this.cb.call(this.vm, newValue, oldValue);
    }
  }
}
```

## 四、模板编译

### 4.1 Compile 类

```javascript
class Compile {
  constructor(el, vm) {
    this.el = document.querySelector(el);
    this.vm = vm;
    
    if (this.el) {
      // 将节点移入文档片段
      this.fragment = this.nodeToFragment(this.el);
      // 编译
      this.compile(this.fragment);
      // 添加回 DOM
      this.el.appendChild(this.fragment);
    }
  }
  
  nodeToFragment(el) {
    const fragment = document.createDocumentFragment();
    let child;
    
    while (child = el.firstChild) {
      fragment.appendChild(child);
    }
    
    return fragment;
  }
  
  compile(el) {
    const childNodes = el.childNodes;
    
    Array.from(childNodes).forEach(node => {
      if (this.isElementNode(node)) {
        // 元素节点
        this.compileElement(node);
      } else if (this.isTextNode(node)) {
        // 文本节点
        this.compileText(node);
      }
      
      // 递归编译子节点
      if (node.childNodes && node.childNodes.length) {
        this.compile(node);
      }
    });
  }
  
  isElementNode(node) {
    return node.nodeType === 1;
  }
  
  isTextNode(node) {
    return node.nodeType === 3;
  }
}
```

### 4.2 指令编译

```javascript
class Compile {
  // ...前面的代码
  
  compileElement(node) {
    const attrs = node.attributes;
    
    Array.from(attrs).forEach(attr => {
      const attrName = attr.name;
      const exp = attr.value;
      
      // v-model
      if (attrName === 'v-model') {
        this.modelUpdater(node, this.vm, exp);
      }
      
      // v-text
      if (attrName === 'v-text') {
        this.textUpdater(node, this.vm, exp);
      }
      
      // v-html
      if (attrName === 'v-html') {
        this.htmlUpdater(node, this.vm, exp);
      }
      
      // @click
      if (attrName.startsWith('@')) {
        const eventName = attrName.substring(1);
        this.eventHandler(node, this.vm, exp, eventName);
      }
    });
  }
  
  compileText(node) {
    const text = node.textContent;
    const reg = /\{\{(.+?)\}\}/g;
    
    if (reg.test(text)) {
      this.textUpdater(node, this.vm, text);
    }
  }
  
  // v-model 更新器
  modelUpdater(node, vm, exp) {
    const updateFn = () => {
      node.value = vm[exp];
    };
    
    // 初始化
    updateFn();
    
    // 添加 watcher
    new Watcher(vm, exp, updateFn);
    
    // 监听输入事件
    node.addEventListener('input', e => {
      vm[exp] = e.target.value;
    });
  }
  
  // v-text 更新器
  textUpdater(node, vm, exp) {
    const updateFn = () => {
      node.textContent = this.getTextValue(vm, exp);
    };
    
    updateFn();
    
    // 为每个插值表达式添加 watcher
    exp.replace(/\{\{(.+?)\}\}/g, (_, key) => {
      new Watcher(vm, key.trim(), updateFn);
    });
  }
  
  getTextValue(vm, exp) {
    return exp.replace(/\{\{(.+?)\}\}/g, (_, key) => {
      return vm[key.trim()];
    });
  }
  
  // 事件处理
  eventHandler(node, vm, exp, eventName) {
    const fn = vm.$options.methods && vm.$options.methods[exp];
    
    if (eventName && fn) {
      node.addEventListener(eventName, fn.bind(vm));
    }
  }
}
```

## 五、MVVM 类

### 5.1 完整实现

```javascript
class MVVM {
  constructor(options) {
    this.$options = options;
    this.$data = options.data;
    this.$el = options.el;
    
    // 数据代理
    this.proxyData(this.$data);
    
    // 数据劫持
    new Observer(this.$data);
    
    // 模板编译
    if (this.$el) {
      new Compile(this.$el, this);
    }
  }
  
  // 将 data 代理到 vm 实例上
  proxyData(data) {
    Object.keys(data).forEach(key => {
      Object.defineProperty(this, key, {
        enumerable: true,
        configurable: true,
        get() {
          return data[key];
        },
        set(newVal) {
          data[key] = newVal;
        }
      });
    });
  }
}
```

### 5.2 使用示例

```html
<!DOCTYPE html>
<html>
<head>
  <title>MVVM Framework</title>
</head>
<body>
  <div id="app">
    <h1>{{ title }}</h1>
    <p>{{ message }}</p>
    
    <input type="text" v-model="message">
    
    <p v-text="message"></p>
    
    <button @click="handleClick">点击</button>
  </div>

  <script src="mvvm.js"></script>
  <script>
    const vm = new MVVM({
      el: '#app',
      data: {
        title: 'MVVM Framework',
        message: 'Hello World'
      },
      methods: {
        handleClick() {
          this.message = 'Clicked!';
        }
      }
    });
    
    // 测试响应式
    setTimeout(() => {
      vm.message = 'Updated!';
    }, 2000);
  </script>
</body>
</html>
```

## 六、计算属性

### 6.1 实现 Computed

```javascript
class MVVM {
  constructor(options) {
    this.$options = options;
    this.$data = options.data;
    this.$el = options.el;
    
    // 初始化计算属性
    this.initComputed(options.computed);
    
    // 数据代理
    this.proxyData(this.$data);
    
    // 数据劫持
    new Observer(this.$data);
    
    // 模板编译
    if (this.$el) {
      new Compile(this.$el, this);
    }
  }
  
  initComputed(computed) {
    if (!computed) return;
    
    Object.keys(computed).forEach(key => {
      Object.defineProperty(this, key, {
        get: () => {
          return computed[key].call(this);
        },
        set: () => {
          console.warn('计算属性不能被赋值');
        }
      });
    });
  }
}

// 使用
const vm = new MVVM({
  el: '#app',
  data: {
    firstName: 'John',
    lastName: 'Doe'
  },
  computed: {
    fullName() {
      return `${this.firstName} ${this.lastName}`;
    }
  }
});
```

## 七、侦听器

### 7.1 实现 Watch

```javascript
class MVVM {
  constructor(options) {
    // ...其他代码
    
    // 初始化侦听器
    this.initWatch(options.watch);
  }
  
  initWatch(watch) {
    if (!watch) return;
    
    Object.keys(watch).forEach(key => {
      const handler = watch[key];
      new Watcher(this, key, (newVal, oldVal) => {
        handler.call(this, newVal, oldVal);
      });
    });
  }
}

// 使用
const vm = new MVVM({
  el: '#app',
  data: {
    message: 'Hello'
  },
  watch: {
    message(newVal, oldVal) {
      console.log('message changed:', oldVal, '->', newVal);
    }
  }
});
```

## 八、虚拟 DOM（简化版）

### 8.1 VNode 类

```javascript
class VNode {
  constructor(tag, data, children, text) {
    this.tag = tag;         // 标签名
    this.data = data;       // 属性
    this.children = children; // 子节点
    this.text = text;       // 文本内容
    this.el = null;         // 真实 DOM
  }
}

// 创建元素节点
function createElement(tag, data, children) {
  return new VNode(tag, data, children, undefined);
}

// 创建文本节点
function createTextNode(text) {
  return new VNode(undefined, undefined, undefined, text);
}
```

### 8.2 渲染函数

```javascript
function render(vnode) {
  if (typeof vnode === 'string') {
    return document.createTextNode(vnode);
  }
  
  const el = document.createElement(vnode.tag);
  
  // 设置属性
  if (vnode.data) {
    Object.keys(vnode.data).forEach(key => {
      el.setAttribute(key, vnode.data[key]);
    });
  }
  
  // 渲染子节点
  if (vnode.children) {
    vnode.children.forEach(child => {
      el.appendChild(render(child));
    });
  }
  
  // 文本节点
  if (vnode.text) {
    el.textContent = vnode.text;
  }
  
  vnode.el = el;
  return el;
}
```

### 8.3 Diff 算法

```javascript
function patch(oldVnode, newVnode) {
  // 节点类型不同，直接替换
  if (oldVnode.tag !== newVnode.tag) {
    const newEl = render(newVnode);
    oldVnode.el.parentNode.replaceChild(newEl, oldVnode.el);
    return newVnode;
  }
  
  // 文本节点
  if (!newVnode.tag) {
    if (oldVnode.text !== newVnode.text) {
      oldVnode.el.textContent = newVnode.text;
    }
    return newVnode;
  }
  
  // 复用元素
  const el = newVnode.el = oldVnode.el;
  
  // 更新属性
  updateProps(oldVnode.data, newVnode.data, el);
  
  // 更新子节点
  updateChildren(oldVnode.children, newVnode.children, el);
  
  return newVnode;
}

function updateProps(oldProps = {}, newProps = {}, el) {
  // 删除旧属性
  Object.keys(oldProps).forEach(key => {
    if (!(key in newProps)) {
      el.removeAttribute(key);
    }
  });
  
  // 添加或更新新属性
  Object.keys(newProps).forEach(key => {
    if (oldProps[key] !== newProps[key]) {
      el.setAttribute(key, newProps[key]);
    }
  });
}

function updateChildren(oldChildren = [], newChildren = [], el) {
  const len = Math.max(oldChildren.length, newChildren.length);
  
  for (let i = 0; i < len; i++) {
    if (!oldChildren[i]) {
      // 新增节点
      el.appendChild(render(newChildren[i]));
    } else if (!newChildren[i]) {
      // 删除节点
      el.removeChild(oldChildren[i].el);
    } else {
      // 对比更新
      patch(oldChildren[i], newChildren[i]);
    }
  }
}
```

## 九、生命周期

### 9.1 实现生命周期钩子

```javascript
class MVVM {
  constructor(options) {
    this.$options = options;
    this.$data = options.data;
    this.$el = options.el;
    
    // beforeCreate
    this.callHook('beforeCreate');
    
    // 初始化数据
    this.initData();
    
    // created
    this.callHook('created');
    
    // beforeMount
    this.callHook('beforeMount');
    
    // 挂载
    if (this.$el) {
      this.mount();
      
      // mounted
      this.callHook('mounted');
    }
  }
  
  callHook(hook) {
    const handler = this.$options[hook];
    if (handler) {
      handler.call(this);
    }
  }
  
  initData() {
    this.proxyData(this.$data);
    new Observer(this.$data);
  }
  
  mount() {
    new Compile(this.$el, this);
  }
}

// 使用
const vm = new MVVM({
  el: '#app',
  data: {
    message: 'Hello'
  },
  beforeCreate() {
    console.log('beforeCreate');
  },
  created() {
    console.log('created');
  },
  beforeMount() {
    console.log('beforeMount');
  },
  mounted() {
    console.log('mounted');
  }
});
```

## 十、完整代码示例

### 10.1 完整的 MVVM 框架

```javascript
// mvvm.js - 完整实现
(function(global) {
  // Dep 类
  class Dep {
    constructor() {
      this.subs = [];
    }
    
    addSub(sub) {
      if (!this.subs.includes(sub)) {
        this.subs.push(sub);
      }
    }
    
    notify() {
      this.subs.forEach(sub => sub.update());
    }
  }
  
  Dep.target = null;
  
  // Observer 类
  class Observer {
    constructor(data) {
      this.walk(data);
    }
    
    walk(data) {
      if (!data || typeof data !== 'object') {
        return;
      }
      
      Object.keys(data).forEach(key => {
        this.defineReactive(data, key, data[key]);
      });
    }
    
    defineReactive(obj, key, val) {
      const dep = new Dep();
      this.walk(val);
      
      Object.defineProperty(obj, key, {
        enumerable: true,
        configurable: true,
        get() {
          if (Dep.target) {
            dep.addSub(Dep.target);
          }
          return val;
        },
        set(newVal) {
          if (newVal === val) return;
          val = newVal;
          dep.notify();
        }
      });
    }
  }
  
  // Watcher 类
  class Watcher {
    constructor(vm, exp, cb) {
      this.vm = vm;
      this.exp = exp;
      this.cb = cb;
      this.value = this.get();
    }
    
    get() {
      Dep.target = this;
      const value = this.vm[this.exp];
      Dep.target = null;
      return value;
    }
    
    update() {
      const newValue = this.vm[this.exp];
      const oldValue = this.value;
      if (newValue !== oldValue) {
        this.value = newValue;
        this.cb.call(this.vm, newValue, oldValue);
      }
    }
  }
  
  // Compile 类
  class Compile {
    constructor(el, vm) {
      this.el = document.querySelector(el);
      this.vm = vm;
      
      if (this.el) {
        this.fragment = this.nodeToFragment(this.el);
        this.compile(this.fragment);
        this.el.appendChild(this.fragment);
      }
    }
    
    nodeToFragment(el) {
      const fragment = document.createDocumentFragment();
      let child;
      while (child = el.firstChild) {
        fragment.appendChild(child);
      }
      return fragment;
    }
    
    compile(el) {
      const childNodes = el.childNodes;
      
      Array.from(childNodes).forEach(node => {
        if (node.nodeType === 1) {
          this.compileElement(node);
        } else if (node.nodeType === 3) {
          this.compileText(node);
        }
        
        if (node.childNodes && node.childNodes.length) {
          this.compile(node);
        }
      });
    }
    
    compileElement(node) {
      const attrs = node.attributes;
      
      Array.from(attrs).forEach(attr => {
        const name = attr.name;
        const exp = attr.value;
        
        if (name === 'v-model') {
          this.model(node, this.vm, exp);
        } else if (name === 'v-text') {
          this.text(node, this.vm, exp);
        } else if (name.startsWith('@')) {
          this.eventHandler(node, this.vm, exp, name.substring(1));
        }
      });
    }
    
    compileText(node) {
      const reg = /\{\{(.+?)\}\}/g;
      const text = node.textContent;
      
      if (reg.test(text)) {
        const tokens = text.match(reg);
        
        const updateFn = () => {
          node.textContent = text.replace(reg, (_, key) => {
            return this.vm[key.trim()];
          });
        };
        
        updateFn();
        
        tokens.forEach(token => {
          const key = token.replace(/\{\{|\}\}/g, '').trim();
          new Watcher(this.vm, key, updateFn);
        });
      }
    }
    
    model(node, vm, exp) {
      const updateFn = () => {
        node.value = vm[exp];
      };
      
      updateFn();
      new Watcher(vm, exp, updateFn);
      
      node.addEventListener('input', e => {
        vm[exp] = e.target.value;
      });
    }
    
    text(node, vm, exp) {
      const updateFn = () => {
        node.textContent = vm[exp];
      };
      
      updateFn();
      new Watcher(vm, exp, updateFn);
    }
    
    eventHandler(node, vm, exp, eventName) {
      const fn = vm.$options.methods && vm.$options.methods[exp];
      if (fn) {
        node.addEventListener(eventName, fn.bind(vm));
      }
    }
  }
  
  // MVVM 类
  class MVVM {
    constructor(options) {
      this.$options = options;
      this.$data = options.data;
      this.$el = options.el;
      
      this.proxyData(this.$data);
      new Observer(this.$data);
      
      if (this.$el) {
        new Compile(this.$el, this);
      }
    }
    
    proxyData(data) {
      Object.keys(data).forEach(key => {
        Object.defineProperty(this, key, {
          enumerable: true,
          configurable: true,
          get() {
            return data[key];
          },
          set(newVal) {
            data[key] = newVal;
          }
        });
      });
    }
  }
  
  // 导出
  global.MVVM = MVVM;
})(window);
```

## 十一、总结

### 核心要点

1. **数据劫持**：通过 Object.defineProperty 或 Proxy
2. **依赖收集**：Dep 和 Watcher 实现发布订阅
3. **模板编译**：解析指令和插值表达式
4. **双向绑定**：数据变化更新视图，视图变化更新数据

### 实现流程

```
1. 初始化数据
   ↓
2. 数据劫持（Observer）
   ↓
3. 编译模板（Compile）
   ↓
4. 创建 Watcher
   ↓
5. 依赖收集（Dep）
   ↓
6. 数据变化通知更新
```

### 优化方向

1. 异步更新队列
2. 虚拟 DOM
3. 更完善的 Diff 算法
4. 组件化系统
5. 性能优化

---

**相关文章：**
- [Proxy与Reflect](./proxy-reflect.md)
- [设计模式](./design-patterns.md)
- [Vue源码解析](../vue/vue3-source-code.md)
