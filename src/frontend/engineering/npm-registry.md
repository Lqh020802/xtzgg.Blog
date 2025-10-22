---
title: NPM 私服
icon: mdi:tools
category:
  - 前端工程化
tag:
  - NPM
  - 私服
  - 包管理
  - Verdaccio
  - DevOps
---

# NPM 私服

## 1. 什么是 NPM 私服

**npm 私服（Private npm Registry）** 是企业或团队内部搭建的私有 npm 仓库，用于存储、管理和分发内部开发的 npm 包，同时可以缓存公共 npm 仓库（如 npmjs.com）的包，兼具 **"私有包管理"** 和 **"公共包加速"** 的双重作用。

### 1.1 架构示意图

```
开发者
  ↓
npm install/publish
  ↓
┌─────────────────────────────┐
│     NPM 私服（内网）          │
│  ┌────────────┬────────────┐│
│  │  私有包仓库  │  公共包缓存  ││
│  │ (内部开发) │  (npm镜像) ││
│  └────────────┴────────────┘│
└─────────────────────────────┘
         ↓ (未缓存时)
    公共 npm 仓库
   (npmjs.com)
```

### 1.2 核心概念

- **私有仓库：** 存储企业内部开发的私有 npm 包
- **缓存代理：** 缓存公共 npm 包，加速下载
- **权限管理：** 控制谁可以发布和下载包
- **版本管理：** 支持语义化版本控制

## 2. NPM 私服的作用

### 2.1 私有包安全管理

**问题场景：**
```javascript
// 企业内部的工具库
// ❌ 不能发布到公共 npm
@company/auth-utils
@company/payment-sdk
@company/ui-components
```

**解决方案：**
- ✅ 企业内部开发的工具库、组件库等敏感代码，不适合发布到公共 npm 仓库
- ✅ 通过私服可实现权限管控（如仅团队成员可访问）
- ✅ 防止代码泄露和知识产权损失

**示例：**
```bash
# 发布内部包到私服（外部无法访问）
npm publish @company/auth-utils --registry http://npm.company.com
```

### 2.2 团队协作效率提升

**传统方式的问题：**
```
开发者 A 开发了工具库
  ↓
手动发送代码给开发者 B
  ↓
开发者 B 复制粘贴到项目
  ↓
版本更新后需要重新发送
  ↓
容易造成版本混乱
```

**使用私服的优势：**
```
开发者 A 发布到私服
  ↓
开发者 B 直接 npm install
  ↓
支持版本管理（升级、回滚）
  ↓
避免代码重复开发
```

**示例：**
```bash
# 团队成员直接安装
npm install @company/auth-utils@1.2.0

# 升级版本
npm update @company/auth-utils

# 回滚到旧版本
npm install @company/auth-utils@1.0.0
```

### 2.3 公共包缓存加速

**工作机制：**

```
首次安装 react
  ↓
私服检查本地缓存
  ↓ (未缓存)
从 npmjs.com 下载
  ↓
缓存到私服
  ↓
返回给开发者

后续安装 react
  ↓
私服检查本地缓存
  ↓ (已缓存)
直接从私服返回 ✅
```

**速度对比：**

| 场景 | 无私服 | 有私服 |
|------|--------|--------|
| 首次安装 | 3-5 分钟 | 3-5 分钟 |
| 后续安装 | 3-5 分钟 | 10-30 秒 |
| 网络故障 | ❌ 无法安装 | ✅ 从缓存安装 |

### 2.4 规范包发布流程

**集成 CI/CD 流程：**

```
代码提交
  ↓
自动运行测试
  ↓
代码审查
  ↓
构建打包
  ↓
发布到私服（自动化）
  ↓
通知团队成员
```

**质量保证：**
- ✅ 代码风格检查（ESLint）
- ✅ 单元测试覆盖率要求
- ✅ 构建成功才能发布
- ✅ 避免"带病包"进入开发流程

## 3. 常见的 NPM 私服

### 3.1 私服工具对比

| 工具名称 | 特点 | 适用场景 |
|---------|------|---------|
| **Verdaccio** | - 轻量开源（基于 Node.js）<br>- 配置简单<br>- 支持私有包 + 缓存公共包<br>- 无外部依赖 | - 中小型团队<br>- 个人项目<br>- 快速搭建 |
| **Nexus** | - 功能强大<br>- 支持多种仓库（npm、Maven、Docker等）<br>- 企业级安全与权限管理 | - 大型企业<br>- 多语言技术栈团队 |
| **Artifactory** | - 专注 DevOps 集成<br>- 复杂的权限控制<br>- 包生命周期管理<br>- 商业软件（有免费版） | - 对 CI/CD 流程<br>  要求高的团队 |
| **cnpmjs.org** | - 淘宝团队开源<br>- 兼容 npm 命令<br>- 支持私有包和镜像功能 | - 熟悉 Node.js<br>  生态的团队 |

### 3.2 Verdaccio（推荐入门）

**优点：**
- 🚀 安装简单（一条命令）
- ⚡ 启动快速（无需数据库）
- 📦 功能完整（满足大部分需求）
- 🔧 配置灵活（YAML 配置文件）

**安装示例：**
```bash
# 全局安装
npm install -g verdaccio

# 启动服务
verdaccio

# 输出：
# warn --- config file - /root/.config/verdaccio/config.yaml
# warn --- http address - http://localhost:4873/
```

## 4. NPM 私服工作流程

### 4.1 完整流程图

```
┌─────────────────────────────────────┐
│  1. 搭建私服（安装 Verdaccio）       │
└───────────────┬─────────────────────┘
                ↓
┌─────────────────────────────────────┐
│  2. 配置 npm 源指向私服              │
└───────────────┬─────────────────────┘
                ↓
┌─────────────────────────────────────┐
│  3. 发布私有包到私服                 │
└───────────────┬─────────────────────┘
                ↓
┌─────────────────────────────────────┐
│  4. 团队成员安装包                   │
│     - 私有包：直接从私服下载         │
│     - 公共包：私服缓存后返回         │
└───────────────┬─────────────────────┘
                ↓
┌─────────────────────────────────────┐
│  5. 权限管理和版本控制               │
└─────────────────────────────────────┘
```

### 4.2 步骤详解

#### 步骤 1：搭建私服

```bash
# 安装 Verdaccio
npm install -g verdaccio

# 启动服务（默认地址 http://localhost:4873）
verdaccio

# 后台运行（推荐使用 PM2）
pm2 start verdaccio
```

#### 步骤 2：配置 npm 源

```bash
# 方式 1：临时切换（推荐）
npm install <package> --registry http://localhost:4873

# 方式 2：全局切换
npm set registry http://localhost:4873

# 方式 3：使用 nrm 管理（推荐）
npm install -g nrm
nrm add private http://localhost:4873
nrm use private

# 查看当前源
npm get registry
```

#### 步骤 3：发布私有包

```bash
# 1. 注册私服账号（首次发布需要）
npm adduser --registry http://localhost:4873
# Username: your-name
# Password: your-password
# Email: your-email@example.com

# 2. 发布包到私服
npm publish --registry http://localhost:4873

# 或者在 package.json 中配置 publishConfig
```

#### 步骤 4：安装包

**安装私有包：**
```bash
npm install @company/auth-utils
# 直接从私服下载（私服中已存在）
```

**安装公共包：**
```bash
npm install react
# 1. 私服检查本地缓存
# 2. 若未缓存，从 npmjs.com 下载
# 3. 缓存到私服
# 4. 返回给用户
```

#### 步骤 5：权限管理

**配置文件示例（config.yaml）：**
```yaml
# 权限配置
packages:
  '@company/*':
    access: $authenticated  # 只有登录用户可访问
    publish: $authenticated # 只有登录用户可发布
    
  '**':
    access: $all           # 所有人可访问公共包
    publish: $authenticated # 需要登录才能发布
```

## 5. 如何在 NPM 私服中发布一个包

### 5.1 发布前准备

#### 1. 确保已搭建 npm 私服

```bash
# 检查私服是否可访问
curl http://192.168.1.100:4873

# 或在浏览器访问
http://192.168.1.100:4873
```

#### 2. 初始化包项目

```bash
# 创建新项目
mkdir my-private-package && cd my-private-package

# 初始化 package.json
npm init -y
```

#### 3. 配置 package.json（关键）

```json
{
  "name": "@your-org/package-name",  // ✅ 建议用组织名前缀，避免与公共包冲突
  "version": "1.0.0",                // ✅ 遵循语义化版本（major.minor.patch）
  "description": "My private package",
  "main": "index.js",                // ✅ 入口文件
  "private": false,                  // ✅ 必须设为 false 才能发布
  "publishConfig": {
    "registry": "http://npm.company.com"  // ✅ 指定发布到私服
  },
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": ["private", "utils"],
  "author": "Your Name",
  "license": "MIT"
}
```

#### 4. 准备包内容

```javascript
// index.js
module.exports = {
  sayHello: () => {
    console.log("Hello from private package!");
  },
  
  add: (a, b) => {
    return a + b;
  }
};
```

**创建 README.md：**
```markdown
# @your-org/package-name

企业内部工具包

## 安装

\`\`\`bash
npm install @your-org/package-name
\`\`\`

## 使用

\`\`\`javascript
const utils = require('@your-org/package-name');
utils.sayHello();
\`\`\`
```

**创建 .npmignore：**
```
node_modules/
test/
.env
*.log
.DS_Store
```

### 5.2 发布步骤（5 步完成）

#### 步骤 1：切换 npm 源到私服

```bash
# 方式 1：临时切换（推荐，不影响全局配置）
npm set registry http://192.168.1.100:4873

# 方式 2：使用 nrm 工具管理源（推荐）
# 先安装 nrm
npm install -g nrm

# 添加私服源
nrm add private http://192.168.1.100:4873

# 切换到私服源
nrm use private

# 查看当前源
nrm current
```

#### 步骤 2：登录私服（首次发布需执行）

```bash
npm login

# 按提示输入：
# Username: your-username
# Password: your-password
# Email: (this IS public) your-email@example.com
```

**验证登录状态：**
```bash
npm whoami
# 输出：your-username
```

**登录凭证位置：**
```bash
# 凭证保存在 ~/.npmrc
cat ~/.npmrc
# //192.168.1.100:4873/:_authToken="your-token"
```

#### 步骤 3：检查包配置（避免发布失败）

**检查清单：**

```bash
# 1. 检查包名是否已存在
npm view @your-org/package-name
# 如果返回 404，说明包名可用

# 2. 检查版本号
npm view @your-org/package-name versions
# 确保新版本号未被使用

# 3. 检查 package.json 配置
cat package.json | grep -E "name|version|main|private"

# 4. 测试本地包
npm link
cd /path/to/test-project
npm link @your-org/package-name
```

**常见问题检查：**
- ✅ `name` 不能与私服中已存在的包重名
- ✅ `version` 需为新版本（若已发布过 1.0.0，需更新为 1.0.1 或 1.1.0）
- ✅ `private` 必须为 `false`
- ✅ 确保无敏感信息（如密钥、密码）
- ✅ `.npmignore` 排除不需要发布的文件

#### 步骤 4：发布包到私服

```bash
# 发布到私服
npm publish

# 如果需要指定 registry
npm publish --registry http://192.168.1.100:4873

# 如果包名带有 scope（如 @company/package）
npm publish --access public
```

**成功后显示：**
```bash
npm notice 
npm notice 📦  @your-org/package-name@1.0.0
npm notice === Tarball Contents === 
npm notice 123B index.js       
npm notice 456B package.json   
npm notice 789B README.md      
npm notice === Tarball Details === 
npm notice name:          @your-org/package-name                  
npm notice version:       1.0.0                                   
npm notice package size:  1.4 kB                                  
npm notice unpacked size: 1.4 kB                                  
npm notice shasum:        abc123def456...                         
npm notice integrity:     sha512-xyz789...                       
npm notice total files:   3                                       
npm notice 
+ @your-org/package-name@1.0.0
```

#### 步骤 5：验证发布结果

```bash
# 方式 1：查看包信息
npm view @your-org/package-name

# 输出：
# @your-org/package-name@1.0.0 | MIT | deps: none | versions: 1
# My private package
# http://192.168.1.100:4873/@your-org/package-name

# 方式 2：在浏览器访问私服
http://192.168.1.100:4873

# 方式 3：测试安装
cd /tmp
mkdir test-install && cd test-install
npm install @your-org/package-name
node -e "console.log(require('@your-org/package-name'))"
```

## 6. 版本管理最佳实践

### 6.1 语义化版本（SemVer）

**版本格式：** `主版本号.次版本号.修订号`（`MAJOR.MINOR.PATCH`）

```
1.2.3
│ │ └─ PATCH：修复 bug，向后兼容
│ └─── MINOR：新增功能，向后兼容
└───── MAJOR：重大更新，可能不兼容
```

**更新版本命令：**
```bash
# 修复 bug：1.0.0 → 1.0.1
npm version patch

# 新增功能：1.0.1 → 1.1.0
npm version minor

# 重大更新：1.1.0 → 2.0.0
npm version major

# 自动提交 git
npm version patch -m "fix: 修复登录bug"
```

### 6.2 发布流程自动化

**package.json 添加脚本：**
```json
{
  "scripts": {
    "prepublishOnly": "npm run test && npm run build",
    "test": "jest",
    "build": "rollup -c",
    "release": "npm version patch && npm publish"
  }
}
```

**使用 npm 钩子：**
```bash
# prepublishOnly：发布前自动运行
# preversion：版本号更新前运行
# postversion：版本号更新后运行
```

## 7. 常见问题与解决方案

### Q1：发布失败：403 Forbidden

**原因：** 未登录或权限不足

**解决：**
```bash
# 重新登录
npm login --registry http://npm.company.com

# 检查权限配置
cat ~/.config/verdaccio/config.yaml
```

### Q2：发布失败：版本已存在

**原因：** 版本号重复

**解决：**
```bash
# 更新版本号
npm version patch

# 或手动修改 package.json 中的 version
```

### Q3：安装包时找不到

**原因：** npm 源未指向私服

**解决：**
```bash
# 检查当前源
npm get registry

# 切换到私服
npm set registry http://npm.company.com

# 或在安装时指定
npm install <package> --registry http://npm.company.com
```

### Q4：私服缓存的公共包版本过旧

**原因：** 私服缓存未更新

**解决：**
```bash
# 清除本地缓存
npm cache clean --force

# 强制从源重新下载
npm install <package> --force
```

### Q5：如何删除已发布的包

**Verdaccio：**
```bash
# 删除指定版本
npm unpublish @your-org/package-name@1.0.0

# 删除所有版本（慎用）
npm unpublish @your-org/package-name --force
```

## 8. 生产环境部署建议

### 8.1 使用 Docker 部署

```dockerfile
# Dockerfile
FROM verdaccio/verdaccio:latest

# 复制自定义配置
COPY config.yaml /verdaccio/conf/config.yaml

# 暴露端口
EXPOSE 4873

# 数据持久化
VOLUME /verdaccio/storage
```

**启动容器：**
```bash
docker run -d \
  --name verdaccio \
  -p 4873:4873 \
  -v /path/to/storage:/verdaccio/storage \
  -v /path/to/config.yaml:/verdaccio/conf/config.yaml \
  verdaccio/verdaccio
```

### 8.2 配置反向代理（Nginx）

```nginx
server {
  listen 80;
  server_name npm.company.com;
  
  location / {
    proxy_pass http://localhost:4873;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}
```

### 8.3 配置 HTTPS

```bash
# 使用 Let's Encrypt 获取免费证书
certbot --nginx -d npm.company.com
```

### 8.4 监控和日志

```bash
# 使用 PM2 管理进程
pm2 start verdaccio

# 查看日志
pm2 logs verdaccio

# 监控状态
pm2 monit
```

## 9. 总结

### 9.1 核心要点

- 📦 **私服本质：** 私有包仓库 + 公共包缓存代理
- 🔒 **主要价值：** 代码安全、协作效率、下载加速
- 🛠️ **推荐工具：** Verdaccio（中小团队）、Nexus（大型企业）
- 📋 **发布流程：** 配置源 → 登录 → 检查 → 发布 → 验证

### 9.2 最佳实践

- ✅ 使用语义化版本管理
- ✅ 发布前自动运行测试
- ✅ 配置 `.npmignore` 排除无用文件
- ✅ 使用 `publishConfig` 指定发布目标
- ✅ 生产环境使用 Docker + Nginx 部署

---

> 💡 **核心要点：** NPM 私服是企业级前端工程化的重要基础设施，兼顾代码安全和开发效率，推荐中小团队使用 Verdaccio 快速搭建。
