---
title: 包管理器完整指南：npm/yarn/pnpm
date: 2025-10-22
icon: mdi:package-variant
category:
  - 前端工程化
tag:
  - 包管理器
  - npm
  - yarn
  - pnpm
  - 依赖管理
---

# 包管理器完整指南：npm/yarn/pnpm

## 一、包管理器基础

### 1.1 什么是包管理器

**包管理器**是用于自动化安装、配置、更新和卸载软件包的工具，是现代前端工程化的基石。

**核心功能：**
- 依赖安装与管理
- 版本控制
- 脚本执行
- 包发布与分发

### 1.2 三大包管理器对比

| 特性 | npm | yarn | pnpm |
|------|-----|------|------|
| 诞生时间 | 2010 | 2016 | 2017 |
| 安装速度 | 中 | 快 | 最快 |
| 磁盘占用 | 大 | 大 | 小 |
| node_modules结构 | 扁平 | 扁平 | 严格嵌套 |
| 离线模式 | ✅ | ✅ | ✅ |
| Workspace | ✅ | ✅ | ✅ |
| 安全性 | 中 | 高 | 高 |

## 二、npm详解

### 2.1 基本命令

```bash
# 初始化项目
npm init
npm init -y  # 使用默认配置

# 安装依赖
npm install <package>
npm install <package>@<version>
npm install <package> --save-dev  # 开发依赖

# 全局安装
npm install -g <package>

# 卸载
npm uninstall <package>

# 更新
npm update <package>
npm update  # 更新所有包

# 查看
npm list  # 查看已安装的包
npm outdated  # 查看过时的包
```

### 2.2 package.json详解

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "description": "项目描述",
  "main": "index.js",
  "scripts": {
    "dev": "webpack serve --mode development",
    "build": "webpack --mode production",
    "test": "jest"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "webpack": "^5.88.0",
    "@babel/core": "^7.22.0"
  },
  "engines": {
    "node": ">=14.0.0"
  }
}
```

### 2.3 版本号规则

```javascript
// 语义化版本：主版本号.次版本号.修订号
"react": "18.2.0"

// 版本范围符号
"^18.2.0"  // 兼容18.x.x，不升级主版本
"~18.2.0"  // 兼容18.2.x，不升级次版本
">=18.2.0" // 大于等于18.2.0
"18.2.0 - 18.3.0"  // 区间范围
"*"        // 任意版本（不推荐）
"latest"   // 最新版本
```

### 2.4 package-lock.json

**作用：**
- 锁定依赖版本，确保团队一致
- 记录依赖树结构
- 提升安装速度

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "lockfileVersion": 2,
  "requires": true,
  "packages": {
    "node_modules/react": {
      "version": "18.2.0",
      "resolved": "https://registry.npmjs.org/react/-/react-18.2.0.tgz",
      "integrity": "sha512-...",
      "dependencies": {
        "loose-envify": "^1.1.0"
      }
    }
  }
}
```

### 2.5 npm scripts

```json
{
  "scripts": {
    "dev": "webpack serve",
    "build": "webpack --mode production",
    "test": "jest",
    "lint": "eslint src",
    "prebuild": "npm run lint",  // 生命周期钩子
    "postbuild": "echo 'Build completed'"
  }
}
```

```bash
# 执行脚本
npm run dev
npm run build

# 并行执行
npm run dev & npm run test

# 串行执行
npm run lint && npm run build
```

## 三、yarn详解

### 3.1 核心优势

**相比npm的改进：**
- 更快的安装速度（并行下载）
- 离线模式支持
- 确定性的依赖树（yarn.lock）
- 更简洁的输出

### 3.2 基本命令

```bash
# 初始化
yarn init

# 安装依赖
yarn add <package>
yarn add <package>@<version>
yarn add <package> --dev

# 全局安装
yarn global add <package>

# 卸载
yarn remove <package>

# 更新
yarn upgrade <package>
yarn upgrade-interactive  # 交互式更新

# 查看
yarn list
yarn outdated
```

### 3.3 yarn.lock

```yaml
# yarn.lock
react@^18.2.0:
  version "18.2.0"
  resolved "https://registry.yarnpkg.com/react/-/react-18.2.0.tgz"
  integrity sha512-...
  dependencies:
    loose-envify "^1.1.0"
```

### 3.4 Yarn Workspaces

```json
{
  "private": true,
  "workspaces": [
    "packages/*"
  ]
}
```

```bash
# 项目结构
my-monorepo/
├── package.json
└── packages/
    ├── package-a/
    │   └── package.json
    └── package-b/
        └── package.json
```

## 四、pnpm详解

### 4.1 核心特性

**革命性优势：**
- 硬链接节省磁盘空间（可节省70%）
- 严格的依赖管理（避免幽灵依赖）
- 最快的安装速度
- 天然支持Monorepo

### 4.2 存储机制

```bash
# pnpm全局存储
~/.pnpm-store/
├── v3/
│   └── files/
│       └── 00/
│           └── react@18.2.0

# 项目node_modules
project/
└── node_modules/
    ├── .pnpm/
    │   └── react@18.2.0/
    └── react -> .pnpm/react@18.2.0/node_modules/react
```

### 4.3 基本命令

```bash
# 安装pnpm
npm install -g pnpm

# 初始化
pnpm init

# 安装依赖
pnpm add <package>
pnpm add <package> -D
pnpm add <package> -g

# 卸载
pnpm remove <package>

# 更新
pnpm update <package>

# 查看
pnpm list
pnpm outdated
```

### 4.4 .npmrc配置

```ini
# .npmrc
shamefully-hoist=true  # 提升依赖（兼容性）
strict-peer-dependencies=false  # 宽松peer依赖
```

### 4.5 pnpm Workspace

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'apps/*'
  - '!**/test/**'
```

## 五、依赖管理最佳实践

### 5.1 语义化版本

```json
{
  "dependencies": {
    "react": "^18.2.0",      // 推荐：允许小版本更新
    "lodash": "~4.17.21",    // 保守：只允许补丁更新
    "axios": "1.4.0"         // 锁定：不允许任何更新
  }
}
```

### 5.2 依赖分类

```json
{
  "dependencies": {
    // 生产环境依赖
    "react": "^18.2.0",
    "axios": "^1.4.0"
  },
  "devDependencies": {
    // 开发工具
    "webpack": "^5.88.0",
    "@babel/core": "^7.22.0",
    "eslint": "^8.44.0"
  },
  "peerDependencies": {
    // 插件要求的宿主依赖
    "react": ">=16.8.0"
  },
  "optionalDependencies": {
    // 可选依赖
    "fsevents": "^2.3.2"
  }
}
```

### 5.3 避免幽灵依赖

```javascript
// ❌ 错误：依赖未声明的包
import _ from 'lodash';  // lodash未在package.json中声明

// ✅ 正确：显式安装依赖
// 1. 安装：pnpm add lodash
// 2. 使用
import _ from 'lodash';
```

## 六、镜像源管理

### 6.1 查看和切换源

```bash
# 查看当前源
npm config get registry
yarn config get registry
pnpm config get registry

# 临时使用淘宝镜像
npm install --registry=https://registry.npmmirror.com

# 永久切换
npm config set registry https://registry.npmmirror.com
yarn config set registry https://registry.npmmirror.com
pnpm config set registry https://registry.npmmirror.com

# 恢复官方源
npm config set registry https://registry.npmjs.org
```

### 6.2 使用nrm管理源

```bash
# 安装nrm
npm install -g nrm

# 查看可用源
nrm ls

# 切换源
nrm use taobao
nrm use npm

# 测试源速度
nrm test
```

## 七、Monorepo实践

### 7.1 项目结构

```bash
my-monorepo/
├── package.json
├── pnpm-workspace.yaml
└── packages/
    ├── shared/
    │   ├── package.json
    │   └── src/
    ├── app-a/
    │   ├── package.json
    │   └── src/
    └── app-b/
        ├── package.json
        └── src/
```

### 7.2 依赖管理

```json
// packages/app-a/package.json
{
  "name": "@my-project/app-a",
  "dependencies": {
    "@my-project/shared": "workspace:*"  // workspace协议
  }
}
```

```bash
# 为特定包添加依赖
pnpm add react --filter @my-project/app-a

# 执行特定包的脚本
pnpm --filter @my-project/app-a dev

# 执行所有包的脚本
pnpm -r dev
```

## 八、常见问题解决

### 8.1 依赖冲突

```bash
# 清理缓存
npm cache clean --force
yarn cache clean
pnpm store prune

# 删除node_modules重新安装
rm -rf node_modules package-lock.json
npm install
```

### 8.2 安装速度慢

```bash
# 使用镜像源
npm config set registry https://registry.npmmirror.com

# 使用pnpm
npm install -g pnpm
pnpm install
```

### 8.3 版本锁定

```bash
# 生成lock文件
npm install
yarn install
pnpm install

# 完全按照lock文件安装
npm ci  # npm
yarn install --frozen-lockfile  # yarn
pnpm install --frozen-lockfile  # pnpm
```

## 九、面试高频问题

### Q1: npm、yarn、pnpm的区别？

**答案：**
- **npm**：最早的包管理器，生态最完善
- **yarn**：改进安装速度和确定性，引入yarn.lock
- **pnpm**：硬链接节省空间，严格依赖管理，性能最优

### Q2: package-lock.json的作用？

**答案：**
1. 锁定依赖版本，确保团队一致性
2. 记录完整的依赖树
3. 提升安装速度（跳过版本解析）

### Q3: 如何解决依赖冲突？

**答案：**
1. 使用resolutions字段强制版本
2. 升级或降级冲突的包
3. 使用--legacy-peer-deps（npm）
4. 检查并更新peerDependencies

## 十、总结

### 10.1 选择建议

- **个人项目**：pnpm（快速、节省空间）
- **团队项目**：统一使用一种（推荐pnpm或yarn）
- **老项目**：保持原有工具
- **Monorepo**：pnpm或yarn workspaces

### 10.2 学习路径

1. 掌握npm基本命令
2. 理解package.json配置
3. 学习pnpm提升效率
4. 实践Monorepo管理

---

**相关文章：**
- [NPM私服搭建](./npm-registry.md)
- [前端模块化](./module-systems.md)
