---
title: 装饰器
date: 2025-10-22
icon: logos:typescript-icon
category:
  - TypeScript
tag:
  - Decorator
  - 装饰器
  - 元编程
---

# 装饰器

装饰器是一种特殊类型的声明，可以附加到类、方法、访问器、属性或参数上。

**注意：装饰器是实验性特性，需要在tsconfig.json中启用：**

```json
{
  "compilerOptions": {
    "experimentalDecorators": true
  }
}
```

## 一、类装饰器

### 1.1 基本类装饰器

```typescript
function sealed(constructor: Function) {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}

@sealed
class Greeter {
  greeting: string;
  constructor(message: string) {
    this.greeting = message;
  }
  
  greet() {
    return `Hello, ${this.greeting}`;
  }
}
```

### 1.2 装饰器工厂

```typescript
function Component(options: { selector: string; template: string }) {
  return function(constructor: Function) {
    console.log('Component created:', options.selector);
    // 可以修改构造函数
    constructor.prototype.template = options.template;
  };
}

@Component({
  selector: 'app-root',
  template: '<h1>Hello World</h1>'
})
class AppComponent {
  title = 'My App';
}
```

### 1.3 类装饰器修改类

```typescript
function classDecorator<T extends { new(...args: any[]): {} }>(constructor: T) {
  return class extends constructor {
    newProperty = "new property";
    hello = "override";
  };
}

@classDecorator
class Greeter {
  property = "property";
  hello: string;
  
  constructor(m: string) {
    this.hello = m;
  }
}

const greeter = new Greeter("world");
console.log(greeter.hello); // override
```

## 二、方法装饰器

### 2.1 基本方法装饰器

```typescript
function log(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  
  descriptor.value = function(...args: any[]) {
    console.log(`Calling ${propertyKey} with`, args);
    const result = originalMethod.apply(this, args);
    console.log(`Result:`, result);
    return result;
  };
  
  return descriptor;
}

class Calculator {
  @log
  add(a: number, b: number) {
    return a + b;
  }
}

const calc = new Calculator();
calc.add(2, 3);
// Calling add with [2, 3]
// Result: 5
```

### 2.2 性能监控装饰器

```typescript
function measure(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  
  descriptor.value = function(...args: any[]) {
    const start = performance.now();
    const result = originalMethod.apply(this, args);
    const end = performance.now();
    console.log(`${propertyKey} took ${end - start}ms`);
    return result;
  };
  
  return descriptor;
}

class DataProcessor {
  @measure
  processData(data: any[]) {
    // 处理数据
    return data.map(item => item * 2);
  }
}
```

### 2.3 防抖装饰器

```typescript
function debounce(delay: number) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    let timeoutId: NodeJS.Timeout;
    
    descriptor.value = function(...args: any[]) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        originalMethod.apply(this, args);
      }, delay);
    };
    
    return descriptor;
  };
}

class SearchComponent {
  @debounce(300)
  handleSearch(query: string) {
    console.log('Searching for:', query);
  }
}
```

## 三、访问器装饰器

```typescript
function configurable(value: boolean) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    descriptor.configurable = value;
  };
}

class Point {
  private _x: number;
  private _y: number;
  
  constructor(x: number, y: number) {
    this._x = x;
    this._y = y;
  }
  
  @configurable(false)
  get x() {
    return this._x;
  }
  
  @configurable(false)
  get y() {
    return this._y;
  }
}
```

## 四、属性装饰器

### 4.1 基本属性装饰器

```typescript
function format(formatString: string) {
  return function(target: any, propertyKey: string) {
    let value: string;
    
    const getter = function() {
      return value;
    };
    
    const setter = function(newVal: string) {
      value = `${formatString}: ${newVal}`;
    };
    
    Object.defineProperty(target, propertyKey, {
      get: getter,
      set: setter,
      enumerable: true,
      configurable: true
    });
  };
}

class Person {
  @format('Name')
  name: string;
  
  constructor(name: string) {
    this.name = name;
  }
}

const person = new Person('John');
console.log(person.name); // Name: John
```

### 4.2 必填字段装饰器

```typescript
const requiredFields: string[] = [];

function required(target: any, propertyKey: string) {
  requiredFields.push(propertyKey);
}

class User {
  @required
  username: string;
  
  @required
  email: string;
  
  age?: number;
}

function validate(obj: any): boolean {
  return requiredFields.every(field => obj[field] !== undefined);
}
```

## 五、参数装饰器

```typescript
function logParameter(target: any, propertyKey: string, parameterIndex: number) {
  const metadataKey = `log_${propertyKey}_parameters`;
  
  if (Array.isArray(target[metadataKey])) {
    target[metadataKey].push(parameterIndex);
  } else {
    target[metadataKey] = [parameterIndex];
  }
}

class UserService {
  getUser(@logParameter id: number, @logParameter name: string) {
    console.log('Getting user...');
  }
}
```

## 六、装饰器组合

```typescript
function first() {
  console.log("first(): factory evaluated");
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    console.log("first(): called");
  };
}

function second() {
  console.log("second(): factory evaluated");
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    console.log("second(): called");
  };
}

class ExampleClass {
  @first()
  @second()
  method() {}
}

// 输出顺序：
// first(): factory evaluated
// second(): factory evaluated
// second(): called
// first(): called
```

## 七、实战应用

### 7.1 路由装饰器

```typescript
const routeMap = new Map<string, string>();

function Get(path: string) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    routeMap.set(path, propertyKey);
  };
}

class UserController {
  @Get('/users')
  getUsers() {
    return ['user1', 'user2'];
  }
  
  @Get('/users/:id')
  getUser() {
    return { id: 1, name: 'John' };
  }
}
```

### 7.2 权限检查装饰器

```typescript
function authorize(roles: string[]) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function(...args: any[]) {
      const userRole = getCurrentUserRole(); // 获取当前用户角色
      
      if (!roles.includes(userRole)) {
        throw new Error('Unauthorized');
      }
      
      return originalMethod.apply(this, args);
    };
    
    return descriptor;
  };
}

function getCurrentUserRole(): string {
  return 'admin'; // 模拟获取用户角色
}

class AdminController {
  @authorize(['admin'])
  deleteUser(id: number) {
    console.log(`Deleting user ${id}`);
  }
}
```

### 7.3 缓存装饰器

```typescript
function cache(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const cacheMap = new Map<string, any>();
  
  descriptor.value = function(...args: any[]) {
    const key = JSON.stringify(args);
    
    if (cacheMap.has(key)) {
      console.log('Returning cached result');
      return cacheMap.get(key);
    }
    
    const result = originalMethod.apply(this, args);
    cacheMap.set(key, result);
    return result;
  };
  
  return descriptor;
}

class ExpensiveCalculations {
  @cache
  fibonacci(n: number): number {
    if (n <= 1) return n;
    return this.fibonacci(n - 1) + this.fibonacci(n - 2);
  }
}
```

## 八、面试高频问题

### Q1: 装饰器的执行顺序？

**答案：**
1. **实例成员**：参数装饰器 → 方法/访问器/属性装饰器
2. **静态成员**：参数装饰器 → 方法/访问器/属性装饰器
3. **构造函数**：参数装饰器
4. **类装饰器**

多个同类型装饰器：从下到上、从右到左执行。

### Q2: 装饰器的应用场景？

**答案：**
- **日志记录**：方法执行日志
- **性能监控**：测量方法执行时间
- **权限控制**：方法访问权限检查
- **缓存**：方法结果缓存
- **依赖注入**：自动注入依赖
- **路由定义**：定义API路由

### Q3: 如何实现一个重试装饰器？

**答案：**
```typescript
function retry(times: number) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function(...args: any[]) {
      for (let i = 0; i < times; i++) {
        try {
          return await originalMethod.apply(this, args);
        } catch (error) {
          if (i === times - 1) throw error;
          console.log(`Retry ${i + 1}/${times}`);
        }
      }
    };
    
    return descriptor;
  };
}
```

## 九、总结

### 核心要点

- **类装饰器**：修改或替换类定义
- **方法装饰器**：修改方法行为
- **属性装饰器**：处理属性定义
- **参数装饰器**：记录参数元数据

### 最佳实践

1. 使用装饰器工厂提供配置
2. 注意装饰器执行顺序
3. 保持装饰器功能单一
4. 合理组合多个装饰器

---

**相关文章：**
- [模块与命名空间](./06-module-namespace.md)
- [类型体操](./08-type-gymnastics.md)
- [React与TypeScript](./10-react-typescript.md)
