---
title: tsconfig配置详解
date: 2025-10-22
icon: logos:typescript-icon
category:
  - TypeScript
tag:
  - tsconfig
  - 配置
  - 编译选项
---

# tsconfig配置详解

## 一、基础配置

### 1.1 最小化配置

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true
  }
}
```

### 1.2 推荐配置

```json
{
  "compilerOptions": {
    // 编译目标
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    
    // 输出配置
    "outDir": "./dist",
    "rootDir": "./src",
    "removeComments": true,
    "sourceMap": true,
    
    // 严格检查
    "strict": true,
    
    // 模块解析
    "moduleResolution": "node",
    "esModuleInterop": true,
    "resolveJsonModule": true,
    
    // 其他选项
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.spec.ts"]
}
```

## 二、编译选项详解

### 2.1 语言和环境（Language and Environment）

```json
{
  "compilerOptions": {
    // 编译目标版本
    "target": "ES2020", // ES3, ES5, ES6/ES2015, ES2016-ES2022, ESNext
    
    // 要包含的库文件
    "lib": [
      "ES2020",
      "DOM",
      "DOM.Iterable",
      "WebWorker"
    ],
    
    // JSX 支持
    "jsx": "react", // preserve, react, react-native, react-jsx
    
    // 实验性装饰器
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    
    // 使用定义字段
    "useDefineForClassFields": true
  }
}
```

### 2.2 模块（Modules）

```json
{
  "compilerOptions": {
    // 模块系统
    "module": "commonjs", // none, commonjs, amd, umd, system, es6/es2015, es2020, esnext
    
    // 模块解析策略
    "moduleResolution": "node", // classic, node
    
    // 基础路径
    "baseUrl": "./",
    
    // 路径映射
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@utils/*": ["src/utils/*"]
    },
    
    // 根目录
    "rootDirs": ["src", "generated"],
    
    // 类型根目录
    "typeRoots": ["./typings", "./node_modules/@types"],
    
    // 要包含的类型包
    "types": ["node", "jest"],
    
    // 允许导入 JSON 模块
    "resolveJsonModule": true,
    
    // 允许没有默认导出的模块
    "allowSyntheticDefaultImports": true,
    
    // ES 模块互操作
    "esModuleInterop": true
  }
}
```

### 2.3 输出（Emit）

```json
{
  "compilerOptions": {
    // 生成声明文件
    "declaration": true,
    "declarationMap": true,
    
    // 输出目录
    "outDir": "./dist",
    
    // 输出单个文件
    "outFile": "./dist/bundle.js",
    
    // 移除注释
    "removeComments": true,
    
    // 不输出文件
    "noEmit": true,
    
    // 仅检查不输出
    "noEmitOnError": true,
    
    // 保留 const enum
    "preserveConstEnums": true,
    
    // 生成 source map
    "sourceMap": true,
    "inlineSourceMap": false,
    "inlineSources": false,
    
    // 导入辅助函数
    "importHelpers": true,
    
    // 降级迭代器
    "downlevelIteration": true,
    
    // 源码根目录
    "sourceRoot": "",
    "mapRoot": "",
    
    // 新行字符
    "newLine": "lf" // crlf, lf
  }
}
```

### 2.4 严格检查（Type Checking）

```json
{
  "compilerOptions": {
    // 启用所有严格检查
    "strict": true,
    
    // === strict: true 包含以下选项 ===
    
    // 不允许隐式 any
    "noImplicitAny": true,
    
    // 严格的 null 检查
    "strictNullChecks": true,
    
    // 严格的函数类型
    "strictFunctionTypes": true,
    
    // 严格的 bind/call/apply
    "strictBindCallApply": true,
    
    // 严格的属性初始化
    "strictPropertyInitialization": true,
    
    // 不允许隐式 this
    "noImplicitThis": true,
    
    // 始终使用严格模式
    "alwaysStrict": true,
    
    // === 额外的检查选项 ===
    
    // 不允许未使用的局部变量
    "noUnusedLocals": true,
    
    // 不允许未使用的参数
    "noUnusedParameters": true,
    
    // 检查可选链后的使用
    "noUncheckedIndexedAccess": true,
    
    // 不允许隐式返回
    "noImplicitReturns": true,
    
    // 检查 switch 穿透
    "noFallthroughCasesInSwitch": true,
    
    // 检查未使用的标签
    "allowUnusedLabels": false,
    
    // 检查未达到的代码
    "allowUnreachableCode": false,
    
    // 精确的可选属性类型
    "exactOptionalPropertyTypes": true
  }
}
```

## 三、路径映射详解

### 3.1 基础路径映射

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      // @ 映射到 src
      "@/*": ["src/*"],
      
      // 组件目录
      "@components/*": ["src/components/*"],
      
      // 工具目录
      "@utils/*": ["src/utils/*"],
      
      // 多个映射路径
      "app/*": ["src/app/*", "src/fallback/*"]
    }
  }
}
```

### 3.2 使用路径映射

```typescript
// 不使用路径映射
import { Button } from '../../components/Button';
import { formatDate } from '../../../utils/date';

// 使用路径映射
import { Button } from '@components/Button';
import { formatDate } from '@utils/date';
```

## 四、项目引用（Project References）

### 4.1 配置项目引用

```json
// tsconfig.json (根配置)
{
  "files": [],
  "references": [
    { "path": "./packages/core" },
    { "path": "./packages/utils" },
    { "path": "./packages/app" }
  ]
}
```

```json
// packages/core/tsconfig.json
{
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist"
  },
  "include": ["src/**/*"]
}
```

```json
// packages/app/tsconfig.json
{
  "compilerOptions": {
    "composite": true,
    "outDir": "./dist"
  },
  "references": [
    { "path": "../core" },
    { "path": "../utils" }
  ],
  "include": ["src/**/*"]
}
```

### 4.2 增量编译

```json
{
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": "./.tsbuildinfo"
  }
}
```

## 五、不同场景配置

### 5.1 Node.js 项目

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "declaration": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 5.2 React 项目

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "module": "esnext",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "baseUrl": "src",
    "paths": {
      "@/*": ["*"]
    }
  },
  "include": ["src"]
}
```

### 5.3 Vue 3 项目

```json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "esnext",
    "moduleResolution": "node",
    "strict": true,
    "jsx": "preserve",
    "sourceMap": true,
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "lib": ["esnext", "DOM"],
    "types": ["vite/client"],
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"]
}
```

### 5.4 库开发

```json
{
  "compilerOptions": {
    "target": "ES2015",
    "module": "esnext",
    "lib": ["ES2015"],
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

## 六、扩展配置

### 6.1 继承基础配置

```json
// tsconfig.base.json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}

// tsconfig.json
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist"
  }
}
```

### 6.2 多环境配置

```json
// tsconfig.dev.json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "sourceMap": true
  }
}

// tsconfig.prod.json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "removeComments": true,
    "sourceMap": false
  }
}
```

## 七、常见问题

### 7.1 路径别名不生效

**问题：** 配置了 paths 但是无法解析

**解决：**
```json
{
  "compilerOptions": {
    "baseUrl": ".", // 必须设置 baseUrl
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### 7.2 无法导入 JSON 文件

**解决：**
```json
{
  "compilerOptions": {
    "resolveJsonModule": true,
    "esModuleInterop": true
  }
}
```

### 7.3 装饰器报错

**解决：**
```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

## 八、面试高频问题

### Q1: tsconfig.json 的作用？

**答案：**
tsconfig.json 是 TypeScript 项目的配置文件，用于：
1. 指定编译选项
2. 指定要编译的文件
3. 配置项目引用
4. 设置编译器行为

### Q2: strict 模式包含哪些选项？

**答案：**
```json
{
  "strict": true
}
```
等同于：
- noImplicitAny
- strictNullChecks
- strictFunctionTypes
- strictBindCallApply
- strictPropertyInitialization
- noImplicitThis
- alwaysStrict

### Q3: 如何配置路径别名？

**答案：**
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```
注意：需要配合构建工具（如 webpack、vite）使用。

## 九、最佳实践

### 9.1 推荐配置

1. **开启严格模式**：`"strict": true`
2. **启用 ESM 互操作**：`"esModuleInterop": true`
3. **跳过库检查**：`"skipLibCheck": true`
4. **强制文件名大小写一致**：`"forceConsistentCasingInFileNames": true`
5. **生成声明文件**：`"declaration": true`（库项目）

### 9.2 性能优化

```json
{
  "compilerOptions": {
    "skipLibCheck": true,
    "incremental": true,
    "isolatedModules": true
  },
  "exclude": [
    "node_modules",
    "dist",
    "**/*.spec.ts"
  ]
}
```

## 十、总结

### 核心要点

- **compilerOptions**：编译器选项
- **include/exclude**：指定编译文件
- **extends**：继承配置
- **references**：项目引用

### 学习建议

1. 从推荐配置开始
2. 根据项目类型调整
3. 理解各选项含义
4. 使用严格模式

---

**相关文章：**
- [TypeScript基础入门](./01-basics.md)
- [模块与命名空间](./06-module-namespace.md)
- [React与TypeScript](./10-react-typescript.md)
