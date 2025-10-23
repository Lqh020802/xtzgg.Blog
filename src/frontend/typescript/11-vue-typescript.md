---
title: Vue与TypeScript
date: 2025-10-22
icon: logos:vue
category:
  - TypeScript
  - Vue
tag:
  - Vue3
  - TypeScript
  - Composition API
  - 响应式
---

# Vue与TypeScript

## 一、组件定义

### 1.1 defineComponent

```typescript
import { defineComponent, ref, PropType } from 'vue';

interface User {
  id: number;
  name: string;
}

export default defineComponent({
  name: 'UserCard',
  props: {
    user: {
      type: Object as PropType<User>,
      required: true
    },
    title: {
      type: String,
      default: 'User Info'
    },
    count: {
      type: Number,
      validator: (val: number) => val > 0
    }
  },
  emits: {
    update: (id: number) => typeof id === 'number',
    delete: (id: number) => true
  },
  setup(props, { emit }) {
    const handleUpdate = () => {
      emit('update', props.user.id);
    };
    
    return {
      handleUpdate
    };
  }
});
```

### 1.2 SFC Script Setup

```vue
<script setup lang="ts">
import { ref, computed } from 'vue';

interface Props {
  title: string;
  count?: number;
}

// 定义 Props
const props = withDefaults(defineProps<Props>(), {
  count: 0
});

// 定义 Emits
const emit = defineEmits<{
  (e: 'update', id: number): void;
  (e: 'delete', id: number): void;
}>();

// 响应式数据
const message = ref<string>('Hello');
const count = ref<number>(0);

// 计算属性
const doubleCount = computed(() => count.value * 2);

// 方法
const increment = () => {
  count.value++;
  emit('update', count.value);
};
</script>
```

## 二、Composition API 类型

### 2.1 ref 和 reactive

```typescript
import { ref, reactive, Ref, UnwrapRef } from 'vue';

// ref - 基础类型
const count = ref<number>(0);
const message = ref<string>('Hello');

// ref - 对象类型
interface User {
  id: number;
  name: string;
  email: string;
}

const user = ref<User>({
  id: 1,
  name: 'John',
  email: 'john@example.com'
});

// ref - 可能为 null
const userData = ref<User | null>(null);

// reactive - 对象
const state = reactive<{
  count: number;
  user: User | null;
  loading: boolean;
}>({
  count: 0,
  user: null,
  loading: false
});

// reactive - 数组
const users = reactive<User[]>([]);
```

### 2.2 computed

```typescript
import { ref, computed, ComputedRef } from 'vue';

const firstName = ref('John');
const lastName = ref('Doe');

// 只读计算属性
const fullName = computed(() => `${firstName.value} ${lastName.value}`);

// 显式类型
const fullName2: ComputedRef<string> = computed(() => 
  `${firstName.value} ${lastName.value}`
);

// 可写计算属性
const fullName3 = computed({
  get(): string {
    return `${firstName.value} ${lastName.value}`;
  },
  set(value: string) {
    const parts = value.split(' ');
    firstName.value = parts[0];
    lastName.value = parts[1];
  }
});
```

### 2.3 watch 和 watchEffect

```typescript
import { ref, watch, watchEffect, WatchStopHandle } from 'vue';

const count = ref(0);
const user = ref<User | null>(null);

// watch 单个源
watch(count, (newVal, oldVal) => {
  console.log(`Count changed from ${oldVal} to ${newVal}`);
});

// watch 多个源
watch([count, user], ([newCount, newUser], [oldCount, oldUser]) => {
  console.log('Multiple values changed');
});

// watch 带选项
watch(
  () => user.value?.name,
  (newName) => {
    console.log('User name:', newName);
  },
  { immediate: true, deep: true }
);

// watchEffect
watchEffect(() => {
  console.log('Count:', count.value);
});

// 停止监听
const stop: WatchStopHandle = watchEffect(() => {
  console.log(count.value);
});

// 手动停止
stop();
```

### 2.4 自定义组合式函数

```typescript
import { ref, Ref, onMounted, onUnmounted } from 'vue';

// 鼠标位置追踪
export function useMouse() {
  const x = ref(0);
  const y = ref(0);
  
  function update(event: MouseEvent) {
    x.value = event.pageX;
    y.value = event.pageY;
  }
  
  onMounted(() => window.addEventListener('mousemove', update));
  onUnmounted(() => window.removeEventListener('mousemove', update));
  
  return { x, y };
}

// 通用 Fetch Hook
interface UseFetchOptions {
  immediate?: boolean;
}

interface UseFetchReturn<T> {
  data: Ref<T | null>;
  error: Ref<Error | null>;
  loading: Ref<boolean>;
  execute: () => Promise<void>;
}

export function useFetch<T>(
  url: string,
  options: UseFetchOptions = {}
): UseFetchReturn<T> {
  const data = ref<T | null>(null);
  const error = ref<Error | null>(null);
  const loading = ref(false);
  
  async function execute() {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await fetch(url);
      data.value = await response.json();
    } catch (e) {
      error.value = e as Error;
    } finally {
      loading.value = false;
    }
  }
  
  if (options.immediate) {
    execute();
  }
  
  return { data, error, loading, execute };
}

// 使用
const { data, loading, error } = useFetch<User[]>('/api/users', {
  immediate: true
});
```

## 三、组件通信类型

### 3.1 Props 验证

```typescript
import { PropType } from 'vue';

interface User {
  id: number;
  name: string;
}

export default defineComponent({
  props: {
    // 基础类型
    title: String,
    count: Number,
    isActive: Boolean,
    
    // 多种类型
    value: [String, Number],
    
    // 对象类型
    user: {
      type: Object as PropType<User>,
      required: true
    },
    
    // 数组类型
    users: {
      type: Array as PropType<User[]>,
      default: () => []
    },
    
    // 函数类型
    callback: {
      type: Function as PropType<(id: number) => void>,
      required: true
    },
    
    // 带验证器
    age: {
      type: Number,
      validator: (value: number) => value >= 0 && value <= 150
    }
  }
});
```

### 3.2 Emits 类型

```typescript
// Options API
export default defineComponent({
  emits: {
    submit: (payload: { name: string; email: string }) => {
      return payload.name.length > 0;
    },
    update: (id: number, value: string) => true,
    delete: null
  },
  setup(props, { emit }) {
    const handleSubmit = () => {
      emit('submit', { name: 'John', email: 'john@example.com' });
    };
    
    return { handleSubmit };
  }
});

// Script Setup
const emit = defineEmits<{
  (e: 'submit', payload: { name: string; email: string }): void;
  (e: 'update', id: number, value: string): void;
  (e: 'delete', id: number): void;
}>();

emit('submit', { name: 'John', email: 'john@example.com' });
```

### 3.3 Provide / Inject

```typescript
import { provide, inject, InjectionKey, Ref } from 'vue';

// 定义注入键
interface UserInfo {
  id: number;
  name: string;
}

const userKey: InjectionKey<Ref<UserInfo>> = Symbol('user');

// Provider 组件
export default defineComponent({
  setup() {
    const user = ref<UserInfo>({
      id: 1,
      name: 'John'
    });
    
    provide(userKey, user);
  }
});

// Inject 组件
export default defineComponent({
  setup() {
    const user = inject(userKey);
    
    if (!user) {
      throw new Error('User not provided');
    }
    
    return { user };
  }
});

// 带默认值
const user = inject(userKey, ref({ id: 0, name: 'Guest' }));
```

## 四、Vue Router 类型

### 4.1 路由配置

```typescript
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

// 定义路由元信息类型
declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean;
    roles?: string[];
    title?: string;
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: {
      title: 'Home'
    }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/Admin.vue'),
    meta: {
      requiresAuth: true,
      roles: ['admin']
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
```

### 4.2 路由导航

```typescript
import { useRouter, useRoute } from 'vue-router';

export default defineComponent({
  setup() {
    const router = useRouter();
    const route = useRoute();
    
    // 编程式导航
    const goToUser = (id: number) => {
      router.push({
        name: 'User',
        params: { id: id.toString() }
      });
    };
    
    // 获取路由参数
    const userId = computed(() => Number(route.params.id));
    
    // 获取查询参数
    const page = computed(() => Number(route.query.page) || 1);
    
    return {
      goToUser,
      userId,
      page
    };
  }
});
```

## 五、Pinia 状态管理

### 5.1 Store 定义

```typescript
import { defineStore } from 'pinia';

interface User {
  id: number;
  name: string;
  email: string;
}

interface UserState {
  users: User[];
  loading: boolean;
  error: string | null;
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    users: [],
    loading: false,
    error: null
  }),
  
  getters: {
    userCount(): number {
      return this.users.length;
    },
    
    getUserById: (state) => (id: number): User | undefined => {
      return state.users.find(user => user.id === id);
    }
  },
  
  actions: {
    async fetchUsers() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await fetch('/api/users');
        this.users = await response.json();
      } catch (error) {
        this.error = (error as Error).message;
      } finally {
        this.loading = false;
      }
    },
    
    addUser(user: User) {
      this.users.push(user);
    },
    
    removeUser(id: number) {
      const index = this.users.findIndex(u => u.id === id);
      if (index > -1) {
        this.users.splice(index, 1);
      }
    }
  }
});
```

### 5.2 Setup Store

```typescript
import { ref, computed } from 'vue';
import { defineStore } from 'pinia';

export const useCounterStore = defineStore('counter', () => {
  // State
  const count = ref(0);
  const name = ref('Counter');
  
  // Getters
  const doubleCount = computed(() => count.value * 2);
  
  // Actions
  function increment() {
    count.value++;
  }
  
  function reset() {
    count.value = 0;
  }
  
  return {
    count,
    name,
    doubleCount,
    increment,
    reset
  };
});
```

### 5.3 使用 Store

```typescript
import { useUserStore } from '@/stores/user';

export default defineComponent({
  setup() {
    const userStore = useUserStore();
    
    // 访问 state
    const users = computed(() => userStore.users);
    
    // 访问 getters
    const count = computed(() => userStore.userCount);
    
    // 调用 actions
    onMounted(() => {
      userStore.fetchUsers();
    });
    
    return {
      users,
      count
    };
  }
});
```

## 六、实战示例

### 6.1 表单组件

```vue
<script setup lang="ts">
import { ref, reactive } from 'vue';

interface FormData {
  username: string;
  email: string;
  password: string;
}

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
}

const formData = reactive<FormData>({
  username: '',
  email: '',
  password: ''
});

const errors = reactive<FormErrors>({});
const loading = ref(false);

const validate = (): boolean => {
  // 清空错误
  Object.keys(errors).forEach(key => {
    delete errors[key as keyof FormErrors];
  });
  
  if (!formData.username) {
    errors.username = 'Username is required';
  }
  
  if (!formData.email) {
    errors.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    errors.email = 'Email is invalid';
  }
  
  if (!formData.password) {
    errors.password = 'Password is required';
  } else if (formData.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }
  
  return Object.keys(errors).length === 0;
};

const handleSubmit = async () => {
  if (!validate()) return;
  
  loading.value = true;
  
  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    const data = await response.json();
    console.log('Success:', data);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <div>
      <input v-model="formData.username" type="text" />
      <span v-if="errors.username">{{ errors.username }}</span>
    </div>
    
    <div>
      <input v-model="formData.email" type="email" />
      <span v-if="errors.email">{{ errors.email }}</span>
    </div>
    
    <div>
      <input v-model="formData.password" type="password" />
      <span v-if="errors.password">{{ errors.password }}</span>
    </div>
    
    <button type="submit" :disabled="loading">
      {{ loading ? 'Submitting...' : 'Submit' }}
    </button>
  </form>
</template>
```

### 6.2 列表组件

```vue
<script setup lang="ts" generic="T extends { id: number }">
import { computed } from 'vue';

interface Props<T> {
  items: T[];
  loading?: boolean;
}

const props = withDefaults(defineProps<Props<T>>(), {
  loading: false
});

const emit = defineEmits<{
  (e: 'select', item: T): void;
  (e: 'delete', id: number): void;
}>();

const itemCount = computed(() => props.items.length);
</script>

<template>
  <div>
    <p v-if="loading">Loading...</p>
    <p v-else-if="items.length === 0">No items</p>
    <ul v-else>
      <li v-for="item in items" :key="item.id">
        <slot :item="item">
          {{ item }}
        </slot>
        <button @click="emit('select', item)">Select</button>
        <button @click="emit('delete', item.id)">Delete</button>
      </li>
    </ul>
    <p>Total: {{ itemCount }}</p>
  </div>
</template>
```

## 七、面试高频问题

### Q1: Vue 3 中如何正确定义 Props 类型？

**答案：**
```typescript
// 使用 PropType
import { PropType } from 'vue';

props: {
  user: {
    type: Object as PropType<User>,
    required: true
  }
}

// Script Setup
interface Props {
  user: User;
}

defineProps<Props>();
```

### Q2: ref 和 reactive 的区别？

**答案：**
- **ref**：可以存储任何类型，访问值需要 `.value`
- **reactive**：只能存储对象，直接访问属性

```typescript
const count = ref(0);
count.value++; // 需要 .value

const state = reactive({ count: 0 });
state.count++; // 直接访问
```

### Q3: 如何在 TypeScript 中使用 Vuex？

**答案：**
推荐使用 Pinia 替代 Vuex，类型支持更好：
```typescript
export const useStore = defineStore('main', {
  state: (): State => ({ ... }),
  getters: { ... },
  actions: { ... }
});
```

## 八、最佳实践

1. **使用 Script Setup 语法**
2. **为 Props 和 Emits 定义明确类型**
3. **使用 Composition API**
4. **合理使用 ref 和 reactive**
5. **为自定义 Hooks 定义返回类型**
6. **使用 Pinia 进行状态管理**

---

**相关文章：**
- [React与TypeScript](./10-react-typescript.md)
- [Node.js与TypeScript](./12-nodejs-typescript.md)
- [Composition API](./04-function-generic.md)
