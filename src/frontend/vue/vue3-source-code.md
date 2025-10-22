---
title: Vue 3.0源码深度解析
date: 2025-10-22
icon: logos:vue
category:
  - Vue.js
tag:
  - Vue3
  - 源码解析
  - Composition API
  - Proxy响应式
---

# Vue 3.0源码深度解析

## 一、Vue 3.0架构概览

### 1.1 核心变化

```javascript
// Vue 3.0的重大改进
const Vue3Improvements = {
  performance: {
    proxy: 'Proxy替代Object.defineProperty',
    compile: '编译优化（静态提升、事件缓存）',
    treeshaking: '更好的Tree-shaking支持'
  },
  
  composition: {
    api: 'Composition API',
    hooks: '组合式函数',
    typescript: '更好的TypeScript支持'
  },
  
  architecture: {
    monorepo: 'Monorepo架构',
    modular: '模块化设计',
    packages: '独立的包'
  }
};
```

### 1.2 源码目录结构

```bash
packages/
├── compiler-core/      # 编译器核心
├── compiler-dom/       # 浏览器编译器
├── compiler-sfc/       # 单文件组件编译器
├── compiler-ssr/       # SSR编译器
├── reactivity/         # 响应式系统
├── runtime-core/       # 运行时核心
├── runtime-dom/        # 浏览器运行时
├── shared/             # 共享工具
├── vue/                # 完整构建版本
└── template-explorer/  # 模板浏览器
```

## 二、Proxy响应式系统

### 2.1 reactive实现

```javascript
// reactive函数实现
function reactive(target) {
  // 如果不是对象，直接返回
  if (!isObject(target)) {
    return target;
  }
  
  // 创建响应式代理
  return createReactiveObject(
    target,
    false,
    mutableHandlers,
    mutableCollectionHandlers
  );
}

// 创建响应式对象
function createReactiveObject(
  target,
  isReadonly,
  baseHandlers,
  collectionHandlers
) {
  // 如果已经是代理对象，直接返回
  if (target[ReactiveFlags.RAW]) {
    return target;
  }
  
  // 创建Proxy
  const proxy = new Proxy(target, baseHandlers);
  
  return proxy;
}
```

### 2.2 Proxy处理器

```javascript
// 基础处理器
const mutableHandlers = {
  // 拦截属性读取
  get(target, key, receiver) {
    // 处理特殊key
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true;
    }
    
    // 依赖收集
    track(target, TrackOpTypes.GET, key);
    
    const res = Reflect.get(target, key, receiver);
    
    // 如果是对象，递归响应式
    if (isObject(res)) {
      return reactive(res);
    }
    
    return res;
  },
  
  // 拦截属性设置
  set(target, key, value, receiver) {
    const oldValue = target[key];
    const result = Reflect.set(target, key, value, receiver);
    
    // 触发更新
    if (oldValue !== value) {
      trigger(target, TriggerOpTypes.SET, key, value, oldValue);
    }
    
    return result;
  },
  
  // 拦截属性删除
  deleteProperty(target, key) {
    const hadKey = hasOwn(target, key);
    const result = Reflect.deleteProperty(target, key);
    
    if (hadKey && result) {
      trigger(target, TriggerOpTypes.DELETE, key);
    }
    
    return result;
  },
  
  // 拦截 has 操作
  has(target, key) {
    const result = Reflect.has(target, key);
    track(target, TrackOpTypes.HAS, key);
    return result;
  },
  
  // 拦截 Object.keys
  ownKeys(target) {
    track(target, TrackOpTypes.ITERATE, ITERATE_KEY);
    return Reflect.ownKeys(target);
  }
};
```

### 2.3 依赖收集与触发

```javascript
// 依赖收集
let activeEffect = null;
const targetMap = new WeakMap();

function track(target, type, key) {
  if (!activeEffect) return;
  
  // 获取target的依赖Map
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }
  
  // 获取key的依赖Set
  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = new Set()));
  }
  
  // 添加依赖
  if (!dep.has(activeEffect)) {
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
  }
}

// 触发更新
function trigger(target, type, key, newValue, oldValue) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;
  
  const effects = new Set();
  
  // 收集需要执行的effect
  const add = (effectsToAdd) => {
    if (effectsToAdd) {
      effectsToAdd.forEach(effect => {
        if (effect !== activeEffect) {
          effects.add(effect);
        }
      });
    }
  };
  
  // 添加key对应的effects
  if (key !== void 0) {
    add(depsMap.get(key));
  }
  
  // 执行effects
  effects.forEach(effect => {
    if (effect.options.scheduler) {
      effect.options.scheduler(effect);
    } else {
      effect();
    }
  });
}
```

### 2.4 effect实现

```javascript
// effect函数
function effect(fn, options = {}) {
  const effect = createReactiveEffect(fn, options);
  
  if (!options.lazy) {
    effect();
  }
  
  return effect;
}

function createReactiveEffect(fn, options) {
  const effect = function reactiveEffect() {
    if (!effect.active) {
      return fn();
    }
    
    if (!effectStack.includes(effect)) {
      cleanup(effect);
      
      try {
        enableTracking();
        effectStack.push(effect);
        activeEffect = effect;
        return fn();
      } finally {
        effectStack.pop();
        resetTracking();
        activeEffect = effectStack[effectStack.length - 1];
      }
    }
  };
  
  effect.id = uid++;
  effect.active = true;
  effect.raw = fn;
  effect.deps = [];
  effect.options = options;
  
  return effect;
}
```

## 三、Composition API

### 3.1 ref实现

```javascript
// ref类
class RefImpl {
  constructor(value, isShallow) {
    this._rawValue = isShallow ? value : toRaw(value);
    this._value = isShallow ? value : toReactive(value);
    this.__v_isRef = true;
    this._shallow = isShallow;
  }
  
  get value() {
    // 依赖收集
    track(this, TrackOpTypes.GET, 'value');
    return this._value;
  }
  
  set value(newVal) {
    newVal = this._shallow ? newVal : toRaw(newVal);
    
    if (hasChanged(newVal, this._rawValue)) {
      this._rawValue = newVal;
      this._value = this._shallow ? newVal : toReactive(newVal);
      // 触发更新
      trigger(this, TriggerOpTypes.SET, 'value', newVal);
    }
  }
}

// ref函数
function ref(value) {
  return createRef(value, false);
}

function createRef(rawValue, shallow) {
  if (isRef(rawValue)) {
    return rawValue;
  }
  return new RefImpl(rawValue, shallow);
}
```

### 3.2 computed实现

```javascript
// computed实现
function computed(getterOrOptions) {
  let getter;
  let setter;
  
  if (isFunction(getterOrOptions)) {
    getter = getterOrOptions;
    setter = () => {
      console.warn('Write operation failed: computed value is readonly');
    };
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }
  
  return new ComputedRefImpl(getter, setter);
}

class ComputedRefImpl {
  constructor(getter, setter) {
    this._setter = setter;
    this._dirty = true;
    this._value = undefined;
    this.__v_isRef = true;
    
    // 创建effect
    this.effect = effect(getter, {
      lazy: true,
      scheduler: () => {
        if (!this._dirty) {
          this._dirty = true;
          trigger(this, TriggerOpTypes.SET, 'value');
        }
      }
    });
  }
  
  get value() {
    // 依赖收集
    track(this, TrackOpTypes.GET, 'value');
    
    // 懒计算
    if (this._dirty) {
      this._value = this.effect();
      this._dirty = false;
    }
    
    return this._value;
  }
  
  set value(newValue) {
    this._setter(newValue);
  }
}
```

### 3.3 watch实现

```javascript
// watch函数
function watch(source, cb, options = {}) {
  return doWatch(source, cb, options);
}

function doWatch(source, cb, { immediate, deep, flush } = {}) {
  let getter;
  
  // 处理不同的source类型
  if (isRef(source)) {
    getter = () => source.value;
  } else if (isReactive(source)) {
    getter = () => source;
    deep = true;
  } else if (isFunction(source)) {
    getter = () => source();
  }
  
  // 深度监听
  if (deep) {
    const baseGetter = getter;
    getter = () => traverse(baseGetter());
  }
  
  let oldValue;
  const job = () => {
    const newValue = effect.run();
    
    if (deep || hasChanged(newValue, oldValue)) {
      cb(newValue, oldValue);
      oldValue = newValue;
    }
  };
  
  const scheduler = () => {
    if (flush === 'post') {
      queuePostFlushCb(job);
    } else {
      job();
    }
  };
  
  const effect = new ReactiveEffect(getter, scheduler);
  
  // 立即执行
  if (immediate) {
    job();
  } else {
    oldValue = effect.run();
  }
  
  return () => {
    effect.stop();
  };
}

// 深度遍历
function traverse(value, seen = new Set()) {
  if (!isObject(value) || seen.has(value)) {
    return value;
  }
  
  seen.add(value);
  
  if (isRef(value)) {
    traverse(value.value, seen);
  } else if (isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      traverse(value[i], seen);
    }
  } else if (isObject(value)) {
    for (const key in value) {
      traverse(value[key], seen);
    }
  }
  
  return value;
}
```

## 四、编译优化

### 4.1 静态提升

```javascript
// 编译前
<div>
  <p>static text</p>
  <p>{{ dynamic }}</p>
</div>

// 编译后（静态提升）
const _hoisted_1 = /*#__PURE__*/ createElementVNode("p", null, "static text")

export function render(_ctx, _cache) {
  return (openBlock(), createElementBlock("div", null, [
    _hoisted_1,  // 静态节点被提升
    createElementVNode("p", null, toDisplayString(_ctx.dynamic))
  ]))
}
```

### 4.2 patch flag

```javascript
// 编译前
<div>
  <p :class="className">{{ text }}</p>
</div>

// 编译后（带patch flag）
export function render(_ctx, _cache) {
  return (openBlock(), createElementBlock("div", null, [
    createElementVNode("p", {
      class: _ctx.className
    }, toDisplayString(_ctx.text), 11 /* TEXT, CLASS */)
  ]))
}

// Patch Flags
const enum PatchFlags {
  TEXT = 1,           // 动态文本
  CLASS = 1 << 1,     // 动态class
  STYLE = 1 << 2,     // 动态style
  PROPS = 1 << 3,     // 动态属性
  FULL_PROPS = 1 << 4,
  HYDRATE_EVENTS = 1 << 5,
  STABLE_FRAGMENT = 1 << 6,
  KEYED_FRAGMENT = 1 << 7,
  UNKEYED_FRAGMENT = 1 << 8,
  NEED_PATCH = 1 << 9,
  DYNAMIC_SLOTS = 1 << 10,
  HOISTED = -1,       // 静态节点
  BAIL = -2           // diff算法应该退出优化模式
}
```

### 4.3 事件缓存

```javascript
// 编译前
<button @click="handleClick">Click</button>

// 编译后（事件缓存）
export function render(_ctx, _cache) {
  return (openBlock(), createElementBlock("button", {
    onClick: _cache[0] || (_cache[0] = (...args) => (_ctx.handleClick(...args)))
  }, "Click"))
}
```

## 五、Diff算法优化

### 5.1 最长递增子序列

```javascript
// Vue 3使用最长递增子序列优化移动操作
function getSequence(arr) {
  const p = arr.slice();
  const result = [0];
  let i, j, u, v, c;
  const len = arr.length;
  
  for (i = 0; i < len; i++) {
    const arrI = arr[i];
    
    if (arrI !== 0) {
      j = result[result.length - 1];
      
      if (arr[j] < arrI) {
        p[i] = j;
        result.push(i);
        continue;
      }
      
      u = 0;
      v = result.length - 1;
      
      while (u < v) {
        c = (u + v) >> 1;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }
      
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1];
        }
        result[u] = i;
      }
    }
  }
  
  u = result.length;
  v = result[u - 1];
  
  while (u-- > 0) {
    result[u] = v;
    v = p[v];
  }
  
  return result;
}
```

## 六、面试高频问题

### Q1: Vue 3相比Vue 2的优势？

**答案：**
1. **性能提升**：Proxy响应式、编译优化
2. **更好的TypeScript支持**
3. **Composition API**：更灵活的代码组织
4. **Tree-shaking支持**：更小的包体积
5. **更好的逻辑复用**

### Q2: Proxy相比Object.defineProperty的优势？

**答案：**
1. 可以监听数组索引变化
2. 可以监听属性的添加和删除
3. 不需要递归遍历对象
4. 性能更好

### Q3: Composition API解决了什么问题？

**答案：**
1. 逻辑复用困难（mixins问题）
2. 代码组织混乱（Options API限制）
3. TypeScript支持不好
4. 更灵活的逻辑组合

## 七、总结

### 7.1 核心要点

- **响应式**：Proxy + effect + track/trigger
- **Composition API**：ref + reactive + computed + watch
- **编译优化**：静态提升 + patch flag + 事件缓存
- **Diff算法**：最长递增子序列

### 7.2 学习建议

1. 掌握Proxy响应式原理
2. 熟练使用Composition API
3. 理解编译优化机制
4. 实践源码调试

---

**相关文章：**
- [Vue 2.0源码深度解析](./vue2-source-code.md)
- [Composition API最佳实践]()
