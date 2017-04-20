# NodeJsGraduationDesign
毕业设计 基于NodeJS的静态博客的设计与实现

## 系统初始化
gulp init

## 新建文档
gulp new --title [title]

## 生成页面
gulp generate

## 清空静态页面
gulp clean

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
> 注意： tags里的`-`应该是两个`空格`而非一个`tab`，否则在渲染过程中会报错。
> 在tags-description中加入你想显示在主页里的`md`语句。