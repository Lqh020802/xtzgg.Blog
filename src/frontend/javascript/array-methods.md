---
title: 常见的数组方法
icon: logos:javascript
---

# 常见的数组方法

JavaScript 数组的方法按**是否修改原数组**可分为：
- **可变方法**（修改原数组）
- **不可变方法**（返回新数组/值，不修改原数组）

## 1. 会改变原数组的方法

### 1.1 方法速览表

| 方法 | 功能描述 | 返回值 |
|------|---------|--------|
| `push()` | 向数组末尾添加一个/多个元素 | 新长度 |
| `pop()` | 删除数组最后一个元素 | 被删除的元素 |
| `unshift()` | 向数组开头添加一个/多个元素 | 新长度 |
| `shift()` | 删除数组第一个元素 | 被删除的元素 |
| `splice()` | 从指定位置删除/插入元素 | 被删除元素组成的数组 |
| `sort()` | 对数组元素排序 | 排序后的原数组 |
| `reverse()` | 反转数组元素顺序 | 反转后的原数组 |
| `fill()` | 用指定值填充数组 | 修改后的原数组 |

### 1.2 详细用法

#### push() - 末尾添加

```javascript
const arr = [1, 2, 3];
const newLength = arr.push(4, 5);

console.log(arr);        // [1, 2, 3, 4, 5]
console.log(newLength);  // 5

// 应用场景：动态添加数据
const list = [];
list.push({ id: 1, name: '张三' });
list.push({ id: 2, name: '李四' });
```

#### pop() - 末尾删除

```javascript
const arr = [1, 2, 3, 4];
const removed = arr.pop();

console.log(arr);     // [1, 2, 3]
console.log(removed); // 4

// 应用场景：栈操作（LIFO）
const stack = [1, 2, 3];
stack.push(4);     // 入栈
const top = stack.pop();  // 出栈
```

#### unshift() - 开头添加

```javascript
const arr = [3, 4, 5];
const newLength = arr.unshift(1, 2);

console.log(arr);        // [1, 2, 3, 4, 5]
console.log(newLength);  // 5

// 注意：性能较差（需要移动所有元素）
```

#### shift() - 开头删除

```javascript
const arr = [1, 2, 3, 4];
const removed = arr.shift();

console.log(arr);     // [2, 3, 4]
console.log(removed); // 1

// 应用场景：队列操作（FIFO）
const queue = [1, 2, 3];
queue.push(4);        // 入队
const first = queue.shift();  // 出队
```

#### splice() - 万能方法

```javascript
// 语法：arr.splice(start, deleteCount, ...items)

const arr = [1, 2, 3, 4, 5];

// 1. 删除元素
arr.splice(2, 1);  // 从索引2开始，删除1个元素
console.log(arr);  // [1, 2, 4, 5]

// 2. 插入元素
arr.splice(2, 0, 3);  // 从索引2开始，删除0个，插入3
console.log(arr);     // [1, 2, 3, 4, 5]

// 3. 替换元素
arr.splice(2, 1, 'three');  // 从索引2开始，删除1个，插入'three'
console.log(arr);           // [1, 2, 'three', 4, 5]

// 4. 删除多个元素
arr.splice(1, 3);  // 从索引1开始，删除3个元素
console.log(arr);  // [1, 5]

// 应用场景：数组的增删改
const list = ['a', 'b', 'c', 'd'];
list.splice(1, 2, 'x', 'y');  // 删除 'b', 'c'，插入 'x', 'y'
console.log(list);  // ['a', 'x', 'y', 'd']
```

#### sort() - 排序

```javascript
const arr = [3, 1, 4, 1, 5, 9, 2, 6];

// 1. 默认排序（按字符串 Unicode 码）
arr.sort();
console.log(arr);  // [1, 1, 2, 3, 4, 5, 6, 9]

// 注意：默认排序问题
const nums = [10, 5, 40, 25, 1000];
nums.sort();
console.log(nums);  // [10, 1000, 25, 40, 5] ❌ 错误！

// 2. 自定义排序（升序）
nums.sort((a, b) => a - b);
console.log(nums);  // [5, 10, 25, 40, 1000] ✅

// 3. 降序
nums.sort((a, b) => b - a);
console.log(nums);  // [1000, 40, 25, 10, 5]

// 4. 对象数组排序
const users = [
  { name: '张三', age: 25 },
  { name: '李四', age: 20 },
  { name: '王五', age: 30 }
];

users.sort((a, b) => a.age - b.age);
console.log(users);
// [{ name: '李四', age: 20 }, { name: '张三', age: 25 }, { name: '王五', age: 30 }]

// 5. 中文排序
const names = ['张三', '李四', '王五'];
names.sort((a, b) => a.localeCompare(b));
```

#### reverse() - 反转

```javascript
const arr = [1, 2, 3, 4, 5];
arr.reverse();

console.log(arr);  // [5, 4, 3, 2, 1]

// 应用场景：倒序显示列表
const messages = ['msg1', 'msg2', 'msg3'];
messages.reverse();  // 最新消息在前
```

#### fill() - 填充

```javascript
// 语法：arr.fill(value, start?, end?)

const arr1 = [1, 2, 3, 4, 5];
arr1.fill(0);
console.log(arr1);  // [0, 0, 0, 0, 0]

const arr2 = [1, 2, 3, 4, 5];
arr2.fill(0, 2, 4);  // 从索引2到索引4（不包含4）
console.log(arr2);   // [1, 2, 0, 0, 5]

// 应用场景：初始化数组
const arr3 = new Array(5).fill(0);
console.log(arr3);  // [0, 0, 0, 0, 0]

// 创建二维数组（注意陷阱）
// ❌ 错误方式
const matrix1 = new Array(3).fill([]);
matrix1[0].push(1);
console.log(matrix1);  // [[1], [1], [1]] ❌ 所有子数组都是同一个引用

// ✅ 正确方式
const matrix2 = Array.from({ length: 3 }, () => []);
matrix2[0].push(1);
console.log(matrix2);  // [[1], [], []] ✅
```

## 2. 不会改变原数组的方法

### 2.1 方法速览表

| 方法 | 功能描述 | 返回值 |
|------|---------|--------|
| `concat()` | 合并数组/值 | 新数组 |
| `slice()` | 截取数组片段 | 新数组 |
| `map()` | 映射转换 | 新数组 |
| `filter()` | 筛选过滤 | 新数组 |
| `reduce()` | 累积计算 | 单个值 |
| `find()` | 查找元素 | 元素或 undefined |
| `findIndex()` | 查找索引 | 索引或 -1 |
| `every()` | 检查所有元素 | boolean |
| `some()` | 检查部分元素 | boolean |
| `includes()` | 检查包含 | boolean |
| `indexOf()` | 查找索引（首次） | 索引或 -1 |
| `join()` | 连接为字符串 | 字符串 |
| `flat()` | 扁平化数组 | 新数组 |
| `flatMap()` | 映射+扁平化 | 新数组 |

### 2.2 详细用法

#### concat() - 合并数组

```javascript
const arr1 = [1, 2];
const arr2 = [3, 4];
const arr3 = [5, 6];

const result = arr1.concat(arr2, arr3);
console.log(result);  // [1, 2, 3, 4, 5, 6]
console.log(arr1);    // [1, 2] 原数组不变

// 合并值
const arr4 = [1, 2].concat(3, [4, 5], 6);
console.log(arr4);  // [1, 2, 3, 4, 5, 6]

// ES6 替代方案（扩展运算符）
const arr5 = [...arr1, ...arr2, ...arr3];
console.log(arr5);  // [1, 2, 3, 4, 5, 6]
```

#### slice() - 截取数组

```javascript
// 语法：arr.slice(start?, end?)

const arr = [1, 2, 3, 4, 5];

const slice1 = arr.slice(1, 3);  // 从索引1到索引3（不包含3）
console.log(slice1);  // [2, 3]

const slice2 = arr.slice(2);     // 从索引2到末尾
console.log(slice2);  // [3, 4, 5]

const slice3 = arr.slice(-2);    // 倒数2个元素
console.log(slice3);  // [4, 5]

const slice4 = arr.slice();      // 复制整个数组（浅拷贝）
console.log(slice4);  // [1, 2, 3, 4, 5]

console.log(arr);  // [1, 2, 3, 4, 5] 原数组不变

// 应用场景：数组浅拷贝
const original = [1, 2, 3];
const copy = original.slice();
copy.push(4);
console.log(original);  // [1, 2, 3]
console.log(copy);      // [1, 2, 3, 4]
```

#### map() - 映射转换

```javascript
const arr = [1, 2, 3, 4, 5];

// 每个元素乘以2
const doubled = arr.map(x => x * 2);
console.log(doubled);  // [2, 4, 6, 8, 10]

// 对象数组转换
const users = [
  { id: 1, name: '张三' },
  { id: 2, name: '李四' }
];

const names = users.map(user => user.name);
console.log(names);  // ['张三', '李四']

// 带索引
const indexed = arr.map((value, index) => ({ index, value }));
console.log(indexed);
// [{ index: 0, value: 1 }, { index: 1, value: 2 }, ...]

console.log(arr);  // [1, 2, 3, 4, 5] 原数组不变
```

#### filter() - 筛选过滤

```javascript
const arr = [1, 2, 3, 4, 5, 6];

// 筛选偶数
const evens = arr.filter(x => x % 2 === 0);
console.log(evens);  // [2, 4, 6]

// 筛选大于3的数
const greater = arr.filter(x => x > 3);
console.log(greater);  // [4, 5, 6]

// 对象数组筛选
const users = [
  { name: '张三', age: 25 },
  { name: '李四', age: 17 },
  { name: '王五', age: 30 }
];

const adults = users.filter(user => user.age >= 18);
console.log(adults);
// [{ name: '张三', age: 25 }, { name: '王五', age: 30 }]

// 去除空值
const arr2 = [0, 1, false, 2, '', 3, null, undefined, 4, NaN];
const truthy = arr2.filter(Boolean);
console.log(truthy);  // [1, 2, 3, 4]
```

#### reduce() - 累积计算

```javascript
// 语法：arr.reduce(callback, initialValue)
// callback: (accumulator, currentValue, index, array) => newAccumulator

const arr = [1, 2, 3, 4, 5];

// 1. 求和
const sum = arr.reduce((acc, cur) => acc + cur, 0);
console.log(sum);  // 15

// 2. 求积
const product = arr.reduce((acc, cur) => acc * cur, 1);
console.log(product);  // 120

// 3. 找最大值
const max = arr.reduce((acc, cur) => Math.max(acc, cur));
console.log(max);  // 5

// 4. 数组扁平化
const nested = [[1, 2], [3, 4], [5]];
const flat = nested.reduce((acc, cur) => acc.concat(cur), []);
console.log(flat);  // [1, 2, 3, 4, 5]

// 5. 对象数组统计
const orders = [
  { product: 'A', price: 100 },
  { product: 'B', price: 200 },
  { product: 'A', price: 150 }
];

const totalByProduct = orders.reduce((acc, order) => {
  acc[order.product] = (acc[order.product] || 0) + order.price;
  return acc;
}, {});
console.log(totalByProduct);  // { A: 250, B: 200 }

// 6. 数组去重
const arr2 = [1, 2, 2, 3, 3, 4];
const unique = arr2.reduce((acc, cur) => {
  if (!acc.includes(cur)) {
    acc.push(cur);
  }
  return acc;
}, []);
console.log(unique);  // [1, 2, 3, 4]
```

#### find() / findIndex() - 查找

```javascript
const arr = [1, 2, 3, 4, 5];

// find：返回第一个满足条件的元素
const found = arr.find(x => x > 3);
console.log(found);  // 4

const notFound = arr.find(x => x > 10);
console.log(notFound);  // undefined

// findIndex：返回第一个满足条件的索引
const index = arr.findIndex(x => x > 3);
console.log(index);  // 3

const notFoundIndex = arr.findIndex(x => x > 10);
console.log(notFoundIndex);  // -1

// 对象数组查找
const users = [
  { id: 1, name: '张三' },
  { id: 2, name: '李四' },
  { id: 3, name: '王五' }
];

const user = users.find(u => u.id === 2);
console.log(user);  // { id: 2, name: '李四' }
```

#### every() / some() - 检查

```javascript
const arr = [2, 4, 6, 8];

// every：检查所有元素是否满足条件
const allEven = arr.every(x => x % 2 === 0);
console.log(allEven);  // true

const allPositive = arr.every(x => x > 0);
console.log(allPositive);  // true

// some：检查是否至少有一个元素满足条件
const arr2 = [1, 3, 5, 6];
const hasEven = arr2.some(x => x % 2 === 0);
console.log(hasEven);  // true

const hasNegative = arr2.some(x => x < 0);
console.log(hasNegative);  // false

// 应用场景：表单验证
const fields = [
  { name: 'username', value: 'admin' },
  { name: 'password', value: '' },
  { name: 'email', value: 'admin@example.com' }
];

const allFilled = fields.every(field => field.value !== '');
console.log(allFilled);  // false（password 为空）

const anyFilled = fields.some(field => field.value !== '');
console.log(anyFilled);  // true
```

#### includes() / indexOf() - 查找值

```javascript
const arr = [1, 2, 3, 4, 5];

// includes：检查是否包含某个值（ES7）
console.log(arr.includes(3));   // true
console.log(arr.includes(6));   // false
console.log(arr.includes(3, 3)); // false（从索引3开始查找）

// indexOf：查找值的首次出现索引
console.log(arr.indexOf(3));    // 2
console.log(arr.indexOf(6));    // -1
console.log(arr.indexOf(3, 3)); // -1（从索引3开始查找）

// lastIndexOf：查找值的最后出现索引
const arr2 = [1, 2, 3, 2, 1];
console.log(arr2.lastIndexOf(2));  // 3
console.log(arr2.lastIndexOf(5));  // -1

// includes vs indexOf 的区别
const arr3 = [1, 2, NaN, 4];
console.log(arr3.includes(NaN));  // true ✅
console.log(arr3.indexOf(NaN));   // -1 ❌（indexOf 无法找到 NaN）
```

#### join() / toString() - 转字符串

```javascript
const arr = [1, 2, 3, 4, 5];

// join：用指定分隔符连接
console.log(arr.join());      // '1,2,3,4,5'（默认逗号）
console.log(arr.join(''));    // '12345'
console.log(arr.join('-'));   // '1-2-3-4-5'
console.log(arr.join(' | ')); // '1 | 2 | 3 | 4 | 5'

// toString：转为字符串（默认逗号分隔）
console.log(arr.toString());  // '1,2,3,4,5'

// 应用场景：构建 URL 参数
const params = ['name=张三', 'age=25', 'city=北京'];
const queryString = params.join('&');
console.log(queryString);  // 'name=张三&age=25&city=北京'
```

#### flat() / flatMap() - 扁平化

```javascript
// flat：扁平化数组（ES2019）
const arr1 = [1, [2, 3], [4, [5, 6]]];

console.log(arr1.flat());      // [1, 2, 3, 4, [5, 6]]（默认深度1）
console.log(arr1.flat(2));     // [1, 2, 3, 4, 5, 6]（深度2）
console.log(arr1.flat(Infinity)); // [1, 2, 3, 4, 5, 6]（完全扁平化）

// 去除空项
const arr2 = [1, 2, , 4, 5];
console.log(arr2.flat());  // [1, 2, 4, 5]

// flatMap：先 map 再 flat（深度1）
const arr3 = [1, 2, 3];
const result = arr3.flatMap(x => [x, x * 2]);
console.log(result);  // [1, 2, 2, 4, 3, 6]

// 等价于
const result2 = arr3.map(x => [x, x * 2]).flat();
console.log(result2);  // [1, 2, 2, 4, 3, 6]

// 应用场景：处理嵌套数据
const sentences = ['Hello World', 'How are you'];
const words = sentences.flatMap(s => s.split(' '));
console.log(words);  // ['Hello', 'World', 'How', 'are', 'you']
```

## 3. 记忆要点

### 3.1 快速记忆法

#### 可变方法（修改原数组）

**口诀：增删改排**

```
增：push、unshift
删：pop、shift、splice
改：splice、fill
排：sort、reverse
```

**记忆技巧：**
- 带 `push/pop/shift/unshift` → 增删操作 → 会改变
- 带 `sort/reverse/fill` → 排序/反转/填充 → 会改变
- `splice` → 万能方法 → 会改变

#### 不可变方法（返回新结果）

**口诀：查询、转换、计算**

```
查询：find、findIndex、indexOf、includes、every、some
转换：map、filter、slice、concat、flat、flatMap
计算：reduce、reduceRight
其他：join、toString
```

**记忆技巧：**
- 带 `map/filter` → 遍历转换 → 不改变
- 带 `find/includes/indexOf` → 查找 → 不改变
- 带 `concat/slice` → 合并/截取 → 不改变
- `reduce` → 计算 → 不改变

### 3.2 注意事项

#### 1. sort() 默认排序的坑

```javascript
// ❌ 错误：数字排序
const arr = [10, 5, 40, 25];
arr.sort();
console.log(arr);  // [10, 25, 40, 5] ❌

// ✅ 正确：使用比较函数
arr.sort((a, b) => a - b);
console.log(arr);  // [5, 10, 25, 40] ✅
```

#### 2. fill() 引用类型的坑

```javascript
// ❌ 错误：填充对象/数组
const arr = new Array(3).fill([]);
arr[0].push(1);
console.log(arr);  // [[1], [1], [1]] ❌ 都是同一个引用

// ✅ 正确：使用 Array.from
const arr2 = Array.from({ length: 3 }, () => []);
arr2[0].push(1);
console.log(arr2);  // [[1], [], []] ✅
```

#### 3. splice() vs slice()

```javascript
const arr = [1, 2, 3, 4, 5];

// splice：会改变原数组
arr.splice(1, 2);
console.log(arr);  // [1, 4, 5] ✅ 原数组被修改

const arr2 = [1, 2, 3, 4, 5];

// slice：不会改变原数组
const result = arr2.slice(1, 3);
console.log(arr2);   // [1, 2, 3, 4, 5] ✅ 原数组不变
console.log(result); // [2, 3]
```

#### 4. indexOf() vs includes()

```javascript
const arr = [1, 2, NaN, 4];

// indexOf：无法找到 NaN
console.log(arr.indexOf(NaN));  // -1 ❌

// includes：可以找到 NaN
console.log(arr.includes(NaN)); // true ✅
```

## 4. 实战应用

### 4.1 数组去重

```javascript
// 方法1：使用 Set
const arr = [1, 2, 2, 3, 3, 4];
const unique1 = [...new Set(arr)];
console.log(unique1);  // [1, 2, 3, 4]

// 方法2：使用 filter
const unique2 = arr.filter((item, index) => arr.indexOf(item) === index);
console.log(unique2);  // [1, 2, 3, 4]

// 方法3：使用 reduce
const unique3 = arr.reduce((acc, cur) => {
  if (!acc.includes(cur)) acc.push(cur);
  return acc;
}, []);
console.log(unique3);  // [1, 2, 3, 4]
```

### 4.2 数组求和

```javascript
const arr = [1, 2, 3, 4, 5];

// 方法1：reduce
const sum1 = arr.reduce((acc, cur) => acc + cur, 0);

// 方法2：for...of
let sum2 = 0;
for (const num of arr) {
  sum2 += num;
}

console.log(sum1, sum2);  // 15 15
```

### 4.3 数组扁平化

```javascript
const arr = [1, [2, [3, [4, 5]]]];

// 方法1：flat
const flat1 = arr.flat(Infinity);

// 方法2：递归
function flatten(arr) {
  return arr.reduce((acc, cur) => {
    return acc.concat(Array.isArray(cur) ? flatten(cur) : cur);
  }, []);
}
const flat2 = flatten(arr);

console.log(flat1, flat2);  // [1, 2, 3, 4, 5]
```

### 4.4 分组统计

```javascript
const students = [
  { name: '张三', grade: 'A' },
  { name: '李四', grade: 'B' },
  { name: '王五', grade: 'A' },
  { name: '赵六', grade: 'C' }
];

const grouped = students.reduce((acc, student) => {
  const { grade } = student;
  if (!acc[grade]) acc[grade] = [];
  acc[grade].push(student);
  return acc;
}, {});

console.log(grouped);
// {
//   A: [{ name: '张三', grade: 'A' }, { name: '王五', grade: 'A' }],
//   B: [{ name: '李四', grade: 'B' }],
//   C: [{ name: '赵六', grade: 'C' }]
// }
```

## 5. 总结

### 5.1 核心要点

- **可变方法：** 增删改排（push/pop/shift/unshift/splice/sort/reverse/fill）
- **不可变方法：** 查询转换计算（map/filter/reduce/find/slice/concat）
- **性能考虑：** unshift/shift 性能较差（需移动所有元素），push/pop 性能最优
- **链式调用：** 不可变方法支持链式调用

### 5.2 方法选择建议

| 需求 | 推荐方法 |
|------|---------|
| 添加/删除元素 | push/pop（末尾）、splice（任意位置） |
| 查找元素 | find/findIndex/includes |
| 数组转换 | map/filter |
| 数组合并 | concat、扩展运算符 |
| 数组计算 | reduce |
| 数组复制 | slice()、扩展运算符 |
| 数组去重 | Set + 扩展运算符 |

---

> 💡 **核心要点：** 理解数组方法是否改变原数组是关键，可变方法多为增删改排操作，不可变方法多为查询转换计算操作。实际开发中优先使用不可变方法，避免副作用。
