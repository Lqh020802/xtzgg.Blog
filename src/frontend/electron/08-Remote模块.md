---
title: 08. Remote模块-多窗口
icon: simple-icons:electron
---

# 08. Remote模块-多窗口



提示

Electron 中与 GUI 相关的模块只存在于主进程，而不在渲染进程中 ，为了能从渲染进程中使用它们，需要给主进程发送进程间消息。remote 模块提供了一种在渲染进程和主进程之间进行进程间通讯的简便途径，使用 remote 模块，可以调用主进程对象的方法，而无需显式地发送进程间消息，这类似于 Java 的 RMI。

注意

Electron10.x 以后要使用 remote 模块的必须得在 BrowserWindow 中开启。

例:

![](/Electron/多窗口.jpg)
全部代码:

需要注意的是electron12之后的版本，需要加上

```text
webPreferences:{
nodeIntegration: true,
contextIsolation:false,
// 开启remote
enableRemoteModule: true,
}

