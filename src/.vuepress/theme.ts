import { hopeTheme } from "vuepress-theme-hope";

import navbar from "./navbar.js";
import sidebar from "./sidebar.js";

export default hopeTheme({
  hostname: "https://mister-hope.github.io",

  author: {
    name: "小兔子乖乖",
    url: "https://mister-hope.com",
  },

  repo: "vuepress-theme-hope/vuepress-theme-hope",

  docsDir: "src",

  // 导航栏
  navbar,
  navbarTitle: "",  // 隐藏导航栏标题

  // 侧边栏
  sidebar,

  // 页脚
  footer: "默认页脚",
  displayFooter: true,

  // 博客相关
  blog: {
    description: "一个前端开发者",
    intro: "/intro.html",
    medias: {
      // 取消注释并填写您的真实链接
      // GitHub: "https://github.com/yourusername",
      // Email: "mailto:your@email.com",
      // Gitee: "https://gitee.com/yourusername",
      // 更多社交媒体选项请参考：https://theme-hope.vuejs.press/zh/guide/blog/intro.html#%E5%AA%92%E4%BD%93
    },
  },

  // 加密配置
  encrypt: {
    config: {
      "/demo/encrypt.html": {
        hint: "Password: 1234",
        password: "1234",
      },
    },
  },

  // 多语言配置
  metaLocales: {
    editLink: "在 GitHub 上编辑此页",
  },

  // 如果想要实时查看任何改变，启用它。注: 这对更新性能有很大负面影响
  // hotReload: true,

  // 此处开启了很多功能用于演示，你应仅保留用到的功能。
  markdown: {
    align: true,
    attrs: true,
    codeTabs: true,
    component: true,
    demo: true,
    figure: true,
    gfm: true,
    imgLazyload: true,
    imgSize: true,
    include: true,
    mark: true,
    plantuml: true,
    spoiler: true,
    stylize: [
      {
        matcher: "Recommended",
        replacer: ({ tag }) => {
          if (tag === "em")
            return {
              tag: "Badge",
              attrs: { type: "tip" },
              content: "Recommended",
            };
        },
      },
    ],
    sub: true,
    sup: true,
    tabs: true,
    tasklist: true,
    vPre: true,

    // 取消注释它们如果你需要 TeX 支持
    // math: {
    //   // 启用前安装 katex
    //   type: "katex",
    //   // 或者安装 mathjax-full
    //   type: "mathjax",
    // },

    // 如果你需要幻灯片，安装 @vuepress/plugin-revealjs 并取消下方注释
    // revealjs: {
    //   plugins: ["highlight", "math", "search", "notes", "zoom"],
    // },

    // 在启用之前安装 chart.js
    // chartjs: true,

    // insert component easily

    // 在启用之前安装 echarts
    // echarts: true,

    // 在启用之前安装 flowchart.ts
    // flowchart: true,

    // 在启用之前安装 mermaid
    // mermaid: true,

    // playground: {
    //   presets: ["ts", "vue"],
    // },

    // 在启用之前安装 @vue/repl
    // vuePlayground: true,

    // 在启用之前安装 sandpack-vue3
    // sandpack: true,
  },

  // 在这里配置主题提供的插件
  plugins: {
    // 搜索插件配置（使用 slimsearch，searchPro 已废弃）
    slimsearch: {
      // 索引全部内容
      indexContent: true,
      // 自定义字段索引
      customFields: [
        {
          getter: (page) => {
            const category = page.frontmatter.category;
            return typeof category === "string" || Array.isArray(category) ? category : null;
          },
          formatter: "分类：$content",
        },
        {
          getter: (page) => {
            const tag = page.frontmatter.tag;
            return typeof tag === "string" || Array.isArray(tag) ? tag : null;
          },
          formatter: "标签：$content",
        },
      ],
    },
    
    blog: true,

    // 启用之前需安装 @waline/client
    // 警告: 这是一个仅供演示的测试服务，在生产环境中请自行部署并使用自己的服务！
    // comment: {
    //   provider: "Waline",
    //   serverURL: "https://waline-comment.vuejs.press",
    // },

    components: {
      components: ["Badge", "VPCard"],
    },

    icon: {
      // 使用 iconify 图标
      assets: "iconify",
    },

    // PWA 配置
    pwa: {
      favicon: "/favicon.ico",
      cacheHTML: true,
      cacheImage: true,
      appendBase: true,
      apple: {
        icon: "/logo.png",
        statusBarColor: "black",
      },
      manifest: {
        icons: [
          {
            src: "/logo.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    },
  },
});
