---
title: 单点登录 (SSO)
icon: mdi:web
category:
  - 网络安全
tag:
  - SSO
  - 单点登录
  - 身份认证
  - 安全
---

# 单点登录 (SSO)

## 1. 什么是单点登录

**单点登录（SSO，Single Sign-On）** 是一种身份认证机制，允许用户**只需一次登录，即可访问多个相互信任的应用系统**，无需重复输入账号密码。

### 1.1 应用场景

**典型场景：**
- 企业内部系统（OA、CRM、邮箱、考勤系统等）
- 互联网平台（淘宝、天猫、支付宝共享登录）
- Google 服务（Gmail、YouTube、Google Drive 等）

**用户体验：**
```
用户在应用系统1登录
    ↓
访问应用系统2（自动登录，无需输入密码）
    ↓
访问应用系统3（自动登录，无需输入密码）
```

## 2. 单点登录核心流程

### 2.1 流程图说明

```
                           用户
                            │
            ┌───────────────┼───────────────┐
            │               │               │
      首次访问网站1     访问网站2（已登录）
            │               │               │
        应用系统1        应用系统2
            │               │
            │ 检测未登录    │ 检测未登录
            │               │
            └───────┬───────┘
                    │
              认证中心 (SSO)
                    │
         ┌──────────┼──────────┐
         │                     │
    用户输入账号密码      重定向回应用系统1
         │                     │
    认证中心验证凭据        携带全局会话凭证
         │                     │
    生成全局凭证(credentials)  │
         │                     │
    ┌────┴────┐               │
验证失败    验证成功            │
    │         │               │
拒绝登录  生成全局会话         │
              │               │
         生成授权令牌(Token)────┘
              │
    ┌─────────┴─────────┐
    │                   │
前端/应用系统1      前端/应用系统2
使用Token访问        使用Token访问
```

### 2.2 详细步骤

#### 步骤 1：用户首次访问应用系统1

```
1. 用户访问应用系统1（如：http://app1.example.com）
2. 应用系统1检测到用户未登录
3. 重定向到认证中心登录页（如：http://sso.example.com/login?redirect=app1）
```

#### 步骤 2：认证中心验证

```
1. 用户在认证中心输入账号密码
2. 认证中心验证凭据（查询数据库）
3. 验证成功后：
   - 在认证中心创建全局会话（Session）
   - 生成全局令牌（Token）
   - 将令牌写入认证中心的 Cookie
```

#### 步骤 3：重定向回应用系统1

```
1. 认证中心携带令牌重定向回应用系统1
2. 应用系统1用令牌向认证中心验证
3. 验证通过后，应用系统1创建本地会话
4. 用户成功登录应用系统1
```

#### 步骤 4：访问应用系统2（已登录）

```
1. 用户访问应用系统2（如：http://app2.example.com）
2. 应用系统2检测到用户未登录
3. 重定向到认证中心
4. 认证中心检测到用户已有全局会话（Cookie中有令牌）
5. 直接生成新令牌，重定向回应用系统2
6. 应用系统2验证令牌，创建本地会话
7. 用户无需输入密码，自动登录应用系统2
```

## 3. 单点登录模式对比

### 3.1 对比维度表格

| 对比维度 | Session 模式 | 单 Token 模式（如 JWT） | 双 Token 模式 |
|---------|-------------|----------------------|-------------|
| **核心定义** | 基于服务器端全局会话，通过 Session ID 标识用户，所有应用依赖 SSO 服务器验证会话 | 基于自包含 Token（如 JWT），Token 携带用户信息与签名，应用本地验证有效性，无需服务器存储状态 | 分短期 Access Token（业务访问）与长期 Refresh Token（刷新凭证），兼顾安全与体验 |
| **存储位置** | 全局会话存储于 SSO 服务器；应用本地会话存储于自身服务器 | Token 存储于前端（localStorage/HTTP-only Cookie） | Access Token 存前端，Refresh Token 存前端（HTTP-only Cookie）或服务器黑名单 |
| **状态性** | 有状态（服务器维护会话状态） | 无状态（Token 自包含所有验证信息） | 半无状态（仅 Refresh Token 需服务器验证状态） |
| **安全性** | ✅ 优点：Session ID 依赖 Cookie 安全机制，可主动吊销<br>❌ 缺点：未配置 HttpOnly 易遭 XSS，跨域 Cookie 传递风险高 | ✅ 优点：签名防篡改，支持加密传输<br>❌ 缺点：Token 未过期无法吊销，泄露后风险窗口大 | ✅ 优点：Access Token 短期有效，Refresh Token 可吊销<br>❌ 缺点：需额外防护 Refresh Token（防 CSRF/XSS） |
| **性能** | ✅ 优点：应用本地会话查询快<br>❌ 缺点：SSO 服务器会话存储压力大，高并发易瓶颈 | ✅ 优点：Token 本地验证，无服务器查询开销<br>❌ 缺点：Token 过大增加请求头体积 | ✅ 优点：Access Token 本地验证，刷新频率低<br>❌ 缺点：Refresh Token 验证需服务器查询（如黑名单） |
| **灵活性** | ✅ 优点：开发简单，无需处理 Token 逻辑<br>❌ 缺点：不支持跨域/移动端，扩展受限 | ✅ 优点：支持跨域/移动端，易水平扩展<br>❌ 缺点：无强制吊销能力，权限调整不实时 | ✅ 优点：支持细粒度权限（Access Token 定制），可长期登录<br>❌ 缺点：需处理刷新、续期、黑名单，逻辑复杂 |
| **用户体验** | ✅ 优点：跨应用登录状态同步快<br>❌ 缺点：会话过期需重新登录，无"无感续期" | ✅ 优点：跨端体验一致，无需服务器同步<br>❌ 缺点：Token 过期需重新登录，频繁操作影响体验 | ✅ 优点：Access Token 过期无感刷新，长期登录无需重复验证<br>❌ 缺点：Refresh Token 失效时需重新登录，异常场景需适配 |
| **适用场景** | 企业内部系统（OA/CRM）、低并发、同域名应用 | 轻量应用（内容平台）、移动端、高并发非敏感场景 | 金融/电商/支付等敏感场景、需长期登录、高安全需求场景 |

### 3.2 模式详解

#### 模式 1：Session 模式

**架构图：**

```
用户 → 应用系统1 → SSO 服务器（Session 存储）
     ↓              ↓
     应用系统2 ← 验证 Session ID
```

**特点：**
- 所有会话状态存储在 SSO 服务器
- 应用系统每次请求都需要向 SSO 服务器验证
- 支持主动吊销（直接删除 Session）

**实现示例：**

```javascript
// SSO 服务器 - 登录接口
app.post('/sso/login', (req, res) => {
  const { username, password } = req.body;
  
  // 验证账号密码
  if (verify(username, password)) {
    // 创建全局 Session
    const sessionId = generateSessionId();
    redis.set(`session:${sessionId}`, JSON.stringify({
      userId: 123,
      username: 'zhangsan'
    }), 'EX', 3600); // 1小时过期
    
    // 设置 Cookie
    res.cookie('sso_session', sessionId, {
      domain: '.example.com', // 跨子域共享
      httpOnly: true,
      secure: true
    });
    
    res.redirect(req.query.redirect); // 重定向回应用系统
  }
});

// 应用系统 - 验证接口
app.get('/verify', async (req, res) => {
  const sessionId = req.cookies.sso_session;
  
  // 向 SSO 服务器验证
  const session = await redis.get(`session:${sessionId}`);
  if (session) {
    res.json({ valid: true, user: JSON.parse(session) });
  } else {
    res.status(401).json({ valid: false });
  }
});
```

#### 模式 2：单 Token 模式（JWT）

**架构图：**

```
用户 → 应用系统1（本地验证 Token）
     ↓
     应用系统2（本地验证 Token）
```

**特点：**
- Token 自包含用户信息和签名
- 应用系统本地验证，无需请求 SSO 服务器
- 无法主动吊销（需配合黑名单）

**实现示例：**

```javascript
// SSO 服务器 - 生成 Token
const jwt = require('jsonwebtoken');

app.post('/sso/login', (req, res) => {
  const { username, password } = req.body;
  
  if (verify(username, password)) {
    // 生成 JWT
    const token = jwt.sign(
      { userId: 123, username: 'zhangsan' },
      'shared-secret-key', // 所有应用共享此密钥
      { expiresIn: '1h' }
    );
    
    res.json({ token });
  }
});

// 应用系统 - 本地验证
app.get('/api/user', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  try {
    // 本地验证（无需请求 SSO 服务器）
    const decoded = jwt.verify(token, 'shared-secret-key');
    res.json({ user: decoded });
  } catch (error) {
    res.status(401).json({ message: '令牌无效' });
  }
});
```

#### 模式 3：双 Token 模式

**架构图：**

```
用户 → Access Token（短期，本地验证）
     ↓
     Refresh Token（长期，服务器验证）
     ↓
     自动刷新 Access Token
```

**特点：**
- Access Token 用于业务访问（15分钟）
- Refresh Token 用于刷新令牌（7天）
- 兼顾安全性和用户体验

**实现示例：**

```javascript
// SSO 服务器 - 登录生成双 Token
app.post('/sso/login', (req, res) => {
  const { username, password } = req.body;
  
  if (verify(username, password)) {
    // 生成 Access Token（短期）
    const accessToken = jwt.sign(
      { userId: 123, username: 'zhangsan' },
      'access-secret',
      { expiresIn: '15m' }
    );
    
    // 生成 Refresh Token（长期）
    const refreshToken = jwt.sign(
      { userId: 123, type: 'refresh' },
      'refresh-secret',
      { expiresIn: '7d' }
    );
    
    // 存储 Refresh Token（用于黑名单管理）
    redis.set(`refresh:${refreshToken}`, 'valid', 'EX', 604800);
    
    res.json({ accessToken, refreshToken });
  }
});

// SSO 服务器 - 刷新 Access Token
app.post('/sso/refresh', (req, res) => {
  const { refreshToken } = req.body;
  
  try {
    // 验证 Refresh Token
    const decoded = jwt.verify(refreshToken, 'refresh-secret');
    
    // 检查黑名单
    const exists = await redis.get(`refresh:${refreshToken}`);
    if (!exists) {
      return res.status(401).json({ message: 'Refresh Token 已失效' });
    }
    
    // 生成新的 Access Token
    const newAccessToken = jwt.sign(
      { userId: decoded.userId, username: 'zhangsan' },
      'access-secret',
      { expiresIn: '15m' }
    );
    
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(401).json({ message: 'Refresh Token 无效' });
  }
});

// 前端 - 自动刷新逻辑
let accessToken = localStorage.getItem('accessToken');
let refreshToken = localStorage.getItem('refreshToken');

// Axios 拦截器
axios.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Access Token 过期，尝试刷新
      try {
        const res = await axios.post('/sso/refresh', { refreshToken });
        accessToken = res.data.accessToken;
        localStorage.setItem('accessToken', accessToken);
        
        // 重试原请求
        error.config.headers['Authorization'] = `Bearer ${accessToken}`;
        return axios(error.config);
      } catch (refreshError) {
        // Refresh Token 也失效，跳转登录
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

## 4. 实际项目实现

### 4.1 前端实现（React 示例）

```javascript
// SSO 认证钩子
import { useState, useEffect } from 'react';

function useSSO() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // 检查是否已登录
    const checkAuth = async () => {
      const token = localStorage.getItem('sso_token');
      if (token) {
        try {
          const response = await fetch('/api/verify', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await response.json();
          setUser(data.user);
        } catch (error) {
          // Token 无效，重定向到 SSO 登录
          redirectToSSO();
        }
      } else {
        redirectToSSO();
      }
      setLoading(false);
    };
    
    checkAuth();
  }, []);
  
  const redirectToSSO = () => {
    const currentUrl = window.location.href;
    window.location.href = `https://sso.example.com/login?redirect=${currentUrl}`;
  };
  
  const logout = async () => {
    localStorage.removeItem('sso_token');
    await fetch('https://sso.example.com/logout');
    redirectToSSO();
  };
  
  return { user, loading, logout };
}

// 使用示例
function App() {
  const { user, loading, logout } = useSSO();
  
  if (loading) return <div>加载中...</div>;
  
  return (
    <div>
      <h1>欢迎，{user?.username}</h1>
      <button onClick={logout}>退出登录</button>
    </div>
  );
}
```

### 4.2 后端实现（Node.js + Express）

```javascript
const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();

// SSO 服务器
const ssoApp = express();

// 登录页面
ssoApp.get('/login', (req, res) => {
  res.send(`
    <form action="/login" method="POST">
      <input name="username" placeholder="用户名" />
      <input name="password" type="password" placeholder="密码" />
      <input type="hidden" name="redirect" value="${req.query.redirect}" />
      <button type="submit">登录</button>
    </form>
  `);
});

// 处理登录
ssoApp.post('/login', (req, res) => {
  const { username, password, redirect } = req.body;
  
  if (username === 'admin' && password === '123456') {
    const token = jwt.sign({ username }, 'secret-key', { expiresIn: '1h' });
    
    // 重定向回应用系统，携带 Token
    res.redirect(`${redirect}?token=${token}`);
  } else {
    res.send('登录失败');
  }
});

ssoApp.listen(3000);

// 应用系统1
app.get('/', (req, res) => {
  const token = req.query.token;
  
  if (token) {
    // 验证 Token
    try {
      jwt.verify(token, 'secret-key');
      res.send('登录成功！欢迎访问应用系统1');
    } catch (error) {
      res.redirect('http://localhost:3000/login?redirect=http://localhost:4000');
    }
  } else {
    res.redirect('http://localhost:3000/login?redirect=http://localhost:4000');
  }
});

app.listen(4000);
```

## 5. 最佳实践

### 5.1 安全建议

#### 1. 使用 HTTPS

```
❌ 错误：http://sso.example.com
✅ 正确：https://sso.example.com
```

#### 2. 设置安全的 Cookie

```javascript
res.cookie('sso_token', token, {
  httpOnly: true,      // 防止 XSS 攻击
  secure: true,        // 仅 HTTPS 传输
  sameSite: 'lax',     // 防止 CSRF 攻击
  domain: '.example.com' // 跨子域共享
});
```

#### 3. Token 加密传输

```javascript
// 敏感信息加密后存入 Token
const encryptedData = encrypt({
  userId: 123,
  role: 'admin'
}, 'encryption-key');

const token = jwt.sign({ data: encryptedData }, 'secret-key');
```

### 5.2 性能优化

#### 1. 使用 Redis 缓存 Session

```javascript
const redis = require('redis');
const client = redis.createClient();

// 存储 Session
client.set(`session:${sessionId}`, JSON.stringify(userData), 'EX', 3600);

// 读取 Session
const session = await client.get(`session:${sessionId}`);
```

#### 2. Token 本地验证减少服务器压力

```javascript
// 使用 JWT 本地验证，无需每次请求 SSO 服务器
const decoded = jwt.verify(token, 'shared-secret-key');
```

### 5.3 用户体验优化

#### 1. 无感刷新 Token

```javascript
// 在 Token 即将过期前自动刷新
setInterval(async () => {
  const newToken = await refreshToken();
  localStorage.setItem('token', newToken);
}, 14 * 60 * 1000); // 14分钟刷新一次（Token 15分钟过期）
```

#### 2. 统一登出

```javascript
// 退出登录时，清除所有应用的登录状态
async function logout() {
  await fetch('https://sso.example.com/logout');
  localStorage.clear();
  window.location.href = '/login';
}
```

## 6. 常见问题

### Q1：SSO 和 OAuth 2.0 有什么区别？

| 对比项 | SSO | OAuth 2.0 |
|--------|-----|-----------|
| 目的 | 统一身份认证 | 授权第三方应用访问资源 |
| 场景 | 企业内部多系统 | 第三方应用接入 |
| 示例 | 公司 OA、CRM 共享登录 | 微信登录第三方网站 |

### Q2：如何防止 Token 被盗用？

1. **使用 HTTPS** 传输
2. **HTTP-only Cookie** 存储 Token
3. **设置短过期时间**（Access Token 15分钟）
4. **IP 白名单**验证
5. **异常登录检测**（如异地登录提醒）

### Q3：跨域问题如何解决？

#### 方案 1：使用顶级域名 Cookie

```javascript
// SSO 服务器设置 Cookie 域名为顶级域名
res.cookie('sso_token', token, {
  domain: '.example.com' // app1.example.com 和 app2.example.com 都能访问
});
```

#### 方案 2：CORS 配置

```javascript
// SSO 服务器允许跨域
app.use(cors({
  origin: ['https://app1.example.com', 'https://app2.example.com'],
  credentials: true // 允许携带 Cookie
}));
```

---

> 💡 **核心要点：** 单点登录（SSO）通过集中认证，实现多系统间的无缝登录体验。选择 Session、单 Token 或双 Token 模式取决于具体业务场景和安全需求。
