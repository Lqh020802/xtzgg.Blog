---
title: CSSOM详解
icon: mdi:code-json
---

# CSSOM详解

CSSOM（CSS Object Model，CSS对象模型）是浏览器将CSS样式表解析后构建的对象模型，它与DOM一起构成了页面渲染的基础。本文将深入解析CSSOM的本质、如何读取和修改它。

## 1. CSSOM的本质

### 1.1 什么是CSSOM？

CSSOM是浏览器对CSS样式表的内部表示，它将CSS规则转换为JavaScript可以操作的对象结构。

```javascript
// CSSOM的基本结构
const cssomStructure = {
  styleSheets: [
    {
      href: 'style.css',
      cssRules: [
        {
          selectorText: '.container',
          style: {
            width: '100px',
            height: '100px'
          }
        }
      ]
    }
  ]
};
```

### 1.2 CSSOM vs DOM

```javascript
// DOM和CSSOM的关系
const renderingProcess = {
  html: 'HTML解析 → DOM树',
  css: 'CSS解析 → CSSOM树', 
  combine: 'DOM + CSSOM → 渲染树',
  layout: '渲染树 → 布局计算',
  paint: '布局 → 像素绘制'
};
```

## 2. 读取CSSOM

### 2.1 访问样式表

```javascript
// 获取所有样式表
console.log('样式表数量:', document.styleSheets.length);

// 遍历所有样式表
Array.from(document.styleSheets).forEach((sheet, index) => {
  console.log(`样式表 ${index}:`, {
    href: sheet.href,
    title: sheet.title,
    media: sheet.media.mediaText,
    disabled: sheet.disabled
  });
});
```

### 2.2 读取CSS规则

```javascript
// 读取样式表中的规则
function readCSSRules(stylesheet) {
  try {
    const rules = stylesheet.cssRules || stylesheet.rules;
    
    Array.from(rules).forEach((rule, index) => {
      console.log(`规则 ${index}:`, {
        type: rule.type,
        selectorText: rule.selectorText,
        cssText: rule.cssText
      });
    });
  } catch (error) {
    console.error('无法访问样式表规则:', error);
  }
}

// 使用示例
document.styleSheets[0] && readCSSRules(document.styleSheets[0]);
```

### 2.3 获取计算样式

```javascript
// 获取元素的计算样式
function getElementStyles(element) {
  const computedStyle = getComputedStyle(element);
  
  return {
    width: computedStyle.width,
    height: computedStyle.height,
    color: computedStyle.color,
    backgroundColor: computedStyle.backgroundColor,
    display: computedStyle.display,
    position: computedStyle.position
  };
}

// 使用示例
const element = document.querySelector('.container');
console.log('计算样式:', getElementStyles(element));
```

## 3. 修改CSSOM

### 3.1 动态修改CSS规则

```javascript
// 修改现有CSS规则
function modifyCSSRule(selector, property, value) {
  Array.from(document.styleSheets).forEach(sheet => {
    try {
      const rules = sheet.cssRules || sheet.rules;
      
      Array.from(rules).forEach(rule => {
        if (rule.selectorText === selector) {
          rule.style[property] = value;
          console.log(`已修改规则: ${selector} { ${property}: ${value} }`);
        }
      });
    } catch (error) {
      console.error('修改规则失败:', error);
    }
  });
}

// 使用示例
modifyCSSRule('.container', 'backgroundColor', 'red');
```

### 3.2 动态添加CSS规则

```javascript
// 添加新的CSS规则
function addCSSRule(selector, styles) {
  // 创建或获取样式表
  let styleSheet = document.getElementById('dynamic-styles');
  
  if (!styleSheet) {
    styleSheet = document.createElement('style');
    styleSheet.id = 'dynamic-styles';
    document.head.appendChild(styleSheet);
  }
  
  const sheet = styleSheet.sheet;
  
  // 构建CSS规则文本
  const cssText = `${selector} { ${Object.entries(styles)
    .map(([prop, value]) => `${prop}: ${value}`)
    .join('; ')} }`;
  
  // 插入规则
  try {
    sheet.insertRule(cssText, sheet.cssRules.length);
    console.log('已添加规则:', cssText);
  } catch (error) {
    console.error('添加规则失败:', error);
  }
}

// 使用示例
addCSSRule('.dynamic-element', {
  'background-color': 'blue',
  'color': 'white',
  'padding': '10px'
});
```

### 3.3 删除CSS规则

```javascript
// 删除CSS规则
function deleteCSSRule(selector) {
  Array.from(document.styleSheets).forEach(sheet => {
    try {
      const rules = sheet.cssRules || sheet.rules;
      
      for (let i = rules.length - 1; i >= 0; i--) {
        if (rules[i].selectorText === selector) {
          sheet.deleteRule(i);
          console.log(`已删除规则: ${selector}`);
        }
      }
    } catch (error) {
      console.error('删除规则失败:', error);
    }
  });
}

// 使用示例
deleteCSSRule('.old-style');
```

## 4. CSSOM的实际应用

### 4.1 主题切换系统

```javascript
// 基于CSSOM的主题切换
class ThemeManager {
  constructor() {
    this.themes = {
      light: {
        '--bg-color': '#ffffff',
        '--text-color': '#333333',
        '--border-color': '#cccccc'
      },
      dark: {
        '--bg-color': '#1a1a1a',
        '--text-color': '#ffffff',
        '--border-color': '#444444'
      }
    };
    
    this.currentTheme = 'light';
    this.init();
  }
  
  init() {
    // 创建主题样式表
    this.styleSheet = document.createElement('style');
    this.styleSheet.id = 'theme-variables';
    document.head.appendChild(this.styleSheet);
    
    this.applyTheme(this.currentTheme);
  }
  
  applyTheme(themeName) {
    const theme = this.themes[themeName];
    if (!theme) return;
    
    const cssText = `:root { ${Object.entries(theme)
      .map(([prop, value]) => `${prop}: ${value}`)
      .join('; ')} }`;
    
    this.styleSheet.textContent = cssText;
    this.currentTheme = themeName;
    
    console.log(`已切换到${themeName}主题`);
  }
  
  toggleTheme() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.applyTheme(newTheme);
  }
}

// 使用示例
const themeManager = new ThemeManager();
// themeManager.toggleTheme(); // 切换主题
```

### 4.2 响应式样式管理

```javascript
// 基于CSSOM的响应式样式管理
class ResponsiveStyleManager {
  constructor() {
    this.breakpoints = {
      mobile: 768,
      tablet: 1024,
      desktop: 1200
    };
    
    this.init();
  }
  
  init() {
    this.createStyleSheet();
    this.handleResize();
    window.addEventListener('resize', () => this.handleResize());
  }
  
  createStyleSheet() {
    this.styleSheet = document.createElement('style');
    this.styleSheet.id = 'responsive-styles';
    document.head.appendChild(this.styleSheet);
  }
  
  handleResize() {
    const width = window.innerWidth;
    const device = this.getDeviceType(width);
    
    this.applyResponsiveStyles(device);
  }
  
  getDeviceType(width) {
    if (width < this.breakpoints.mobile) return 'mobile';
    if (width < this.breakpoints.tablet) return 'tablet';
    return 'desktop';
  }
  
  applyResponsiveStyles(device) {
    const styles = {
      mobile: `
        .container { width: 100%; padding: 10px; }
        .sidebar { display: none; }
        .content { font-size: 14px; }
      `,
      tablet: `
        .container { width: 90%; padding: 20px; }
        .sidebar { display: block; width: 200px; }
        .content { font-size: 16px; }
      `,
      desktop: `
        .container { width: 80%; padding: 30px; }
        .sidebar { display: block; width: 250px; }
        .content { font-size: 18px; }
      `
    };
    
    this.styleSheet.textContent = styles[device];
  }
}
```

## 5. CSSOM的限制与安全

### 5.1 跨域限制

```javascript
// 处理跨域样式表的限制
function safeReadStyleSheet(sheet) {
  try {
    // 尝试访问规则
    const rules = sheet.cssRules || sheet.rules;
    return Array.from(rules);
  } catch (error) {
    if (error.name === 'SecurityError') {
      console.warn('跨域样式表无法访问:', sheet.href);
      return null;
    }
    throw error;
  }
}

// 检查所有样式表的可访问性
function checkStyleSheetAccess() {
  Array.from(document.styleSheets).forEach((sheet, index) => {
    const rules = safeReadStyleSheet(sheet);
    
    console.log(`样式表 ${index}:`, {
      href: sheet.href,
      accessible: rules !== null,
      rulesCount: rules ? rules.length : 'N/A'
    });
  });
}
```

### 5.2 性能考虑

```javascript
// CSSOM操作的性能优化
class OptimizedCSSOMManager {
  constructor() {
    this.pendingChanges = [];
    this.isScheduled = false;
  }
  
  // 批量处理CSS更改
  scheduleChange(selector, property, value) {
    this.pendingChanges.push({ selector, property, value });
    
    if (!this.isScheduled) {
      this.isScheduled = true;
      requestAnimationFrame(() => this.flushChanges());
    }
  }
  
  flushChanges() {
    // 批量应用所有更改
    this.pendingChanges.forEach(({ selector, property, value }) => {
      this.applyCSSChange(selector, property, value);
    });
    
    this.pendingChanges = [];
    this.isScheduled = false;
  }
  
  applyCSSChange(selector, property, value) {
    // 实际的CSS更改逻辑
    Array.from(document.styleSheets).forEach(sheet => {
      try {
        const rules = sheet.cssRules || sheet.rules;
        Array.from(rules).forEach(rule => {
          if (rule.selectorText === selector) {
            rule.style[property] = value;
          }
        });
      } catch (error) {
        console.error('应用CSS更改失败:', error);
      }
    });
  }
}
```

## 6. 总结

CSSOM是浏览器CSS处理的核心：

### 读取能力
- 可以访问所有样式表和CSS规则
- 可以获取元素的计算样式
- 受跨域安全限制

### 修改能力
- 可以动态添加、修改、删除CSS规则
- 可以创建新的样式表
- 支持实时样式更新

### 实际应用
- 主题切换系统
- 响应式样式管理
- 动态样式注入
- 性能优化工具

通过合理使用CSSOM API，可以实现强大的动态样式管理功能。
