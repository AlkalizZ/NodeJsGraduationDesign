# NodeJsGraduationDesign
毕业设计 基于NodeJS的静态博客的设计与实现

## ~~系统初始化~~
~~`gulp init`~~

## 新建文档
`gulp new --title [title]`

## 生成静态页面
`gulp generate`

## 清空静态页面
`gulp clean`

## 在服务器上运行
`gulp run --port [port]`
默认监听端口为8888


## 其它配置
如：
``` md
---
title: VPS主机上安装node.js
date: 2016-02-03
tags:
  - yaml
  - front-matter
  - dashes
description: VPS我是在[腾讯云](http://www.qcloud.com/)上买的，校园认证之后只要**￥1/月**，挺划算的。
---
```
> 注意： tags中，`-`前应该是两个`空格`而非一个`tab`，否则在渲染过程中会报错。

> 在description中加入你想显示在主页里的`md`语句。

> 在title中不能加入`/`，否则会出现路径错误的问题

---
## 20170804 更新
看《深入浅出NodeJS》，才知道（也许是之前看过没认真记）`json`文件是可以直接通过`require`引入的，赶紧把项目中所有json的引入方式改为了require，不料出现了一点小问题，具体解释就看代码吧：

```javascript
var config1 = require('./config.json');
var config2 = require('./config.json');

config2.posts.push([1,2,3,4]);

console.log(`config1:${config1.posts} 
             config2:${config2.posts}`);
console.log(config1.posts === config2.posts); // true
```
大致上就是这个意思，使用`require`的话，`config1`和`config2`保存的是对`config.json`内容的一个引用。
