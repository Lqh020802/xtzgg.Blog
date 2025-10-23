---
title: 高级类型
date: 2025-10-22
icon: logos:typescript-icon
category:
  - TypeScript
tag:
  - 高级类型
  - 映射类型
  - 条件类型
---

# 高级类型

## 一、联合类型与交叉类型

### 1.1 联合类型

```typescript
type StringOrNumber = string | number;

function format(value: StringOrNumber): string {
  if (typeof value === 'string') {
    return value.toUpperCase();
  }
  return value.toString();
}
```

### 1.2 交叉类型

```typescript
interface Colorful {
  color: string;
}

interface Circle {
  radius: number;
}

type ColorfulCircle = Colorful & Circle;

const cc: ColorfulCircle = {
  color: 'red',
  radius: 10
};
```

## 二、类型守卫

### 2.1 typeof守卫

```typescript
function padLeft(value: string, padding: string | number) {
  if (typeof padding === "number") {
    return Array(padding + 1).join(" ") + value;
  }
  return padding + value;
}
```

### 2.2 instanceof守卫

```typescript
class Bird {
  fly() {
    console.log("flying");
  }
}

class Fish {
  swim() {
    console.log("swimming");
  }
}

function move(animal: Bird | Fish) {
  if (animal instanceof Bird) {
    animal.fly();
  } else {
    animal.swim();
  }
}
```

### 2.3 自定义类型守卫

```typescript
interface Fish {
  swim: () => void;
}

interface Bird {
  fly: () => void;
}

function isFish(pet: Fish | Bird): pet is Fish {
  return (pet as Fish).swim !== undefined;
}

function move(pet: Fish | Bird) {
  if (isFish(pet)) {
    pet.swim();
  } else {
    pet.fly();
  }
}
```

## 三、映射类型

### 3.1 Partial

```typescript
interface User {
  name: string;
  age: number;
  email: string;
}

type PartialUser = Partial<User>;
// { name?: string; age?: number; email?: string }
```

### 3.2 Required

```typescript
type RequiredUser = Required<PartialUser>;
// { name: string; age: number; email: string }
```

### 3.3 Readonly

```typescript
type ReadonlyUser = Readonly<User>;
// { readonly name: string; readonly age: number; readonly email: string }
```

### 3.4 Pick

```typescript
type UserPreview = Pick<User, 'name' | 'email'>;
// { name: string; email: string }
```

### 3.5 Omit

```typescript
type UserWithoutEmail = Omit<User, 'email'>;
// { name: string; age: number }
```

## 四、条件类型

```typescript
type IsString<T> = T extends string ? true : false;

type A = IsString<string>; // true
type B = IsString<number>; // false

// 实用示例
type NonNullable<T> = T extends null | undefined ? never : T;

type T1 = NonNullable<string | null>; // string
type T2 = NonNullable<number | undefined>; // number
```

## 五、infer关键字

```typescript
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : any;

function foo(): string {
  return 'hello';
}

type FooReturnType = ReturnType<typeof foo>; // string
```

## 六、工具类型

### 6.1 Record

```typescript
type PageInfo = {
  title: string;
};

type Page = "home" | "about" | "contact";

const pages: Record<Page, PageInfo> = {
  home: { title: "Home" },
  about: { title: "About" },
  contact: { title: "Contact" }
};
```

### 6.2 Exclude与Extract

```typescript
type T0 = Exclude<"a" | "b" | "c", "a">; // "b" | "c"
type T1 = Extract<"a" | "b" | "c", "a" | "f">; // "a"
```

## 七、实战应用

```typescript
// 深度只读
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? DeepReadonly<T[P]>
    : T[P];
};

// 深度可选
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object
    ? DeepPartial<T[P]>
    : T[P];
};

// 函数参数类型
type Parameters<T extends (...args: any) => any> = 
  T extends (...args: infer P) => any ? P : never;
```

---

**相关文章：**
- [函数与泛型](./04-function-generic.md)
- [类型体操](./08-type-gymnastics.md)
