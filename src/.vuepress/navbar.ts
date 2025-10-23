import { navbar } from "vuepress-theme-hope";

export default navbar([
  {
    text: "首页",
    icon: "mdi:home",
    link: "/",
  },
  {
    text: "前端知识点",
    icon: "mdi:code-braces",
    prefix: "/frontend/",
    children: [
      {
        text: "JavaScript",
        icon: "logos:javascript",
        link: "javascript/",
      },
      {
        text: "TypeScript",
        icon: "logos:typescript-icon",
        link: "typescript/",
      },
      {
        text: "CSS",
        icon: "logos:css-3",
        link: "css/",
      },
      {
        text: "Vue.js",
        icon: "logos:vue",
        link: "vue/",
      },
      {
        text: "工程化",
        icon: "mdi:tools",
        link: "engineering/",
      },
      {
        text: "浏览器",
        icon: "mdi:web",
        link: "browser/",
      },
      {
        text: "Electron",
        icon: "simple-icons:electron",
        link: "electron/",
      },

    ],
  },
]);
