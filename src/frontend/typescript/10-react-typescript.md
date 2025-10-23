---
title: React与TypeScript
date: 2025-10-22
icon: logos:react
category:
  - TypeScript
  - React
tag:
  - React
  - TypeScript
  - Hooks
  - 组件类型
---

# React与TypeScript

## 一、组件类型定义

### 1.1 函数组件

```typescript
import React from 'react';

// 使用 React.FC
interface Props {
  name: string;
  age?: number;
  children?: React.ReactNode;
}

const Greeting: React.FC<Props> = ({ name, age, children }) => {
  return (
    <div>
      <p>Hello {name}, age: {age}</p>
      {children}
    </div>
  );
};

// 不使用 React.FC（推荐）
const Greeting2 = ({ name, age }: Props) => {
  return <div>Hello {name}</div>;
};

// 带返回类型
const Greeting3 = ({ name }: Props): JSX.Element => {
  return <div>Hello {name}</div>;
};
```

### 1.2 类组件

```typescript
interface Props {
  name: string;
}

interface State {
  count: number;
}

class Counter extends React.Component<Props, State> {
  state: State = {
    count: 0
  };
  
  increment = () => {
    this.setState({ count: this.state.count + 1 });
  };
  
  render() {
    return (
      <div>
        <p>{this.props.name}: {this.state.count}</p>
        <button onClick={this.increment}>Increment</button>
      </div>
    );
  }
}
```

### 1.3 Props 类型

```typescript
// 基础 Props
interface BasicProps {
  title: string;
  count: number;
  disabled?: boolean;
}

// 包含 children
interface PropsWithChildren {
  title: string;
  children: React.ReactNode;
}

// 包含事件处理
interface EventProps {
  onClick: () => void;
  onChange: (value: string) => void;
}

// 包含样式
interface StyledProps {
  className?: string;
  style?: React.CSSProperties;
}

// 联合类型 Props
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
}

// 泛型 Props
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}

function List<T>({ items, renderItem }: ListProps<T>) {
  return <ul>{items.map((item, i) => <li key={i}>{renderItem(item)}</li>)}</ul>;
}
```

## 二、Hooks 类型

### 2.1 useState

```typescript
// 基础类型推断
const [count, setCount] = useState(0); // number
const [name, setName] = useState(''); // string

// 显式类型
const [count, setCount] = useState<number>(0);

// 联合类型
const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

// 对象类型
interface User {
  id: number;
  name: string;
  email: string;
}

const [user, setUser] = useState<User | null>(null);

// 数组类型
const [users, setUsers] = useState<User[]>([]);

// 复杂类型
const [state, setState] = useState<{
  loading: boolean;
  data: User[] | null;
  error: string | null;
}>({
  loading: false,
  data: null,
  error: null
});
```

### 2.2 useEffect

```typescript
// 基础用法
useEffect(() => {
  console.log('Component mounted');
}, []);

// 带清理函数
useEffect(() => {
  const timer = setTimeout(() => {
    console.log('Timer');
  }, 1000);
  
  return () => clearTimeout(timer);
}, []);

// 异步操作
useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await fetch('/api/users');
      const data: User[] = await response.json();
      setUsers(data);
    } catch (error) {
      console.error(error);
    }
  };
  
  fetchData();
}, []);

// 依赖项类型
useEffect(() => {
  console.log(count);
}, [count]); // count 必须在依赖数组中
```

### 2.3 useRef

```typescript
// DOM 元素引用
const inputRef = useRef<HTMLInputElement>(null);

useEffect(() => {
  inputRef.current?.focus();
}, []);

<input ref={inputRef} />

// 可变值引用
const countRef = useRef<number>(0);

const increment = () => {
  countRef.current += 1;
};

// 存储任意值
const timerRef = useRef<NodeJS.Timeout | null>(null);

useEffect(() => {
  timerRef.current = setInterval(() => {
    console.log('Tick');
  }, 1000);
  
  return () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };
}, []);
```

### 2.4 useContext

```typescript
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

// Provider
function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// 使用 Context
function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

// 在组件中使用
function ThemedButton() {
  const { theme, toggleTheme } = useTheme();
  return <button onClick={toggleTheme}>{theme}</button>;
}
```

### 2.5 useReducer

```typescript
interface State {
  count: number;
  loading: boolean;
}

type Action =
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'reset'; payload: number }
  | { type: 'setLoading'; payload: boolean };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'increment':
      return { ...state, count: state.count + 1 };
    case 'decrement':
      return { ...state, count: state.count - 1 };
    case 'reset':
      return { ...state, count: action.payload };
    case 'setLoading':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0, loading: false });
  
  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
      <button onClick={() => dispatch({ type: 'reset', payload: 0 })}>Reset</button>
    </div>
  );
}
```

### 2.6 自定义 Hooks

```typescript
// 简单的自定义 Hook
function useCounter(initialValue: number = 0) {
  const [count, setCount] = useState(initialValue);
  
  const increment = () => setCount(c => c + 1);
  const decrement = () => setCount(c => c - 1);
  const reset = () => setCount(initialValue);
  
  return { count, increment, decrement, reset };
}

// 带泛型的自定义 Hook
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });
  
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };
  
  return [storedValue, setValue] as const;
}

// 使用
const [name, setName] = useLocalStorage<string>('name', 'John');
```

## 三、事件处理类型

### 3.1 常见事件类型

```typescript
// 鼠标事件
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  console.log(e.currentTarget);
};

const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
  console.log(e.clientX, e.clientY);
};

// 键盘事件
const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === 'Enter') {
    console.log('Enter pressed');
  }
};

// 表单事件
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setValue(e.target.value);
};

const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  console.log('Form submitted');
};

// 焦点事件
const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
  console.log('Input focused');
};

// 滚动事件
const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
  console.log(e.currentTarget.scrollTop);
};
```

### 3.2 事件处理器类型

```typescript
interface ButtonProps {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  onDoubleClick?: React.MouseEventHandler<HTMLButtonElement>;
}

interface InputProps {
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
}

// 简化写法
type ClickHandler = (event: React.MouseEvent) => void;
type ChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => void;
```

## 四、表单处理

### 4.1 受控组件

```typescript
interface FormData {
  username: string;
  email: string;
  password: string;
}

function LoginForm() {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: ''
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(formData);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        name="username"
        value={formData.username}
        onChange={handleChange}
      />
      <input
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
      />
      <input
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
      />
      <button type="submit">Submit</button>
    </form>
  );
}
```

### 4.2 非受控组件

```typescript
function UncontrolledForm() {
  const usernameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log({
      username: usernameRef.current?.value,
      email: emailRef.current?.value
    });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input ref={usernameRef} />
      <input ref={emailRef} type="email" />
      <button type="submit">Submit</button>
    </form>
  );
}
```

## 五、高级类型应用

### 5.1 泛型组件

```typescript
interface TableProps<T> {
  data: T[];
  columns: {
    key: keyof T;
    header: string;
    render?: (value: T[keyof T], item: T) => React.ReactNode;
  }[];
}

function Table<T extends Record<string, any>>({ data, columns }: TableProps<T>) {
  return (
    <table>
      <thead>
        <tr>
          {columns.map(col => (
            <th key={String(col.key)}>{col.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            {columns.map(col => (
              <td key={String(col.key)}>
                {col.render ? col.render(row[col.key], row) : String(row[col.key])}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### 5.2 Props 扩展

```typescript
// 扩展原生 HTML 属性
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

const Button = ({ variant = 'primary', children, ...props }: ButtonProps) => {
  return (
    <button className={`btn-${variant}`} {...props}>
      {children}
    </button>
  );
};

// 使用
<Button onClick={() => {}} disabled>Click me</Button>
```

## 六、面试高频问题

### Q1: React.FC 还应该使用吗？

**答案：**
不推荐使用 `React.FC`，原因：
1. 隐式包含 `children`，可能不符合预期
2. 泛型支持不够好
3. 不支持默认 props

推荐直接使用函数声明：
```typescript
const Component = ({ name }: Props) => { ... }
```

### Q2: 如何正确类型化事件处理器？

**答案：**
```typescript
// 内联定义
<button onClick={(e: React.MouseEvent<HTMLButtonElement>) => {}}>

// 单独定义
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {};
<button onClick={handleClick}>

// 使用类型别名
type ClickHandler = React.MouseEventHandler<HTMLButtonElement>;
const handleClick: ClickHandler = (e) => {};
```

### Q3: useRef 的类型应该如何定义？

**答案：**
```typescript
// DOM 元素（初始值为 null）
const inputRef = useRef<HTMLInputElement>(null);

// 可变值（初始值不为 null）
const countRef = useRef<number>(0);
```

## 七、最佳实践

1. **优先使用函数组件和 Hooks**
2. **为 Props 定义接口**
3. **合理使用类型推断**
4. **事件处理器明确指定元素类型**
5. **自定义 Hooks 返回 const 断言**
6. **使用泛型提高组件复用性**

---

**相关文章：**
- [tsconfig配置详解](./09-tsconfig.md)
- [Vue与TypeScript](./11-vue-typescript.md)
- [TypeScript基础入门](./01-basics.md)
