---
title: link与script元素阻塞机制
icon: mdi:block-helper
---

# link与script元素阻塞机制

link元素和script元素在页面加载过程中都可能造成阻塞，但阻塞的类型、程度和影响范围有所不同。理解它们的阻塞机制对于优化页面性能至关重要。

## 1. 阻塞机制概述

### 1.1 阻塞类型对比

```javascript
// 不同元素的阻塞特性
const blockingComparison = {
  script: {
    domParsing: '会阻塞DOM解析',
    rendering: '会阻塞页面渲染',
    execution: '同步执行JavaScript',
    critical: '关键渲染路径阻塞'
  },
  
  link: {
    domParsing: '不阻塞DOM解析',
    rendering: '会阻塞页面渲染',
    execution: '异步加载CSS',
    critical: '关键渲染路径阻塞'
  }
};
```

### 1.2 关键渲染路径

```javascript
// 关键渲染路径中的阻塞点
const criticalRenderingPath = {
  step1: 'HTML解析 → DOM构建',
  step2: 'CSS加载 → CSSOM构建', // link阻塞点
  step3: 'JavaScript执行',        // script阻塞点
  step4: 'DOM + CSSOM → 渲染树',
  step5: '布局 → 绘制 → 合成'
};
```

## 2. script元素的阻塞机制

### 2.1 默认阻塞行为

```html
<!-- 同步script：阻塞DOM解析和渲染 -->
<html>
<head>
  <title>阻塞示例</title>
</head>
<body>
  <h1>页面开始</h1>
  
  <!-- 这里会阻塞后续DOM解析 -->
  <script src="blocking-script.js"></script>
  
  <!-- 这部分内容要等script执行完才能解析 -->
  <h2>页面继续</h2>
</body>
</html>
```

### 2.2 阻塞时间测量

```javascript
// 测量script阻塞时间
function measureScriptBlocking() {
  const startTime = performance.now();
  
  // 模拟阻塞性脚本
  function blockingScript() {
    const blockStart = Date.now();
    while (Date.now() - blockStart < 1000) {
      // 阻塞1秒
    }
  }
  
  blockingScript();
  
  const endTime = performance.now();
  console.log(`Script阻塞时间: ${endTime - startTime}ms`);
}

// 监控DOM解析阻塞
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM解析完成时间:', performance.now());
});
```

### 2.3 script的加载属性

```html
<!-- 不同script加载方式的阻塞行为 -->

<!-- 1. 默认：阻塞DOM解析 -->
<script src="blocking.js"></script>

<!-- 2. async：不阻塞DOM解析，但执行时可能阻塞 -->
<script src="async.js" async></script>

<!-- 3. defer：不阻塞DOM解析，DOMContentLoaded前执行 -->
<script src="defer.js" defer></script>

<!-- 4. 内联脚本：总是阻塞 -->
<script>
  console.log('内联脚本阻塞DOM解析');
</script>
```

## 3. link元素的阻塞机制

### 3.1 CSS阻塞渲染

```html
<!-- CSS阻塞渲染示例 -->
<html>
<head>
  <!-- 这个CSS会阻塞页面渲染 -->
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <!-- 即使DOM解析完成，也要等CSS加载完才能渲染 -->
  <h1>等待CSS加载...</h1>
</body>
</html>
```

### 3.2 CSS加载监控

```javascript
// 监控CSS加载和阻塞
class CSSLoadMonitor {
  constructor() {
    this.cssLoadTimes = new Map();
    this.renderBlockTime = 0;
  }
  
  // 监控CSS加载
  monitorCSSLoad(linkElement) {
    const href = linkElement.href;
    const startTime = performance.now();
    
    linkElement.addEventListener('load', () => {
      const loadTime = performance.now() - startTime;
      this.cssLoadTimes.set(href, loadTime);
      
      console.log(`CSS加载完成: ${href}, 耗时: ${loadTime}ms`);
    });
    
    linkElement.addEventListener('error', () => {
      console.error(`CSS加载失败: ${href}`);
    });
  }
  
  // 测量渲染阻塞时间
  measureRenderBlocking() {
    const startTime = performance.now();
    
    // 等待首次渲染
    requestAnimationFrame(() => {
      this.renderBlockTime = performance.now() - startTime;
      console.log(`渲染阻塞时间: ${this.renderBlockTime}ms`);
    });
  }
}

// 使用示例
const monitor = new CSSLoadMonitor();
document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
  monitor.monitorCSSLoad(link);
});
monitor.measureRenderBlocking();
```

### 3.3 CSS媒体查询优化

```html
<!-- 使用媒体查询减少阻塞 -->

<!-- 总是阻塞渲染 -->
<link rel="stylesheet" href="all.css">

<!-- 只在打印时阻塞 -->
<link rel="stylesheet" href="print.css" media="print">

<!-- 只在小屏幕时阻塞 -->
<link rel="stylesheet" href="mobile.css" media="(max-width: 768px)">

<!-- 异步加载，不阻塞渲染 -->
<link rel="preload" href="non-critical.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
```

## 4. 阻塞性能对比

### 4.1 实际测试对比

```javascript
// 性能测试：script vs link阻塞
class BlockingPerformanceTest {
  constructor() {
    this.results = {
      scriptBlocking: [],
      cssBlocking: [],
      combinedBlocking: []
    };
  }
  
  // 测试script阻塞
  async testScriptBlocking() {
    const startTime = performance.now();
    
    // 创建阻塞性script
    const script = document.createElement('script');
    script.src = 'data:text/javascript;base64,' + btoa(`
      const start = Date.now();
      while (Date.now() - start < 500) {} // 阻塞500ms
    `);
    
    document.head.appendChild(script);
    
    return new Promise(resolve => {
      script.onload = () => {
        const blockingTime = performance.now() - startTime;
        this.results.scriptBlocking.push(blockingTime);
        resolve(blockingTime);
      };
    });
  }
  
  // 测试CSS阻塞
  async testCSSBlocking() {
    const startTime = performance.now();
    
    // 创建大CSS文件（模拟加载延迟）
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'data:text/css;base64,' + btoa(`
      body { background: red; }
      /* 大量CSS规则模拟加载时间 */
    `);
    
    document.head.appendChild(link);
    
    return new Promise(resolve => {
      link.onload = () => {
        const blockingTime = performance.now() - startTime;
        this.results.cssBlocking.push(blockingTime);
        resolve(blockingTime);
      };
    });
  }
  
  // 生成测试报告
  generateReport() {
    const avgScript = this.average(this.results.scriptBlocking);
    const avgCSS = this.average(this.results.cssBlocking);
    
    return {
      scriptAverage: `${avgScript.toFixed(2)}ms`,
      cssAverage: `${avgCSS.toFixed(2)}ms`,
      recommendation: avgScript > avgCSS ? 
        'Script阻塞更严重，优先优化JavaScript' : 
        'CSS阻塞更严重，优先优化样式加载'
    };
  }
  
  average(arr) {
    return arr.reduce((sum, val) => sum + val, 0) / arr.length;
  }
}
```

### 4.2 阻塞影响分析

```javascript
// 分析不同阻塞对用户体验的影响
const blockingImpactAnalysis = {
  scriptBlocking: {
    domParsing: '完全停止DOM解析',
    userInteraction: '无法响应用户操作',
    visualFeedback: '页面显示不完整',
    seoImpact: '影响搜索引擎抓取',
    severity: 'HIGH'
  },
  
  cssBlocking: {
    domParsing: '不影响DOM解析',
    userInteraction: '可以响应部分操作',
    visualFeedback: '页面显示空白或样式错乱',
    seoImpact: '不影响内容抓取',
    severity: 'MEDIUM'
  }
};
```

## 5. 优化策略

### 5.1 script优化策略

```html
<!-- Script优化方案 -->

<!-- 1. 使用async属性 -->
<script src="non-critical.js" async></script>

<!-- 2. 使用defer属性 -->
<script src="init.js" defer></script>

<!-- 3. 动态加载 -->
<script>
function loadScriptAsync(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// 使用示例
loadScriptAsync('analytics.js').then(() => {
  console.log('Analytics脚本加载完成');
});
</script>

<!-- 4. 内联关键脚本 -->
<script>
// 关键的初始化代码直接内联
window.APP_CONFIG = { version: '1.0' };
</script>
```

### 5.2 CSS优化策略

```html
<!-- CSS优化方案 -->

<!-- 1. 内联关键CSS -->
<style>
/* 首屏关键样式直接内联 */
body { margin: 0; font-family: Arial; }
.header { background: #333; color: white; }
</style>

<!-- 2. 异步加载非关键CSS -->
<link rel="preload" href="non-critical.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="non-critical.css"></noscript>

<!-- 3. 使用媒体查询 -->
<link rel="stylesheet" href="print.css" media="print">
<link rel="stylesheet" href="mobile.css" media="(max-width: 768px)">

<!-- 4. 预加载资源 -->
<link rel="preload" href="fonts/main.woff2" as="font" type="font/woff2" crossorigin>
```

### 5.3 综合优化方案

```javascript
// 资源加载优化管理器
class ResourceLoadOptimizer {
  constructor() {
    this.criticalResources = new Set();
    this.nonCriticalResources = new Set();
    this.loadedResources = new Map();
  }
  
  // 标记关键资源
  markCritical(resource) {
    this.criticalResources.add(resource);
  }
  
  // 优化资源加载顺序
  optimizeLoadOrder() {
    // 1. 首先加载关键CSS（内联）
    this.inlineCriticalCSS();
    
    // 2. 异步加载非关键CSS
    this.loadNonCriticalCSS();
    
    // 3. 延迟加载JavaScript
    this.deferJavaScript();
  }
  
  inlineCriticalCSS() {
    const criticalCSS = this.extractCriticalCSS();
    const style = document.createElement('style');
    style.textContent = criticalCSS;
    document.head.appendChild(style);
  }
  
  loadNonCriticalCSS() {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = 'non-critical.css';
    link.as = 'style';
    link.onload = function() {
      this.onload = null;
      this.rel = 'stylesheet';
    };
    document.head.appendChild(link);
  }
  
  deferJavaScript() {
    // 在DOMContentLoaded后加载非关键JS
    document.addEventListener('DOMContentLoaded', () => {
      this.loadNonCriticalJS();
    });
  }
  
  async loadNonCriticalJS() {
    const scripts = ['analytics.js', 'social.js', 'ads.js'];
    
    for (const src of scripts) {
      try {
        await this.loadScript(src);
        console.log(`已加载: ${src}`);
      } catch (error) {
        console.error(`加载失败: ${src}`, error);
      }
    }
  }
  
  loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
}
```

## 6. 性能监控与调试

### 6.1 阻塞检测工具

```javascript
// 阻塞检测和分析工具
class BlockingDetector {
  constructor() {
    this.observer = null;
    this.blockingEvents = [];
  }
  
  start() {
    // 监控资源加载
    this.observer = new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        this.analyzeResourceTiming(entry);
      });
    });
    
    this.observer.observe({ entryTypes: ['resource'] });
    
    // 监控长任务
    this.monitorLongTasks();
  }
  
  analyzeResourceTiming(entry) {
    const isBlocking = this.isBlockingResource(entry);
    
    if (isBlocking) {
      this.blockingEvents.push({
        name: entry.name,
        type: this.getResourceType(entry),
        duration: entry.duration,
        blockingTime: entry.responseEnd - entry.fetchStart,
        timestamp: entry.startTime
      });
      
      console.warn(`检测到阻塞资源: ${entry.name}, 阻塞时间: ${entry.duration}ms`);
    }
  }
  
  isBlockingResource(entry) {
    // CSS和同步JS被认为是阻塞资源
    return entry.initiatorType === 'link' || 
           (entry.initiatorType === 'script' && !entry.name.includes('async'));
  }
  
  getResourceType(entry) {
    if (entry.name.endsWith('.css')) return 'CSS';
    if (entry.name.endsWith('.js')) return 'JavaScript';
    return 'Other';
  }
  
  monitorLongTasks() {
    if ('PerformanceObserver' in window) {
      const longTaskObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          console.warn(`长任务检测: ${entry.duration}ms`);
        });
      });
      
      longTaskObserver.observe({ entryTypes: ['longtask'] });
    }
  }
  
  generateReport() {
    const cssBlocking = this.blockingEvents.filter(e => e.type === 'CSS');
    const jsBlocking = this.blockingEvents.filter(e => e.type === 'JavaScript');
    
    return {
      totalBlockingEvents: this.blockingEvents.length,
      cssBlockingCount: cssBlocking.length,
      jsBlockingCount: jsBlocking.length,
      totalBlockingTime: this.blockingEvents.reduce((sum, e) => sum + e.duration, 0),
      recommendations: this.generateRecommendations()
    };
  }
  
  generateRecommendations() {
    const recommendations = [];
    
    if (this.blockingEvents.length > 5) {
      recommendations.push('阻塞资源过多，考虑异步加载');
    }
    
    const avgBlockingTime = this.blockingEvents.reduce((sum, e) => sum + e.duration, 0) / this.blockingEvents.length;
    if (avgBlockingTime > 100) {
      recommendations.push('平均阻塞时间过长，优化资源大小');
    }
    
    return recommendations;
  }
}
```

### 6.2 Chrome DevTools分析

```javascript
// 使用Chrome DevTools分析阻塞
const devToolsAnalysis = {
  networkPanel: {
    purpose: '查看资源加载瀑布图',
    keyMetrics: [
      'TTFB (Time to First Byte)',
      'Content Download',
      'Blocking Time'
    ],
    tips: [
      '红色表示阻塞资源',
      '查看Initiator列了解资源依赖',
      '使用过滤器分析特定资源类型'
    ]
  },
  
  performancePanel: {
    purpose: '分析主线程阻塞情况',
    keyMetrics: [
      'Parse HTML',
      'Parse Stylesheet', 
      'Evaluate Script'
    ],
    tips: [
      '黄色表示脚本执行',
      '紫色表示样式计算',
      '查看Bottom-Up了解耗时分布'
    ]
  },
  
  lighthouseAudit: {
    purpose: '自动检测阻塞问题',
    keyAudits: [
      'Eliminate render-blocking resources',
      'Reduce unused CSS',
      'Remove unused JavaScript'
    ]
  }
};
```

## 7. 总结

### 阻塞机制对比

**Script元素阻塞：**
- **DOM解析阻塞** - 完全停止HTML解析
- **渲染阻塞** - 阻止页面显示
- **交互阻塞** - 无法响应用户操作
- **影响程度** - 最严重

**Link元素阻塞：**
- **DOM解析** - 不阻塞HTML解析
- **渲染阻塞** - 阻止页面渲染
- **交互影响** - 部分功能可用
- **影响程度** - 中等

### 优化优先级

1. **Script优化** - 使用async/defer，动态加载
2. **CSS优化** - 内联关键样式，异步加载非关键CSS
3. **资源预加载** - 使用preload/prefetch
4. **代码分割** - 按需加载资源
5. **性能监控** - 持续监控和优化

### 最佳实践

- **关键资源内联** - 减少网络请求
- **非关键资源异步** - 避免阻塞渲染
- **合理使用缓存** - 减少重复加载
- **监控性能指标** - 及时发现问题
- **渐进式增强** - 确保基本功能可用

通过理解和优化link与script的阻塞机制，可以显著提升页面加载性能和用户体验。
