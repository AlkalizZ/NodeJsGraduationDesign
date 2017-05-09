---
title: VPS主机上安装node.js
date: 2016-02-03
tags:
  - yaml
  - front-matter
  - dashes
description: VPS我是在[腾讯云](http://www.qcloud.com/)上买的，校园认证之后只要**￥1/月**，挺划算的。
searchDescription: VPS我是在腾讯云上买的，校园认证之后只要￥1/月，挺划算的。
---
VPS我是在[腾讯云](http://www.qcloud.com/)上买的，校园认证之后只要**￥1/月**，挺划算的。
<!--more-->
## 修改更新源
VPS的系统我选用的是`ubuntu14.04`,系统上默认的官方的源对于国内用户来说太慢了，最好修改成一个比较快的源。

```
$ sudo cp /etc/apt/sources.list /etc/apt/sources.list.old
$ sudo vi /etc/apt/sources.list
```
