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

  // CSS 子目录
  "/frontend/css/": [
    "styles-not-working",
    "box-model-multiplying",
    "transform-performance",
    "will-change-property",
  ],

  // 浏览器 子目录
  "/frontend/browser/": [
    "process-model",
    "compositor-thread",
    "layering-and-tiling",
    "rasterization-explained",
    "link-script-blocking",
    "long-task-blocking",
    "reflow-and-style-reading",
    "https-understanding",
    "cssom-explained",
    "css-value-computation",
    "jwt",
    "sso",
    "xss",
  ],

  // Electron 子目录
  "/frontend/electron/": [
    "Electron_index",
    "01-快速入门",
    "02-快速入门(2)",
    "03-流程模型",
    "04-上下文隔离",
    "05-进程间通讯",
    "06-运行流程",
    "07-主进程和渲染进程",
    "08-Remote模块",
    "09-菜单的创建和基本使用",
    "10-右键菜单",
    "11-通过浏览器打开网页",
    "12-嵌入网页和打开子窗口",
    "13-子窗口向父窗口传递信息",
    "14-选择文件对话框",
    "15-保存对话框",
    "16-断网提醒功能",
    "17-底部消息通知",
    "18-注册全局快捷键",
    "19-剪切板",
  ],
});
