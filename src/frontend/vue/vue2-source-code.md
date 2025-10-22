---
title: Vue 2.0源码深度解析
date: 2025-10-22
icon: logos:vue
category:
  - Vue.js
tag:
  - Vue2
  - 源码解析
  - 响应式原理
  - 虚拟DOM
---

# Vue 2.0源码深度解析

## 一、Vue 2.0架构概览

### 1.1 核心模块

```javascript
// Vue 2.0核心架构
const Vue2Architecture = {
  core: {
    observer: '响应式系统',
    vdom: '虚拟DOM',
    compiler: '模板编译器',
    instance: '实例化'
  },
  platforms: {
    web: '浏览器平台',
    weex: 'Weex平台'
  },
  runtime: {
    components: '内置组件',
    directives: '内置指令'
  }
};
```

### 1.2 源码目录结构

```bash
src/
├── compiler/        # 编译器
│   ├── parser/      # 模板解析
│   ├── codegen/     # 代码生成
│   └── optimizer/   # 优化
├── core/            # 核心代码
│   ├── observer/    # 响应式系统
│   ├── vdom/        # 虚拟DOM
│   ├── instance/    # Vue实例
│   ├── global-api/  # 全局API
│   └── components/  # 内置组件
├── platforms/       # 平台相关
│   ├── web/         # Web平台
│   └── weex/        # Weex平台
└── shared/          # 共享工具
```

## 二、响应式原理

### 2.1 Object.defineProperty

```javascript
// 响应式核心实现
function defineReactive(obj, key, val) {
  // 依赖收集器
  const dep = new Dep();
  
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    
    // getter：依赖收集
    get: function reactiveGetter() {
      console.log(`获取${key}: ${val}`);
      
      // 如果有正在计算的watcher，添加依赖
      if (Dep.target) {
        dep.depend();
      }
      
      return val;
    },
    
    // setter：派发更新
    set: function reactiveSetter(newVal) {
      if (newVal === val) return;
      
      console.log(`设置${key}: ${newVal}`);
      val = newVal;
      
      // 通知所有依赖更新
      dep.notify();
    }
  });
}

// 使用示例
const obj = {};
defineReactive(obj, 'name', 'Vue');

obj.name;           // 触发getter
obj.name = 'React'; // 触发setter
```

### 2.2 Dep依赖收集器

```javascript
// 依赖收集器类
class Dep {
  constructor() {
    this.id = uid++;
    this.subs = []; // 订阅者数组
  }
  
  // 添加订阅者
  addSub(sub) {
    this.subs.push(sub);
  }
  
  // 移除订阅者
  removeSub(sub) {
    const index = this.subs.indexOf(sub);
    if (index > -1) {
      this.subs.splice(index, 1);
    }
  }
  
  // 依赖收集
  depend() {
    if (Dep.target) {
      Dep.target.addDep(this);
    }
  }
  
  // 通知所有订阅者更新
  notify() {
    const subs = this.subs.slice();
    
    for (let i = 0; i < subs.length; i++) {
      subs[i].update();
    }
  }
}

// 当前正在计算的Watcher
Dep.target = null;
const targetStack = [];

// 入栈
function pushTarget(target) {
  targetStack.push(target);
  Dep.target = target;
}

// 出栈
function popTarget() {
  targetStack.pop();
  Dep.target = targetStack[targetStack.length - 1];
}
```

### 2.3 Watcher观察者

```javascript
// Watcher类
class Watcher {
  constructor(vm, expOrFn, cb) {
    this.vm = vm;
    this.cb = cb;
    this.deps = [];
    this.depIds = new Set();
    
    // 解析表达式
    if (typeof expOrFn === 'function') {
      this.getter = expOrFn;
    } else {
      this.getter = parsePath(expOrFn);
    }
    
    // 立即计算value
    this.value = this.get();
  }
  
  // 计算value并收集依赖
  get() {
    // 将当前watcher设为Dep.target
    pushTarget(this);
    
    let value;
    try {
      // 触发getter，收集依赖
      value = this.getter.call(this.vm, this.vm);
    } finally {
      popTarget();
    }
    
    return value;
  }
  
  // 添加依赖
  addDep(dep) {
    const id = dep.id;
    if (!this.depIds.has(id)) {
      this.depIds.add(id);
      this.deps.push(dep);
      dep.addSub(this);
    }
  }
  
  // 更新
  update() {
    const oldValue = this.value;
    this.value = this.get();
    this.cb.call(this.vm, this.value, oldValue);
  }
}

// 解析路径
function parsePath(path) {
  const segments = path.split('.');
  return function(obj) {
    for (let i = 0; i < segments.length; i++) {
      if (!obj) return;
      obj = obj[segments[i]];
    }
    return obj;
  };
}
```

### 2.4 Observer观察者

```javascript
// Observer类：将对象转换为响应式
class Observer {
  constructor(value) {
    this.value = value;
    this.dep = new Dep();
    
    // 给value添加__ob__属性，指向Observer实例
    def(value, '__ob__', this);
    
    if (Array.isArray(value)) {
      // 数组的响应式处理
      this.observeArray(value);
    } else {
      // 对象的响应式处理
      this.walk(value);
    }
  }
  
  // 遍历对象的每个属性
  walk(obj) {
    const keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i]);
    }
  }
  
  // 观察数组每一项
  observeArray(items) {
    for (let i = 0; i < items.length; i++) {
      observe(items[i]);
    }
  }
}

// 工厂函数
function observe(value) {
  if (!isObject(value)) {
    return;
  }
  
  let ob;
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__;
  } else {
    ob = new Observer(value);
  }
  
  return ob;
}
```

## 三、虚拟DOM与Diff算法

### 3.1 VNode类

```javascript
// VNode类定义
class VNode {
  constructor(
    tag,        // 标签名
    data,       // 数据对象
    children,   // 子节点
    text,       // 文本内容
    elm,        // 真实DOM
    context,    // 组件实例
    componentOptions
  ) {
    this.tag = tag;
    this.data = data;
    this.children = children;
    this.text = text;
    this.elm = elm;
    this.context = context;
    this.key = data && data.key;
    this.componentOptions = componentOptions;
    this.componentInstance = null;
  }
}

// 创建元素VNode
function createElementVNode(tag, data, children) {
  return new VNode(tag, data, children);
}

// 创建文本VNode
function createTextVNode(text) {
  return new VNode(undefined, undefined, undefined, String(text));
}

// 创建注释VNode
function createCommentVNode(text) {
  const vnode = new VNode();
  vnode.text = text;
  vnode.isComment = true;
  return vnode;
}
```

### 3.2 Patch过程

```javascript
// patch函数：对比新旧VNode并更新DOM
function patch(oldVnode, vnode) {
  // 如果oldVnode不存在，创建新节点
  if (!oldVnode) {
    createElm(vnode);
  }
  // 如果是相同节点，执行patchVnode
  else if (sameVnode(oldVnode, vnode)) {
    patchVnode(oldVnode, vnode);
  }
  // 如果不是相同节点，替换
  else {
    const oldElm = oldVnode.elm;
    const parentElm = nodeOps.parentNode(oldElm);
    
    // 创建新节点
    createElm(vnode, parentElm, nodeOps.nextSibling(oldElm));
    
    // 删除旧节点
    if (parentElm) {
      removeVnodes([oldVnode], 0, 0);
    }
  }
  
  return vnode.elm;
}

// 判断是否为相同节点
function sameVnode(a, b) {
  return (
    a.key === b.key &&
    a.tag === b.tag &&
    a.isComment === b.isComment &&
    isDef(a.data) === isDef(b.data) &&
    sameInputType(a, b)
  );
}
```

### 3.3 Diff算法核心

```javascript
// 对比新旧VNode
function patchVnode(oldVnode, vnode) {
  // 如果新旧VNode完全相同，直接返回
  if (oldVnode === vnode) {
    return;
  }
  
  const elm = vnode.elm = oldVnode.elm;
  const oldCh = oldVnode.children;
  const ch = vnode.children;
  
  // 如果vnode是文本节点
  if (isUndef(vnode.text)) {
    // 新旧都有children
    if (isDef(oldCh) && isDef(ch)) {
      if (oldCh !== ch) {
        // 核心：更新子节点
        updateChildren(elm, oldCh, ch);
      }
    }
    // 只有新的有children
    else if (isDef(ch)) {
      if (isDef(oldVnode.text)) {
        nodeOps.setTextContent(elm, '');
      }
      addVnodes(elm, null, ch, 0, ch.length - 1);
    }
    // 只有旧的有children
    else if (isDef(oldCh)) {
      removeVnodes(oldCh, 0, oldCh.length - 1);
    }
    // 旧的有文本
    else if (isDef(oldVnode.text)) {
      nodeOps.setTextContent(elm, '');
    }
  }
  // 新的是文本节点
  else if (oldVnode.text !== vnode.text) {
    nodeOps.setTextContent(elm, vnode.text);
  }
}

// 更新子节点（双端Diff算法）
function updateChildren(parentElm, oldCh, newCh) {
  let oldStartIdx = 0;
  let newStartIdx = 0;
  let oldEndIdx = oldCh.length - 1;
  let newEndIdx = newCh.length - 1;
  let oldStartVnode = oldCh[0];
  let oldEndVnode = oldCh[oldEndIdx];
  let newStartVnode = newCh[0];
  let newEndVnode = newCh[newEndIdx];
  let oldKeyToIdx, idxInOld, vnodeToMove;
  
  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (isUndef(oldStartVnode)) {
      oldStartVnode = oldCh[++oldStartIdx];
    } else if (isUndef(oldEndVnode)) {
      oldEndVnode = oldCh[--oldEndIdx];
    }
    // 旧开始 vs 新开始
    else if (sameVnode(oldStartVnode, newStartVnode)) {
      patchVnode(oldStartVnode, newStartVnode);
      oldStartVnode = oldCh[++oldStartIdx];
      newStartVnode = newCh[++newStartIdx];
    }
    // 旧结束 vs 新结束
    else if (sameVnode(oldEndVnode, newEndVnode)) {
      patchVnode(oldEndVnode, newEndVnode);
      oldEndVnode = oldCh[--oldEndIdx];
      newEndVnode = newCh[--newEndIdx];
    }
    // 旧开始 vs 新结束
    else if (sameVnode(oldStartVnode, newEndVnode)) {
      patchVnode(oldStartVnode, newEndVnode);
      nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm));
      oldStartVnode = oldCh[++oldStartIdx];
      newEndVnode = newCh[--newEndIdx];
    }
    // 旧结束 vs 新开始
    else if (sameVnode(oldEndVnode, newStartVnode)) {
      patchVnode(oldEndVnode, newStartVnode);
      nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
      oldEndVnode = oldCh[--oldEndIdx];
      newStartVnode = newCh[++newStartIdx];
    }
    // 以上都不匹配
    else {
      // 创建旧节点的key -> index映射
      if (isUndef(oldKeyToIdx)) {
        oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
      }
      
      idxInOld = isDef(newStartVnode.key)
        ? oldKeyToIdx[newStartVnode.key]
        : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx);
      
      // 没找到，创建新元素
      if (isUndef(idxInOld)) {
        createElm(newStartVnode, parentElm, oldStartVnode.elm);
      }
      // 找到了
      else {
        vnodeToMove = oldCh[idxInOld];
        if (sameVnode(vnodeToMove, newStartVnode)) {
          patchVnode(vnodeToMove, newStartVnode);
          oldCh[idxInOld] = undefined;
          nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm);
        } else {
          createElm(newStartVnode, parentElm, oldStartVnode.elm);
        }
      }
      
      newStartVnode = newCh[++newStartIdx];
    }
  }
  
  // 处理剩余节点
  if (oldStartIdx > oldEndIdx) {
    // 旧的处理完了，新的还有，添加新节点
    addVnodes(parentElm, null, newCh, newStartIdx, newEndIdx);
  } else if (newStartIdx > newEndIdx) {
    // 新的处理完了，旧的还有，删除旧节点
    removeVnodes(oldCh, oldStartIdx, oldEndIdx);
  }
}
```

## 四、模板编译原理

### 4.1 编译流程

```javascript
// 编译器入口
function compile(template, options) {
  // 1. 解析：template -> AST
  const ast = parse(template.trim(), options);
  
  // 2. 优化：标记静态节点
  if (options.optimize !== false) {
    optimize(ast, options);
  }
  
  // 3. 生成：AST -> render函数代码
  const code = generate(ast, options);
  
  return {
    ast,
    render: code.render,
    staticRenderFns: code.staticRenderFns
  };
}
```

### 4.2 模板解析

```javascript
// 简化的模板解析
function parse(template) {
  const stack = [];
  let root;
  let currentParent;
  
  parseHTML(template, {
    start(tag, attrs, unary) {
      const element = createASTElement(tag, attrs, currentParent);
      
      if (!root) {
        root = element;
      }
      
      if (currentParent) {
        currentParent.children.push(element);
        element.parent = currentParent;
      }
      
      if (!unary) {
        currentParent = element;
        stack.push(element);
      }
    },
    
    end() {
      stack.pop();
      currentParent = stack[stack.length - 1];
    },
    
    chars(text) {
      if (!currentParent) return;
      
      text = text.trim();
      if (text) {
        currentParent.children.push({
          type: 3,
          text
        });
      }
    }
  });
  
  return root;
}

// 创建AST元素
function createASTElement(tag, attrs, parent) {
  return {
    type: 1,
    tag,
    attrsList: attrs,
    attrsMap: makeAttrsMap(attrs),
    parent,
    children: []
  };
}
```

### 4.3 代码生成

```javascript
// 生成render函数代码
function generate(ast) {
  const code = ast ? genElement(ast) : '_c("div")';
  
  return {
    render: `with(this){return ${code}}`
  };
}

// 生成元素代码
function genElement(el) {
  if (el.for) {
    return genFor(el);
  } else if (el.if) {
    return genIf(el);
  } else {
    return genNode(el);
  }
}

function genNode(node) {
  if (node.type === 1) {
    return genElement(node);
  } else {
    return genText(node);
  }
}

function genText(text) {
  return `_v(${JSON.stringify(text.text)})`;
}

// 示例输出
// <div id="app">{{ message }}</div>
// 编译为：
// _c('div', { attrs: { "id": "app" }}, [_v(_s(message))])
```

## 五、组件化原理

### 5.1 组件注册

```javascript
// 全局注册
Vue.component('my-component', {
  template: '<div>{{ message }}</div>',
  data() {
    return {
      message: 'Hello'
    };
  }
});

// 实现原理
Vue.component = function(id, definition) {
  if (!definition) {
    return this.options.components[id];
  }
  
  definition = this.extend(definition);
  this.options.components[id] = definition;
  
  return definition;
};
```

### 5.2 组件实例化

```javascript
// 创建组件实例
function createComponentInstanceForVnode(vnode, parent) {
  const options = {
    _isComponent: true,
    _parentVnode: vnode,
    parent
  };
  
  return new vnode.componentOptions.Ctor(options);
}
```

## 六、生命周期实现

```javascript
// 生命周期调用
function callHook(vm, hook) {
  const handlers = vm.$options[hook];
  
  if (handlers) {
    for (let i = 0; i < handlers.length; i++) {
      try {
        handlers[i].call(vm);
      } catch (e) {
        handleError(e, vm, `${hook} hook`);
      }
    }
  }
}

// 挂载过程中的生命周期
Vue.prototype.$mount = function(el) {
  const vm = this;
  
  callHook(vm, 'beforeMount');
  
  const updateComponent = () => {
    vm._update(vm._render());
  };
  
  new Watcher(vm, updateComponent, noop, {
    before() {
      if (vm._isMounted) {
        callHook(vm, 'beforeUpdate');
      }
    }
  });
  
  vm._isMounted = true;
  callHook(vm, 'mounted');
  
  return vm;
};
```

## 七、面试高频问题

### Q1: Vue 2的响应式原理？

**答案：**
1. 使用Object.defineProperty劫持数据
2. getter中收集依赖（Dep）
3. setter中通知更新（notify）
4. Watcher作为中介连接组件和数据

### Q2: 双端Diff算法的优势？

**答案：**
- 同时从新旧节点的两端开始比较
- 四种快速匹配：开始-开始、结束-结束、开始-结束、结束-开始
- 减少不必要的DOM操作
- 时间复杂度O(n)

### Q3: Vue的数组监听如何实现？

**答案：**
```javascript
const arrayProto = Array.prototype;
const arrayMethods = Object.create(arrayProto);

['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse']
  .forEach(method => {
    arrayMethods[method] = function(...args) {
      const result = arrayProto[method].apply(this, args);
      const ob = this.__ob__;
      ob.dep.notify(); // 触发更新
      return result;
    };
  });
```

## 八、总结

### 8.1 核心要点

- **响应式**：Object.defineProperty + Dep + Watcher
- **虚拟DOM**：VNode + Diff算法
- **编译器**：parse -> optimize -> generate
- **组件化**：组件注册 + 实例化 + 生命周期

### 8.2 学习建议

1. 理解响应式原理
2. 掌握虚拟DOM和Diff
3. 学习模板编译过程
4. 实践源码调试

---

**相关文章：**
- [Vue 3.0源码深度解析](./vue3-source-code.md)
- [Vue组件设计模式]()
