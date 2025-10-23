---
title: 前端算法精讲
date: 2025-10-22
icon: mdi:chart-timeline-variant
category:
  - JavaScript
tag:
  - 算法
  - 数据结构
  - LeetCode
---

# 前端算法精讲

## 一、数组算法

### 1.1 两数之和

```javascript
/**
 * 给定一个整数数组和目标值，找出数组中和为目标值的两个数
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  const map = new Map();
  
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    
    map.set(nums[i], i);
  }
  
  return [];
}

console.log(twoSum([2, 7, 11, 15], 9)); // [0, 1]
```

### 1.2 三数之和

```javascript
/**
 * 找出所有和为0的三元组
 * @param {number[]} nums
 * @return {number[][]}
 */
function threeSum(nums) {
  const result = [];
  nums.sort((a, b) => a - b);
  
  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue;
    
    let left = i + 1;
    let right = nums.length - 1;
    
    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right];
      
      if (sum === 0) {
        result.push([nums[i], nums[left], nums[right]]);
        
        while (left < right && nums[left] === nums[left + 1]) left++;
        while (left < right && nums[right] === nums[right - 1]) right--;
        
        left++;
        right--;
      } else if (sum < 0) {
        left++;
      } else {
        right--;
      }
    }
  }
  
  return result;
}
```

### 1.3 最大子数组和

```javascript
/**
 * Kadane算法
 * @param {number[]} nums
 * @return {number}
 */
function maxSubArray(nums) {
  let maxSum = nums[0];
  let currentSum = nums[0];
  
  for (let i = 1; i < nums.length; i++) {
    currentSum = Math.max(nums[i], currentSum + nums[i]);
    maxSum = Math.max(maxSum, currentSum);
  }
  
  return maxSum;
}

console.log(maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4])); // 6
```

### 1.4 数组扁平化

```javascript
// 方法1：递归
function flatten(arr) {
  const result = [];
  
  for (let item of arr) {
    if (Array.isArray(item)) {
      result.push(...flatten(item));
    } else {
      result.push(item);
    }
  }
  
  return result;
}

// 方法2：reduce
function flatten2(arr) {
  return arr.reduce((acc, item) => {
    return acc.concat(Array.isArray(item) ? flatten2(item) : item);
  }, []);
}

// 方法3：flat
function flatten3(arr, depth = Infinity) {
  return arr.flat(depth);
}

console.log(flatten([1, [2, [3, [4, 5]]]])); // [1, 2, 3, 4, 5]
```

## 二、字符串算法

### 2.1 最长回文子串

```javascript
/**
 * 中心扩散法
 * @param {string} s
 * @return {string}
 */
function longestPalindrome(s) {
  if (s.length < 2) return s;
  
  let start = 0;
  let maxLen = 1;
  
  function expandAroundCenter(left, right) {
    while (left >= 0 && right < s.length && s[left] === s[right]) {
      if (right - left + 1 > maxLen) {
        maxLen = right - left + 1;
        start = left;
      }
      left--;
      right++;
    }
  }
  
  for (let i = 0; i < s.length; i++) {
    expandAroundCenter(i, i);     // 奇数长度
    expandAroundCenter(i, i + 1); // 偶数长度
  }
  
  return s.substr(start, maxLen);
}

console.log(longestPalindrome("babad")); // "bab" or "aba"
```

### 2.2 字符串匹配（KMP）

```javascript
/**
 * KMP算法
 * @param {string} haystack
 * @param {string} needle
 * @return {number}
 */
function strStr(haystack, needle) {
  if (needle === '') return 0;
  
  // 构建next数组
  function getNext(pattern) {
    const next = [0];
    let j = 0;
    
    for (let i = 1; i < pattern.length; i++) {
      while (j > 0 && pattern[i] !== pattern[j]) {
        j = next[j - 1];
      }
      
      if (pattern[i] === pattern[j]) {
        j++;
      }
      
      next[i] = j;
    }
    
    return next;
  }
  
  const next = getNext(needle);
  let j = 0;
  
  for (let i = 0; i < haystack.length; i++) {
    while (j > 0 && haystack[i] !== needle[j]) {
      j = next[j - 1];
    }
    
    if (haystack[i] === needle[j]) {
      j++;
    }
    
    if (j === needle.length) {
      return i - j + 1;
    }
  }
  
  return -1;
}
```

### 2.3 无重复字符的最长子串

```javascript
/**
 * 滑动窗口
 * @param {string} s
 * @return {number}
 */
function lengthOfLongestSubstring(s) {
  const map = new Map();
  let maxLen = 0;
  let left = 0;
  
  for (let right = 0; right < s.length; right++) {
    if (map.has(s[right])) {
      left = Math.max(map.get(s[right]) + 1, left);
    }
    
    map.set(s[right], right);
    maxLen = Math.max(maxLen, right - left + 1);
  }
  
  return maxLen;
}

console.log(lengthOfLongestSubstring("abcabcbb")); // 3
```

## 三、链表算法

### 3.1 反转链表

```javascript
class ListNode {
  constructor(val, next = null) {
    this.val = val;
    this.next = next;
  }
}

// 迭代法
function reverseList(head) {
  let prev = null;
  let curr = head;
  
  while (curr) {
    const next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }
  
  return prev;
}

// 递归法
function reverseList2(head) {
  if (!head || !head.next) return head;
  
  const newHead = reverseList2(head.next);
  head.next.next = head;
  head.next = null;
  
  return newHead;
}
```

### 3.2 合并两个有序链表

```javascript
function mergeTwoLists(l1, l2) {
  const dummy = new ListNode(0);
  let curr = dummy;
  
  while (l1 && l2) {
    if (l1.val < l2.val) {
      curr.next = l1;
      l1 = l1.next;
    } else {
      curr.next = l2;
      l2 = l2.next;
    }
    curr = curr.next;
  }
  
  curr.next = l1 || l2;
  
  return dummy.next;
}
```

### 3.3 环形链表

```javascript
/**
 * 快慢指针
 * @param {ListNode} head
 * @return {boolean}
 */
function hasCycle(head) {
  let slow = head;
  let fast = head;
  
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    
    if (slow === fast) {
      return true;
    }
  }
  
  return false;
}
```

## 四、二叉树算法

### 4.1 二叉树遍历

```javascript
class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

// 前序遍历（递归）
function preorderTraversal(root) {
  const result = [];
  
  function traverse(node) {
    if (!node) return;
    result.push(node.val);
    traverse(node.left);
    traverse(node.right);
  }
  
  traverse(root);
  return result;
}

// 中序遍历（迭代）
function inorderTraversal(root) {
  const result = [];
  const stack = [];
  let curr = root;
  
  while (curr || stack.length) {
    while (curr) {
      stack.push(curr);
      curr = curr.left;
    }
    
    curr = stack.pop();
    result.push(curr.val);
    curr = curr.right;
  }
  
  return result;
}

// 层序遍历
function levelOrder(root) {
  if (!root) return [];
  
  const result = [];
  const queue = [root];
  
  while (queue.length) {
    const level = [];
    const size = queue.length;
    
    for (let i = 0; i < size; i++) {
      const node = queue.shift();
      level.push(node.val);
      
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    
    result.push(level);
  }
  
  return result;
}
```

### 4.2 二叉树最大深度

```javascript
function maxDepth(root) {
  if (!root) return 0;
  
  return Math.max(maxDepth(root.left), maxDepth(root.right)) + 1;
}
```

### 4.3 翻转二叉树

```javascript
function invertTree(root) {
  if (!root) return null;
  
  const temp = root.left;
  root.left = root.right;
  root.right = temp;
  
  invertTree(root.left);
  invertTree(root.right);
  
  return root;
}
```

## 五、动态规划

### 5.1 爬楼梯

```javascript
/**
 * 每次可以爬1或2个台阶
 * @param {number} n
 * @return {number}
 */
function climbStairs(n) {
  if (n <= 2) return n;
  
  let prev = 1;
  let curr = 2;
  
  for (let i = 3; i <= n; i++) {
    const temp = prev + curr;
    prev = curr;
    curr = temp;
  }
  
  return curr;
}
```

### 5.2 最长递增子序列

```javascript
/**
 * @param {number[]} nums
 * @return {number}
 */
function lengthOfLIS(nums) {
  if (!nums.length) return 0;
  
  const dp = new Array(nums.length).fill(1);
  let maxLen = 1;
  
  for (let i = 1; i < nums.length; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[i] > nums[j]) {
        dp[i] = Math.max(dp[i], dp[j] + 1);
      }
    }
    maxLen = Math.max(maxLen, dp[i]);
  }
  
  return maxLen;
}
```

### 5.3 背包问题

```javascript
/**
 * 0-1背包
 * @param {number} capacity 背包容量
 * @param {number[]} weights 物品重量
 * @param {number[]} values 物品价值
 * @return {number}
 */
function knapsack(capacity, weights, values) {
  const n = weights.length;
  const dp = Array(n + 1).fill(0).map(() => Array(capacity + 1).fill(0));
  
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= capacity; j++) {
      if (weights[i - 1] > j) {
        dp[i][j] = dp[i - 1][j];
      } else {
        dp[i][j] = Math.max(
          dp[i - 1][j],
          dp[i - 1][j - weights[i - 1]] + values[i - 1]
        );
      }
    }
  }
  
  return dp[n][capacity];
}
```

## 六、排序算法

### 6.1 快速排序

```javascript
function quickSort(arr) {
  if (arr.length <= 1) return arr;
  
  const pivot = arr[Math.floor(arr.length / 2)];
  const left = arr.filter(x => x < pivot);
  const middle = arr.filter(x => x === pivot);
  const right = arr.filter(x => x > pivot);
  
  return [...quickSort(left), ...middle, ...quickSort(right)];
}

// 原地快排
function quickSortInPlace(arr, left = 0, right = arr.length - 1) {
  if (left >= right) return arr;
  
  const pivot = partition(arr, left, right);
  quickSortInPlace(arr, left, pivot - 1);
  quickSortInPlace(arr, pivot + 1, right);
  
  return arr;
}

function partition(arr, left, right) {
  const pivot = arr[right];
  let i = left;
  
  for (let j = left; j < right; j++) {
    if (arr[j] < pivot) {
      [arr[i], arr[j]] = [arr[j], arr[i]];
      i++;
    }
  }
  
  [arr[i], arr[right]] = [arr[right], arr[i]];
  return i;
}
```

### 6.2 归并排序

```javascript
function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  
  return merge(left, right);
}

function merge(left, right) {
  const result = [];
  let i = 0, j = 0;
  
  while (i < left.length && j < right.length) {
    if (left[i] < right[j]) {
      result.push(left[i++]);
    } else {
      result.push(right[j++]);
    }
  }
  
  return result.concat(left.slice(i), right.slice(j));
}
```

### 6.3 堆排序

```javascript
function heapSort(arr) {
  // 构建最大堆
  for (let i = Math.floor(arr.length / 2) - 1; i >= 0; i--) {
    heapify(arr, arr.length, i);
  }
  
  // 排序
  for (let i = arr.length - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]];
    heapify(arr, i, 0);
  }
  
  return arr;
}

function heapify(arr, n, i) {
  let largest = i;
  const left = 2 * i + 1;
  const right = 2 * i + 2;
  
  if (left < n && arr[left] > arr[largest]) {
    largest = left;
  }
  
  if (right < n && arr[right] > arr[largest]) {
    largest = right;
  }
  
  if (largest !== i) {
    [arr[i], arr[largest]] = [arr[largest], arr[i]];
    heapify(arr, n, largest);
  }
}
```

## 七、搜索算法

### 7.1 二分查找

```javascript
function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (arr[mid] === target) {
      return mid;
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  return -1;
}

// 查找第一个等于目标值的位置
function binarySearchFirst(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  let result = -1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (arr[mid] >= target) {
      if (arr[mid] === target) result = mid;
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }
  
  return result;
}
```

### 7.2 DFS（深度优先搜索）

```javascript
// 岛屿数量
function numIslands(grid) {
  if (!grid || !grid.length) return 0;
  
  let count = 0;
  
  function dfs(i, j) {
    if (i < 0 || i >= grid.length || j < 0 || j >= grid[0].length || grid[i][j] === '0') {
      return;
    }
    
    grid[i][j] = '0';
    
    dfs(i + 1, j);
    dfs(i - 1, j);
    dfs(i, j + 1);
    dfs(i, j - 1);
  }
  
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[0].length; j++) {
      if (grid[i][j] === '1') {
        count++;
        dfs(i, j);
      }
    }
  }
  
  return count;
}
```

### 7.3 BFS（广度优先搜索）

```javascript
// 二叉树的右视图
function rightSideView(root) {
  if (!root) return [];
  
  const result = [];
  const queue = [root];
  
  while (queue.length) {
    const size = queue.length;
    
    for (let i = 0; i < size; i++) {
      const node = queue.shift();
      
      // 每层最后一个节点
      if (i === size - 1) {
        result.push(node.val);
      }
      
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
  }
  
  return result;
}
```

## 八、常见面试题

### 8.1 LRU缓存

```javascript
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }
  
  get(key) {
    if (!this.cache.has(key)) {
      return -1;
    }
    
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    
    return value;
  }
  
  put(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    
    this.cache.set(key, value);
    
    if (this.cache.size > this.capacity) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }
}
```

### 8.2 有效的括号

```javascript
function isValid(s) {
  const stack = [];
  const map = {
    ')': '(',
    ']': '[',
    '}': '{'
  };
  
  for (let char of s) {
    if (char in map) {
      if (stack.pop() !== map[char]) {
        return false;
      }
    } else {
      stack.push(char);
    }
  }
  
  return stack.length === 0;
}
```

### 8.3 防抖和节流

```javascript
// 防抖
function debounce(fn, delay) {
  let timer = null;
  
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

// 节流
function throttle(fn, delay) {
  let last = 0;
  
  return function(...args) {
    const now = Date.now();
    
    if (now - last >= delay) {
      fn.apply(this, args);
      last = now;
    }
  };
}
```

## 九、总结

### 时间复杂度对比

| 算法 | 最好 | 平均 | 最坏 | 空间复杂度 |
|------|------|------|------|------------|
| 冒泡排序 | O(n) | O(n²) | O(n²) | O(1) |
| 快速排序 | O(nlogn) | O(nlogn) | O(n²) | O(logn) |
| 归并排序 | O(nlogn) | O(nlogn) | O(nlogn) | O(n) |
| 堆排序 | O(nlogn) | O(nlogn) | O(nlogn) | O(1) |
| 二分查找 | O(1) | O(logn) | O(logn) | O(1) |

### 学习建议

1. 掌握基础数据结构
2. 理解常见算法思想
3. 多做LeetCode题目
4. 关注时间空间复杂度
5. 学会举一反三

---

**相关文章：**
- [数组方法实现](./array-methods.md)
- [设计模式](./design-patterns.md)
- [程序设计与分析](./program-design.md)
