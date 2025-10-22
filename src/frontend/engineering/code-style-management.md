---
title: 代码风格管理完整指南
date: 2025-10-22
icon: mdi:format-paint
category:
  - 前端工程化
tag:
  - 代码规范
  - ESLint
  - Prettier
  - StyleLint
  - EditorConfig
---

# 代码风格管理完整指南

## 一、为什么需要代码风格管理

### 1.1 代码风格的重要性

**团队协作中的痛点：**
```javascript
// 开发者A的代码
function getData(){
    return fetch("/api/data").then(res=>res.json())
}

// 开发者B的代码
function getData() {
  return fetch('/api/data')
    .then((res) => res.json());
}
```

**统一风格的好处：**
- 提升代码可读性
- 减少Code Review成本
- 避免格式化冲突
- 降低维护难度
- 培养团队规范意识

## 二、EditorConfig

### 2.1 基本配置

```ini
# .editorconfig
root = true

# 所有文件
[*]
charset = utf-8
indent_style = space
indent_size = 2
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true

# Markdown文件保留尾部空格
[*.md]
trim_trailing_whitespace = false

# Python文件使用4个空格
[*.py]
indent_size = 4

# Makefile使用Tab
[Makefile]
indent_style = tab
```

### 2.2 配置说明

| 属性 | 说明 | 可选值 |
|------|------|--------|
| `indent_style` | 缩进风格 | space / tab |
| `indent_size` | 缩进大小 | 数字 |
| `end_of_line` | 换行符 | lf / cr / crlf |
| `charset` | 字符编码 | utf-8 / latin1等 |
| `trim_trailing_whitespace` | 删除行尾空格 | true / false |
| `insert_final_newline` | 文件末尾插入空行 | true / false |

## 三、Prettier

### 3.1 安装配置

```bash
# 安装
npm install --save-dev prettier

# 创建配置文件
echo {} > .prettierrc.json
```

### 3.2 配置选项

```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "quoteProps": "as-needed",
  "jsxSingleQuote": false,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "always",
  "proseWrap": "preserve",
  "htmlWhitespaceSensitivity": "css",
  "endOfLine": "lf"
}
```

### 3.3 忽略文件

```ini
# .prettierignore
node_modules
dist
build
coverage
.next
*.min.js
*.min.css
```

### 3.4 npm scripts

```json
{
  "scripts": {
    "format": "prettier --write \"src/**/*.{js,jsx,ts,tsx,json,css,scss,md}\"",
    "format:check": "prettier --check \"src/**/*.{js,jsx,ts,tsx,json,css,scss,md}\""
  }
}
```

## 四、ESLint

### 4.1 基础配置

```javascript
// .eslintrc.js
module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'  // 放在最后，覆盖其他配置
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: [
    'react',
    '@typescript-eslint'
  ],
  rules: {
    'no-console': 'warn',
    'no-unused-vars': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
    'eqeqeq': ['error', 'always'],
    'react/prop-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn'
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
};
```

### 4.2 规则严格程度

```javascript
{
  "rules": {
    "no-console": "off",     // 关闭规则
    "no-unused-vars": "warn", // 警告
    "semi": "error"           // 错误
  }
}
```

### 4.3 常用规则

```javascript
{
  "rules": {
    // 基础规则
    "no-console": "warn",              // 禁用console
    "no-debugger": "error",            // 禁用debugger
    "no-unused-vars": "error",         // 禁止未使用的变量
    "no-undef": "error",               // 禁用未声明的变量
    
    // 最佳实践
    "eqeqeq": ["error", "always"],     // 强制使用===
    "curly": ["error", "all"],         // 强制使用花括号
    "no-eval": "error",                // 禁用eval
    "no-with": "error",                // 禁用with
    
    // ES6
    "prefer-const": "error",           // 优先使用const
    "no-var": "error",                 // 禁用var
    "arrow-body-style": ["error", "as-needed"], // 箭头函数体
    "prefer-template": "error",        // 优先使用模板字符串
    
    // React
    "react/jsx-uses-react": "off",     // React 17+不需要引入React
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",         // 使用TypeScript时关闭
    
    // TypeScript
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-module-boundary-types": "off"
  }
}
```

### 4.4 忽略文件

```ini
# .eslintignore
node_modules
dist
build
coverage
*.min.js
```

## 五、StyleLint

### 5.1 CSS代码检查

```bash
# 安装
npm install --save-dev stylelint stylelint-config-standard
```

```javascript
// .stylelintrc.js
module.exports = {
  extends: ['stylelint-config-standard', 'stylelint-config-prettier'],
  rules: {
    'color-hex-case': 'lower',
    'color-hex-length': 'short',
    'font-family-name-quotes': 'always-where-recommended',
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['global']
      }
    ],
    'property-no-unknown': [
      true,
      {
        ignoreProperties: ['composes']
      }
    ]
  }
};
```

### 5.2 SCSS配置

```javascript
module.exports = {
  extends: [
    'stylelint-config-standard-scss',
    'stylelint-config-prettier'
  ],
  rules: {
    'scss/at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: ['tailwind', 'apply', 'variants', 'responsive', 'screen']
      }
    ]
  }
};
```

## 六、集成配置

### 6.1 ESLint + Prettier

```bash
# 安装
npm install --save-dev eslint-config-prettier eslint-plugin-prettier
```

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:prettier/recommended'  // 必须放在最后
  ],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error'
  }
};
```

### 6.2 VS Code配置

```json
// .vscode/settings.json
{
  // 编辑器配置
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.fixAll.stylelint": true
  },
  
  // 文件关联
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  
  // ESLint配置
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  
  // StyleLint配置
  "stylelint.validate": ["css", "scss", "less"],
  
  // 保存时自动修复
  "editor.formatOnSave": true
}
```

## 七、Git Hooks

### 7.1 Husky配置

```bash
# 安装
npm install --save-dev husky lint-staged
npx husky-init && npm install
```

```json
// package.json
{
  "scripts": {
    "prepare": "husky install"
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{css,scss,less}": [
      "stylelint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

### 7.2 Commitlint

```bash
# 安装
npm install --save-dev @commitlint/cli @commitlint/config-conventional
```

```javascript
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // 新功能
        'fix',      // 修复bug
        'docs',     // 文档
        'style',    // 格式
        'refactor', // 重构
        'perf',     // 性能优化
        'test',     // 测试
        'chore',    // 构建/工具
        'revert'    // 回滚
      ]
    ],
    'subject-case': [0]
  }
};
```

```bash
# .husky/commit-msg
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx --no-install commitlint --edit "$1"
```

## 八、团队规范

### 8.1 命名规范

```javascript
// 文件命名：kebab-case
user-service.js
data-utils.ts

// 组件命名：PascalCase
UserProfile.tsx
DataTable.tsx

// 类名：PascalCase
class UserService {}

// 函数/变量：camelCase
function getUserById() {}
const userData = {};

// 常量：UPPER_SNAKE_CASE
const MAX_COUNT = 100;
const API_BASE_URL = 'https://api.example.com';

// 私有属性/方法：_开头
class User {
  _privateMethod() {}
}
```

### 8.2 注释规范

```javascript
/**
 * 获取用户信息
 * @param {string} userId - 用户ID
 * @param {object} options - 可选配置
 * @param {boolean} options.includeProfile - 是否包含详细信息
 * @returns {Promise<User>} 用户对象
 * @throws {Error} 当用户不存在时抛出错误
 * @example
 * const user = await getUserInfo('123', { includeProfile: true });
 */
async function getUserInfo(userId, options = {}) {
  // 实现...
}

// 单行注释：解释why而不是what
// 为了兼容旧数据，需要特殊处理
const data = legacyFormat(rawData);

// TODO注释
// TODO: 需要优化性能
// FIXME: 修复边界情况
// HACK: 临时解决方案
```

## 九、最佳实践

### 9.1 渐进式引入

```javascript
// 1. 先引入Prettier（格式化）
// 2. 再引入ESLint（代码质量）
// 3. 最后引入更严格的规则

// package.json
{
  "scripts": {
    "lint": "eslint src",
    "lint:fix": "eslint src --fix",
    "format": "prettier --write src"
  }
}
```

### 9.2 自定义规则

```javascript
// 根据团队需求自定义规则
module.exports = {
  rules: {
    // 团队约定：console.log用于调试，需要warn
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    
    // 团队约定：允许使用any但需要注释说明
    '@typescript-eslint/no-explicit-any': 'off',
    
    // 团队约定：函数最大行数限制
    'max-lines-per-function': ['error', 50]
  }
};
```

## 十、常见问题

### 10.1 ESLint与Prettier冲突

```bash
# 解决方案：安装eslint-config-prettier
npm install --save-dev eslint-config-prettier

# 在extends最后添加
{
  "extends": [
    "eslint:recommended",
    "prettier"  // 必须在最后
  ]
}
```

### 10.2 忽略特定代码

```javascript
// ESLint忽略
/* eslint-disable */
const data = getData();
/* eslint-enable */

// 忽略单行
const data = getData(); // eslint-disable-line

// 忽略下一行
// eslint-disable-next-line no-console
console.log(data);

// Prettier忽略
// prettier-ignore
const matrix = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1]
];
```

## 十一、面试高频问题

### Q1: ESLint和Prettier的区别？

**答案：**
- **ESLint**：代码质量检查（逻辑错误、最佳实践）
- **Prettier**：代码格式化（缩进、引号、分号）
- **配合使用**：Prettier负责格式，ESLint负责质量

### Q2: 如何在团队中推行代码规范？

**答案：**
1. 制定规范文档
2. 配置自动化工具（ESLint、Prettier）
3. 集成到CI/CD流程
4. Git Hooks强制检查
5. Code Review时严格执行

### Q3: Husky的作用是什么？

**答案：**
Husky是Git Hooks工具，可以在git操作前执行脚本：
- pre-commit：提交前检查代码
- commit-msg：检查提交信息格式
- pre-push：推送前运行测试

## 十二、总结

### 12.1 工具链选择

**推荐组合：**
- EditorConfig：统一编辑器配置
- Prettier：代码格式化
- ESLint：JavaScript/TypeScript检查
- StyleLint：CSS/SCSS检查
- Husky + lint-staged：Git Hooks
- Commitlint：提交信息规范

### 12.2 实施步骤

1. 团队讨论确定规范
2. 配置工具链
3. 编写文档
4. 培训团队成员
5. 持续优化调整

---

**相关文章：**
- [前端工程化](./frontend-engineering.md)
- [Git工作流最佳实践]()
