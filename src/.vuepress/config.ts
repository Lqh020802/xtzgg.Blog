import { defineUserConfig } from "vuepress";

import theme from "./theme.js";

export default defineUserConfig({
  // 如果部署到 https://<USERNAME>.github.io/，base 设置为 "/"
  // 如果部署到 https://<USERNAME>.github.io/<REPO>/，base 设置为 "/<REPO>/"
  // 当前部署到：https://lqh020802.github.io/xtzgg.Blog/
  base: "/xtzgg.Blog/",

  lang: "zh-CN",
  title: "小兔子乖乖",
  description: "欢迎来到我的个人主页",

  theme,

  // 和 PWA 一起启用
  shouldPrefetch: false,
});
