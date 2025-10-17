import { sidebar } from "vuepress-theme-hope";

export default sidebar({
  "/": [
    "",
  ],
  // frontend 主目录
  "/frontend/": "structure",
  
  // JavaScript 子目录 - 只显示非 README 文件
  "/frontend/javascript/": [
    "prototype-chain",
    "garbage-collection",
    "callback-hell",
    "debounce-throttle",
    "array-methods",
    "call-apply-bind",
    "array-deduplication",
  ],
  
  // Vue.js 子目录
  "/frontend/vue/": [
    "hook-vs-mixin",
  ],
  
  // 工程化 子目录
  "/frontend/engineering/": [
    "npm-registry",
  ],
  
  // 浏览器 子目录
  "/frontend/browser/": [
    "process-model",
    "jwt",
    "sso",
    "xss",
  ],
});
