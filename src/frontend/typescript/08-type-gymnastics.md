---
title: 类型体操
date: 2025-10-22
icon: logos:typescript-icon
category:
  - TypeScript
tag:
  - 类型体操
  - 高级技巧
  - 类型编程
---

# 类型体操

类型体操是指通过TypeScript的类型系统进行复杂的类型操作和转换。

## 一、内置工具类型实现

### 1.1 实现Partial

```typescript
// 将所有属性变为可选
type MyPartial<T> = {
  [P in keyof T]?: T[P];
};

interface User {
  name: string;
  age: number;
}

type PartialUser = MyPartial<User>;
// { name?: string; age?: number }
```

### 1.2 实现Required

```typescript
// 将所有属性变为必选
type MyRequired<T> = {
  [P in keyof T]-?: T[P];
};
```

### 1.3 实现Readonly

```typescript
// 将所有属性变为只读
type MyReadonly<T> = {
  readonly [P in keyof T]: T[P];
};
```

### 1.4 实现Pick

```typescript
// 从T中选取K指定的属性
type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
};

type UserPreview = MyPick<User, 'name'>;
// { name: string }
```

### 1.5 实现Omit

```typescript
// 从T中排除K指定的属性
type MyOmit<T, K extends keyof T> = {
  [P in Exclude<keyof T, K>]: T[P];
};

type UserWithoutAge = MyOmit<User, 'age'>;
// { name: string }
```

### 1.6 实现Record

```typescript
// 构造一个对象类型，键为K，值为T
type MyRecord<K extends keyof any, T> = {
  [P in K]: T;
};

type PageInfo = MyRecord<'home' | 'about', { title: string }>;
// { home: { title: string }; about: { title: string } }
```

### 1.7 实现Exclude

```typescript
// 从T中排除可以赋值给U的类型
type MyExclude<T, U> = T extends U ? never : T;

type T0 = MyExclude<'a' | 'b' | 'c', 'a'>;
// 'b' | 'c'
```

### 1.8 实现Extract

```typescript
// 从T中提取可以赋值给U的类型
type MyExtract<T, U> = T extends U ? T : never;

type T1 = MyExtract<'a' | 'b' | 'c', 'a' | 'f'>;
// 'a'
```

### 1.9 实现ReturnType

```typescript
// 获取函数返回值类型
type MyReturnType<T extends (...args: any) => any> = 
  T extends (...args: any) => infer R ? R : never;

function foo(): string {
  return 'hello';
}

type FooReturn = MyReturnType<typeof foo>; // string
```

### 1.10 实现Parameters

```typescript
// 获取函数参数类型
type MyParameters<T extends (...args: any) => any> = 
  T extends (...args: infer P) => any ? P : never;

function bar(a: number, b: string): void {}

type BarParams = MyParameters<typeof bar>;
// [number, string]
```

## 二、高级类型操作

### 2.1 深度只读

```typescript
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? DeepReadonly<T[P]>
    : T[P];
};

interface Config {
  server: {
    host: string;
    port: number;
  };
}

type ReadonlyConfig = DeepReadonly<Config>;
// { readonly server: { readonly host: string; readonly port: number } }
```

### 2.2 深度可选

```typescript
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object
    ? DeepPartial<T[P]>
    : T[P];
};
```

### 2.3 深度必选

```typescript
type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object
    ? DeepRequired<T[P]>
    : T[P];
};
```

## 三、字符串操作

### 3.1 字符串大小写

```typescript
// 首字母大写
type MyCapitalize<S extends string> = S extends `${infer First}${infer Rest}`
  ? `${Uppercase<First>}${Rest}`
  : S;

type Cap = MyCapitalize<"hello">; // "Hello"

// 首字母小写
type MyUncapitalize<S extends string> = S extends `${infer First}${infer Rest}`
  ? `${Lowercase<First>}${Rest}`
  : S;
```

### 3.2 字符串拼接

```typescript
type Join<T extends string[], D extends string> = 
  T extends [infer F extends string, ...infer R extends string[]]
    ? R extends []
      ? F
      : `${F}${D}${Join<R, D>}`
    : '';

type Result = Join<['a', 'b', 'c'], '-'>;
// 'a-b-c'
```

### 3.3 字符串替换

```typescript
type Replace<
  S extends string,
  From extends string,
  To extends string
> = From extends ''
  ? S
  : S extends `${infer L}${From}${infer R}`
    ? `${L}${To}${R}`
    : S;

type Replaced = Replace<'hello world', 'world', 'typescript'>;
// 'hello typescript'
```

### 3.4 字符串分割

```typescript
type Split<S extends string, D extends string> =
  S extends `${infer T}${D}${infer U}`
    ? [T, ...Split<U, D>]
    : [S];

type Words = Split<'a-b-c', '-'>;
// ['a', 'b', 'c']
```

## 四、数组/元组操作

### 4.1 元组转联合

```typescript
type TupleToUnion<T extends any[]> = T[number];

type Union = TupleToUnion<[string, number, boolean]>;
// string | number | boolean
```

### 4.2 联合转元组

```typescript
type UnionToIntersection<U> = 
  (U extends any ? (k: U) => void : never) extends ((k: infer I) => void)
    ? I
    : never;

type LastOf<T> =
  UnionToIntersection<T extends any ? () => T : never> extends () => (infer R)
    ? R
    : never;

type UnionToTuple<T, L = LastOf<T>> = 
  [L] extends [never]
    ? []
    : [...UnionToTuple<Exclude<T, L>>, L];
```

### 4.3 数组扁平化

```typescript
type Flatten<T extends any[]> = 
  T extends [infer F, ...infer R]
    ? F extends any[]
      ? [...Flatten<F>, ...Flatten<R>]
      : [F, ...Flatten<R>]
    : [];

type Flat = Flatten<[1, [2, [3, 4]], 5]>;
// [1, 2, 3, 4, 5]
```

### 4.4 数组去重

```typescript
type Includes<T extends any[], U> = 
  T extends [infer F, ...infer R]
    ? Equal<F, U> extends true
      ? true
      : Includes<R, U>
    : false;

type Unique<T extends any[], U extends any[] = []> = 
  T extends [infer F, ...infer R]
    ? Includes<U, F> extends true
      ? Unique<R, U>
      : Unique<R, [...U, F]>
    : U;
```

## 五、条件类型高级应用

### 5.1 类型判断

```typescript
// 判断两个类型是否相等
type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends
  (<T>() => T extends Y ? 1 : 2) ? true : false;

// 判断是否为any
type IsAny<T> = 0 extends (1 & T) ? true : false;

// 判断是否为never
type IsNever<T> = [T] extends [never] ? true : false;

// 判断是否为联合类型
type IsUnion<T, U = T> = 
  T extends U
    ? [U] extends [T]
      ? false
      : true
    : false;
```

### 5.2 获取函数this类型

```typescript
type ThisParameterType<T> = 
  T extends (this: infer U, ...args: any[]) => any
    ? U
    : unknown;

function toHex(this: Number) {
  return this.toString(16);
}

type T = ThisParameterType<typeof toHex>; // Number
```

## 六、实战挑战

### 6.1 Promise包裹类型

```typescript
type Awaited<T> = 
  T extends Promise<infer U>
    ? Awaited<U>
    : T;

type T0 = Awaited<Promise<string>>;
// string

type T1 = Awaited<Promise<Promise<number>>>;
// number
```

### 6.2 获取对象所有值类型

```typescript
type ValueOf<T> = T[keyof T];

interface Person {
  name: string;
  age: number;
  married: boolean;
}

type PersonValues = ValueOf<Person>;
// string | number | boolean
```

### 6.3 Merge两个类型

```typescript
type Merge<F, S> = {
  [K in keyof F | keyof S]: K extends keyof S
    ? S[K]
    : K extends keyof F
      ? F[K]
      : never;
};

type Foo = { a: number; b: string };
type Bar = { b: number; c: boolean };

type Result = Merge<Foo, Bar>;
// { a: number; b: number; c: boolean }
```

### 6.4 路径字符串转类型

```typescript
type PathValue<T, P extends string> = 
  P extends `${infer K}.${infer R}`
    ? K extends keyof T
      ? PathValue<T[K], R>
      : never
    : P extends keyof T
      ? T[P]
      : never;

interface Data {
  user: {
    profile: {
      name: string;
    };
  };
}

type Name = PathValue<Data, 'user.profile.name'>;
// string
```

## 七、面试高频问题

### Q1: 什么是协变和逆变？

**答案：**
```typescript
// 协变：子类型可以赋值给父类型
interface Animal { name: string; }
interface Dog extends Animal { breed: string; }

let animals: Animal[] = [];
let dogs: Dog[] = [];
animals = dogs; // OK (协变)

// 逆变：父类型可以赋值给子类型（函数参数）
type AnimalFunc = (animal: Animal) => void;
type DogFunc = (dog: Dog) => void;

let f1: DogFunc;
let f2: AnimalFunc;
f1 = f2; // OK (逆变)
```

### Q2: infer关键字的作用？

**答案：**
infer用于在条件类型中推断类型变量。

```typescript
// 推断数组元素类型
type Unpacked<T> = 
  T extends (infer U)[] ? U :
  T extends (...args: any[]) => infer U ? U :
  T extends Promise<infer U> ? U :
  T;
```

### Q3: 如何实现递归类型？

**答案：**
```typescript
type JSONValue = 
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue };
```

## 八、总结

### 核心要点

- **映射类型**：遍历键创建新类型
- **条件类型**：根据条件选择类型
- **infer关键字**：类型推断
- **递归类型**：类型自引用

### 学习建议

1. 掌握基础工具类型实现
2. 理解类型分布式特性
3. 练习type-challenges
4. 应用到实际项目

---

**相关文章：**
- [装饰器](./07-decorator.md)
- [高级类型](./05-advanced-types.md)
- [函数与泛型](./04-function-generic.md)
