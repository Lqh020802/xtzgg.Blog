---
title: Node.js与TypeScript
date: 2025-10-22
icon: logos:nodejs-icon
category:
  - TypeScript
  - Node.js
tag:
  - Node.js
  - TypeScript
  - Express
  - 后端开发
---

# Node.js与TypeScript

## 一、项目初始化

### 1.1 创建项目

```bash
# 初始化项目
mkdir my-node-app
cd my-node-app
npm init -y

# 安装 TypeScript
npm install --save-dev typescript @types/node

# 生成 tsconfig.json
npx tsc --init
```

### 1.2 tsconfig.json 配置

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

### 1.3 package.json 脚本

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "ts-node src/index.ts",
    "watch": "tsc --watch",
    "dev:watch": "nodemon --exec ts-node src/index.ts"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "nodemon": "^3.0.0",
    "ts-node": "^10.9.0",
    "typescript": "^5.0.0"
  }
}
```

## 二、Express 完整应用

### 2.1 基础设置

```typescript
// src/index.ts
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

const app: Express = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(helmet()); // 安全headers
app.use(cors()); // CORS
app.use(morgan('dev')); // 日志
app.use(express.json()); // JSON解析
app.use(express.urlencoded({ extended: true })); // URL编码

// 基础路由
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Hello TypeScript!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
```

### 2.2 类型化路由

```typescript
// src/types/express.ts
import { Request } from 'express';

// 扩展 Request 类型
export interface TypedRequest<T> extends Request {
  body: T;
}

// 扩展参数类型
export interface TypedRequestParams<P, B = any> extends Request {
  params: P;
  body: B;
}

export interface TypedRequestQuery<Q, B = any> extends Request {
  query: Q;
  body: B;
}

// 使用示例
import { Response } from 'express';
import { TypedRequest } from './types/express';

interface CreateUserBody {
  name: string;
  email: string;
  password: string;
}

app.post('/users', (req: TypedRequest<CreateUserBody>, res: Response) => {
  const { name, email, password } = req.body;
  // TypeScript 知道 body 的类型
  res.json({ name, email });
});
```

### 2.3 路由模块化

```typescript
// src/routes/user.routes.ts
import { Router, Request, Response } from 'express';

const router = Router();

interface User {
  id: number;
  name: string;
  email: string;
}

interface GetUserParams {
  id: string;
}

// GET /users
router.get('/', async (req: Request, res: Response) => {
  const users: User[] = [
    { id: 1, name: 'John', email: 'john@example.com' }
  ];
  res.json(users);
});

// GET /users/:id
router.get('/:id', async (
  req: Request<GetUserParams>,
  res: Response
) => {
  const userId = parseInt(req.params.id);
  const user: User = {
    id: userId,
    name: 'John',
    email: 'john@example.com'
  };
  res.json(user);
});

// POST /users
interface CreateUserBody {
  name: string;
  email: string;
}

router.post('/', async (
  req: Request<{}, {}, CreateUserBody>,
  res: Response
) => {
  const { name, email } = req.body;
  const newUser: User = {
    id: Date.now(),
    name,
    email
  };
  res.status(201).json(newUser);
});

export default router;
```

## 三、中间件类型

### 3.1 自定义中间件

```typescript
import { Request, Response, NextFunction } from 'express';

// 日志中间件
export const logger = (req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.path}`);
  next();
};

// 认证中间件
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        role: string;
      };
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }
    
    // 验证 token（示例）
    req.user = {
      id: 1,
      email: 'user@example.com',
      role: 'user'
    };
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// 权限检查中间件
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }
    
    next();
  };
};

// 使用中间件
app.use(logger);
app.use('/admin', authenticate, authorize('admin'));
```

### 3.2 错误处理中间件

```typescript
// src/middleware/error.middleware.ts
import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message
    });
    return;
  }
  
  console.error('ERROR:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
};

// 404 处理
export const notFound = (req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
};

// 使用
app.use(notFound);
app.use(errorHandler);
```

## 四、数据库集成

### 4.1 MongoDB with Mongoose

```typescript
// src/models/User.model.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.model<IUser>('User', UserSchema);

// 使用
import { User, IUser } from './models/User.model';

async function createUser(data: Partial<IUser>) {
  const user = new User(data);
  await user.save();
  return user;
}

async function findUserByEmail(email: string): Promise<IUser | null> {
  return User.findOne({ email });
}
```

### 4.2 TypeORM

```typescript
// src/entity/User.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column({ type: 'varchar', length: 255 })
  name: string;
  
  @Column({ type: 'varchar', unique: true })
  email: string;
  
  @Column({ type: 'varchar' })
  password: string;
  
  @CreateDateColumn()
  createdAt: Date;
}

// 使用
import { getRepository } from 'typeorm';
import { User } from './entity/User.entity';

async function createUser(name: string, email: string, password: string) {
  const userRepository = getRepository(User);
  const user = userRepository.create({ name, email, password });
  await userRepository.save(user);
  return user;
}
```

## 五、服务层架构

### 5.1 控制器

```typescript
// src/controllers/user.controller.ts
import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { AppError } from '../middleware/error.middleware';

export class UserController {
  private userService: UserService;
  
  constructor() {
    this.userService = new UserService();
  }
  
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await this.userService.findAll();
      res.json(users);
    } catch (error) {
      next(error);
    }
  }
  
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const user = await this.userService.findById(id);
      
      if (!user) {
        throw new AppError(404, 'User not found');
      }
      
      res.json(user);
    } catch (error) {
      next(error);
    }
  }
  
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await this.userService.create(req.body);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }
}
```

### 5.2 服务层

```typescript
// src/services/user.service.ts
interface User {
  id: number;
  name: string;
  email: string;
}

interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
}

export class UserService {
  private users: User[] = [];
  
  async findAll(): Promise<User[]> {
    return this.users;
  }
  
  async findById(id: number): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }
  
  async findByEmail(email: string): Promise<User | undefined> {
    return this.users.find(user => user.email === email);
  }
  
  async create(data: CreateUserDTO): Promise<User> {
    const user: User = {
      id: Date.now(),
      name: data.name,
      email: data.email
    };
    
    this.users.push(user);
    return user;
  }
  
  async update(id: number, data: Partial<User>): Promise<User | null> {
    const index = this.users.findIndex(u => u.id === id);
    
    if (index === -1) {
      return null;
    }
    
    this.users[index] = { ...this.users[index], ...data };
    return this.users[index];
  }
  
  async delete(id: number): Promise<boolean> {
    const index = this.users.findIndex(u => u.id === id);
    
    if (index === -1) {
      return false;
    }
    
    this.users.splice(index, 1);
    return true;
  }
}
```

## 六、API 响应规范

### 6.1 统一响应格式

```typescript
// src/utils/response.util.ts
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export class ResponseUtil {
  static success<T>(data: T, message?: string): ApiResponse<T> {
    return {
      success: true,
      data,
      message
    };
  }
  
  static error(error: string, message?: string): ApiResponse {
    return {
      success: false,
      error,
      message
    };
  }
}

// 使用
import { Response } from 'express';
import { ResponseUtil } from '../utils/response.util';

res.json(ResponseUtil.success(users, 'Users retrieved successfully'));
res.status(400).json(ResponseUtil.error('Validation failed'));
```

### 6.2 分页响应

```typescript
export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function paginate<T>(
  data: T[],
  page: number = 1,
  limit: number = 10
): PaginatedResponse<T> {
  const total = data.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const end = start + limit;
  
  return {
    data: data.slice(start, end),
    page,
    limit,
    total,
    totalPages
  };
}
```

## 七、环境变量和配置

### 7.1 环境变量类型

```typescript
// src/config/env.ts
import { config } from 'dotenv';

config();

interface Config {
  port: number;
  nodeEnv: string;
  dbUrl: string;
  jwtSecret: string;
}

export const ENV: Config = {
  port: parseInt(process.env.PORT || '3000'),
  nodeEnv: process.env.NODE_ENV || 'development',
  dbUrl: process.env.DB_URL || 'mongodb://localhost:27017/mydb',
  jwtSecret: process.env.JWT_SECRET || 'secret'
};

// 验证环境变量
function validateEnv() {
  const required = ['JWT_SECRET', 'DB_URL'];
  
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }
}

validateEnv();
```

## 八、测试

### 8.1 单元测试

```typescript
// src/services/__tests__/user.service.test.ts
import { UserService } from '../user.service';

describe('UserService', () => {
  let userService: UserService;
  
  beforeEach(() => {
    userService = new UserService();
  });
  
  describe('create', () => {
    it('should create a new user', async () => {
      const userData = {
        name: 'John',
        email: 'john@example.com',
        password: 'password123'
      };
      
      const user = await userService.create(userData);
      
      expect(user).toHaveProperty('id');
      expect(user.name).toBe(userData.name);
      expect(user.email).toBe(userData.email);
    });
  });
  
  describe('findById', () => {
    it('should return user if exists', async () => {
      const created = await userService.create({
        name: 'John',
        email: 'john@example.com',
        password: 'password123'
      });
      
      const found = await userService.findById(created.id);
      
      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
    });
    
    it('should return undefined if user does not exist', async () => {
      const found = await userService.findById(999);
      expect(found).toBeUndefined();
    });
  });
});
```

## 九、面试高频问题

### Q1: 如何在 Express 中正确类型化路由参数？

**答案：**
```typescript
import { Request, Response } from 'express';

interface RouteParams {
  id: string;
}

interface RequestBody {
  name: string;
}

interface QueryParams {
  page?: string;
}

app.get('/users/:id', (
  req: Request<RouteParams, {}, {}, QueryParams>,
  res: Response
) => {
  const id = req.params.id;      // string
  const page = req.query.page;   // string | undefined
});
```

### Q2: 如何扩展 Express Request 类型？

**答案：**
```typescript
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
      };
    }
  }
}
```

### Q3: async/await 错误处理最佳实践？

**答案：**
```typescript
// 包装异步路由处理器
type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

const asyncHandler = (fn: AsyncHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 使用
app.get('/users', asyncHandler(async (req, res) => {
  const users = await userService.findAll();
  res.json(users);
}));
```

## 十、最佳实践

1. **使用严格模式**
2. **定义明确的接口**
3. **分层架构（Controller-Service-Repository）**
4. **统一错误处理**
5. **环境变量类型化**
6. **编写单元测试**
7. **使用 ESLint 和 Prettier**

---

**相关文章：**
- [Vue与TypeScript](./11-vue-typescript.md)
- [tsconfig配置详解](./09-tsconfig.md)
- [TypeScript基础入门](./01-basics.md)
