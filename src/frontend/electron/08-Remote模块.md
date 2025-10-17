---
title: 08-Remote模块-多窗口
---

# 08-Remote模块-多窗口

# 08-Remote模块-多窗口
[AirL](https://mrhope.site)大约 1 分钟

提示

Electron 中与 GUI 相关的模块只存在于主进程，而不在渲染进程中 ，为了能从渲染进程中使用它们，需要给主进程发送进程间消息。remote 模块提供了一种在渲染进程和主进程之间进行进程间通讯的简便途径，使用 remote 模块，可以调用主进程对象的方法，而无需显式地发送进程间消息，这类似于 Java 的 RMI。

注意

Electron10.x 以后要使用 remote 模块的必须得在 BrowserWindow 中开启。

例:
![](/assets/多窗口.4311d3c3.jpg)
全部代码:
> 

需要注意的是electron12之后的版本，需要加上
```text
webPreferences:{
nodeIntegration: true,
contextIsolation:false,
// 开启remote
enableRemoteModule: true,
}
```
[编辑此页open in new window](https://github.com/vuepress-theme-hope/vuepress-theme-hope/edit/main/demo/src/AirL-My-blog/Electron/08-Remote模块.md)[上一页07-主进程和渲染进程](/AirL-My-blog/Electron/07-%E4%B8%BB%E8%BF%9B%E7%A8%8B%E5%92%8C%E6%B8%B2%E6%9F%93%E8%BF%9B%E7%A8%8B.html)[下一页09-菜单的创建和基本使用](/AirL-My-blog/Electron/09-%E8%8F%9C%E5%8D%95%E7%9A%84%E5%88%9B%E5%BB%BA%E5%92%8C%E5%9F%BA%E6%9C%AC%E4%BD%BF%E7%94%A8.html)Loading...