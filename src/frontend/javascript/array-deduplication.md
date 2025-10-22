---
title: 对象数组去重
icon: logos:javascript
category:
  - JavaScript
tag:
  - JavaScript
  - 数组
  - 去重
  - 算法
---

# 对象数组去重

## 1. 核心思想

对象数组去重的核心在于：**将复杂的对象属性（包括数组）转换为可比较的唯一标识**，然后使用 Map 或 Set 进行去重。

## 2. 辅助函数：stringify

```javascript
// 辅助函数：将数组或对象转换为可比较的字符串
function stringify(value) {
  // 对数组或对象进行深度序列化
  return typeof value === 'object' && value !== null 
    ? JSON.stringify(value) 
    : String(value);
}
```

### 作用说明：
- **处理对象/数组：** 使用 `JSON.stringify()` 转换为字符串
- **处理基本类型：** 使用 `String()` 转换为字符串
- **统一格式：** 将不同类型的值统一为字符串，便于比较

## 3. 方法1：根据单个键去重

### 3.1 实现代码

```javascript
// 方法1：根据包含数组的单个键去重
function uniqueByKeyWithArray(arr, key) {
  const map = new Map();
  return arr.filter(item => {
    // 将数组属性转换为字符串作为唯一标识
    const uniqueKey = stringify(item[key]);
    if (!map.has(uniqueKey)) {
      map.set(uniqueKey, true);
      return true;
    }
    return false;
  });
}
```

### 3.2 使用示例

```javascript
const data = [
  { id: 1, tags: ['js', 'html'], name: '张三' },
  { id: 2, tags: ['css', 'react'], name: '李四' },
  { id: 1, tags: ['js', 'html'], name: '张三' }, // 重复
  { id: 3, tags: ['js', 'vue'], name: '王五' },
  { id: 1, tags: ['html', 'js'], name: '张三' }  // tags顺序不同，视为不同
];

// 按 tags 数组去重
const result = uniqueByKeyWithArray(data, 'tags');
console.log('按tags数组去重：', result);
```

### 3.3 输出结果

```javascript
[
  { id: 1, tags: ['js', 'html'], name: '张三' },
  { id: 2, tags: ['css', 'react'], name: '李四' },
  { id: 3, tags: ['js', 'vue'], name: '王五' },
  { id: 1, tags: ['html', 'js'], name: '张三' }  // 顺序不同，保留
]
```

## 4. 方法2：根据多个键组合去重

### 4.1 实现代码

```javascript
// 方法2：根据多个键（可能包含数组）组合去重
function uniqueByKeysWithArray(arr, keys) {
  const map = new Map();
  return arr.filter(item => {
    // 对每个键的值进行序列化后拼接
    const uniqueKey = keys
      .map(k => stringify(item[k]))
      .join('|'); // 用特殊符号分隔，避免不同键值拼接后冲突
    
    if (!map.has(uniqueKey)) {
      map.set(uniqueKey, true);
      return true;
    }
    return false;
  });
}
```

### 4.2 使用示例

```javascript
const data = [
  { id: 1, tags: ['js', 'html'], name: '张三' },
  { id: 2, tags: ['css', 'react'], name: '李四' },
  { id: 1, tags: ['js', 'html'], name: '张三' }, // 与第一条完全相同
  { id: 3, tags: ['js', 'vue'], name: '王五' },
  { id: 2, tags: ['css', 'react'], name: '李四' }, // 与第二条完全相同
  { id: 1, tags: ['html', 'js'], name: '张三' }  // id相同但tags顺序不同
];

// 按 id 和 tags 组合去重
const result = uniqueByKeysWithArray(data, ['id', 'tags']);
console.log('按id和tags组合去重：', result);
```

### 4.3 输出结果

```javascript
[
  { id: 1, tags: ['js', 'html'], name: '张三' },
  { id: 2, tags: ['css', 'react'], name: '李四' },
  { id: 3, tags: ['js', 'vue'], name: '王五' },
  { id: 1, tags: ['html', 'js'], name: '张三' }  // id相同但tags不同，保留
]
```

## 5. 完整测试代码

```javascript
// 辅助函数：将数组或对象转换为可比较的字符串
function stringify(value) {
  return typeof value === 'object' && value !== null 
    ? JSON.stringify(value) 
    : String(value);
}

// 方法1：根据单个键去重
function uniqueByKeyWithArray(arr, key) {
  const map = new Map();
  return arr.filter(item => {
    const uniqueKey = stringify(item[key]);
    if (!map.has(uniqueKey)) {
      map.set(uniqueKey, true);
      return true;
    }
    return false;
  });
}

// 方法2：根据多个键组合去重
function uniqueByKeysWithArray(arr, keys) {
  const map = new Map();
  return arr.filter(item => {
    const uniqueKey = keys
      .map(k => stringify(item[k]))
      .join('|');
    
    if (!map.has(uniqueKey)) {
      map.set(uniqueKey, true);
      return true;
    }
    return false;
  });
}

// 测试数据
const data = [
  { id: 1, tags: ['js', 'html'], name: '张三' },
  { id: 2, tags: ['css', 'react'], name: '李四' },
  { id: 1, tags: ['js', 'html'], name: '张三' },
  { id: 3, tags: ['js', 'vue'], name: '王五' },
  { id: 2, tags: ['css', 'react'], name: '李四' },
  { id: 1, tags: ['html', 'js'], name: '张三' }
];

// 测试
console.log('按tags数组去重：', uniqueByKeyWithArray(data, 'tags'));
console.log('按id和tags组合去重：', uniqueByKeysWithArray(data, ['id', 'tags']));
```

## 6. 其他常用去重方法

### 6.1 按简单属性去重

```javascript
// 适用于基本类型属性（如 id、name）
function uniqueByKey(arr, key) {
  const map = new Map();
  return arr.filter(item => {
    if (!map.has(item[key])) {
      map.set(item[key], true);
      return true;
    }
    return false;
  });
}

// 使用示例
const users = [
  { id: 1, name: '张三' },
  { id: 2, name: '李四' },
  { id: 1, name: '张三' }, // 重复
];

console.log(uniqueByKey(users, 'id'));
// 输出: [{ id: 1, name: '张三' }, { id: 2, name: '李四' }]
```

### 6.2 完全去重（对象深度比较）

```javascript
// 完全相同的对象才算重复
function uniqueByDeepCompare(arr) {
  const map = new Map();
  return arr.filter(item => {
    const key = JSON.stringify(item);
    if (!map.has(key)) {
      map.set(key, true);
      return true;
    }
    return false;
  });
}

// 使用示例
const data = [
  { id: 1, name: '张三', tags: ['js'] },
  { id: 2, name: '李四', tags: ['css'] },
  { id: 1, name: '张三', tags: ['js'] }, // 完全重复
];

console.log(uniqueByDeepCompare(data));
```

### 6.3 使用 lodash 的 uniqBy

```javascript
import _ from 'lodash';

// 按单个属性去重
const result1 = _.uniqBy(data, 'id');

// 按自定义函数去重
const result2 = _.uniqBy(data, item => 
  JSON.stringify(item.tags)
);
```

## 7. 注意事项

### 7.1 数组顺序敏感

```javascript
const arr = [
  { tags: ['a', 'b'] },
  { tags: ['b', 'a'] }  // 顺序不同，视为不同
];

// JSON.stringify 会保留数组顺序
// ['a','b'] !== ['b','a']
```

### 7.2 对象属性顺序不敏感

```javascript
const arr = [
  { a: 1, b: 2 },
  { b: 2, a: 1 }  // 属性顺序不同，但视为相同
];

// JSON.stringify 会按字母顺序排序对象键
// 两者序列化结果相同
```

### 7.3 性能考虑

- **小数据量：** 使用 `JSON.stringify` 简单直观
- **大数据量：** 考虑使用哈希函数或自定义比较逻辑
- **频繁操作：** 考虑缓存序列化结果

## 8. 应用场景

### 8.1 表格数据去重

```javascript
// 去除重复的用户记录
const users = uniqueByKey(rawData, 'userId');
```

### 8.2 标签去重

```javascript
// 去除相同标签组合的文章
const articles = uniqueByKeyWithArray(data, 'tags');
```

### 8.3 购物车去重

```javascript
// 去除相同商品（按商品ID和规格）
const cartItems = uniqueByKeysWithArray(cart, ['productId', 'specs']);
```

---

> 💡 **核心要点：** 使用 Map + JSON.stringify 可以轻松实现复杂对象数组的去重，关键在于构建合适的唯一标识。
