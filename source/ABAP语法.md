---
title: ABAP语法记录
date: 2016-07-27
tags:
  - SAP
  - ABAP
description: 在德勤实习快两个星期了，总算是理清了点ERP、SAP、ABAP之间的区别和联系，然后今天就聊点ABAP的基础语法什么的吧。
searchDescription: 在德勤实习快两个星期了，总算是理清了点ERP、SAP、ABAP之间的区别和联系，然后今天就聊点ABAP的基础语法什么的吧。
---

在德勤实习快两个星期了，总算是理清了点ERP、SAP、ABAP之间的区别和联系，然后今天就聊点ABAP的基础语法什么的吧。

## T-code
SAP中通常要执行某一个功能时，要通过路径进入,并双击该功能,但是如果记住该功能前的`Transaction code`，简称`T-code`，便可以直接输入到交易代码窗口,按执行按钮既可以执行相应的功能。

* 用`/n+T-code`是**关闭当前窗口**重开另一个窗口。
* 用`/o+T-code`是**不关闭当前窗口**重开另一个窗口。

### 部分常用T-code代码
* `se38`: 进入ABAP编辑器
* `se09/se10`: 进入Change Request
* `se80`: 进入对象导航器Object Navigator
* `进入对象导航器，然后Dictionary Objects->Database Tables`: 进入Dictionary: Display Table
* `进入Dictionary: Display Table，然后右键change`: 进入Dictionary: Change Table
* `进入对象导航器，然后Dictionary Objects->Data Elements，右键change`: 进入Dictionary: Change Data Element
* `进入对象导航器，然后Dictionary Objects->Domains，右键change`: 进入Dictionary: Change Domain
* `进入对象导航器，然后Dictionary Objects->View，右键change`: 进入Dictionary: Change View
* `sdw0`: 进入ABAP Workbench
* `se11`: 进入ABAP Dictionary: Initial Screen
* `进入ABAP Dictionary: Initial Screen后，点create`: 进入Dictionary: Change Search Help


## ABAP数据类型
* C: Character Text(字符串)，默认长度为1，例: `'M'`
* N: Numeric Text(由数值组成的字符串)，例: `111`, `'111'`
* I: Integer(整数)，范围 :-2^31 ~ 2^(31-1)，例: `11`
* D: Date(日期)，格式为`YYYYMMDD`, 最大是`9999/12/31`，例:`1999/12/03`
* P: Packed #(packed 数)，用于小数点数值，例如: `12.00542`
* T: Time(时间)，格式为`HHMMSS`，例如: `14:03:00`，`21:30:39`
* F: Floating Point #(浮点数)，长度为8, 例如: `4.285714285714286E-01`
* X: Hexadecimal #(十六进制数)，例如`1A03`

## ABAP语法关键字
### 申明数据
#### DATA: 创建变量
##### 1. 按照数据类型定义变量
ABAP的变量需要通过关键字DATA进行声明，当同时声明多个变量时，需要在DATA后面加冒号，如`DATA:`，每个变量可以分配默认值，使用`VALUE ‘默认值’`进行定义，基本语法如下：

``` abap
DATA <变量名>(长度) TYPE <数据类型> VALUE <默认值>
```
下面举几个例子：

``` abap
*定义一个变量
DATA test1(10) TYPE C VALUE 'HELLO SAP'.
*定义多个变量
DATA: player(35) TYPE C,
      nickname(35),
      points TYPE I,
      games TYPE I VALUE '10',
      average(5) TYPE P,
      acquired TYPE D.
```
在使用VALUE定义变量的默认值时，默认的最大长度不要超过变量设定的长度，否则系统会按设定长度自动截取。

例如，定义变量`DATA:TITLE(5) TYPE C VALUE 'HELLO SAP'.`时变量的定长为5，那么该变量的实际值就为`HELLO`。

若定义变量时未使用TYPE来声明数据类型，那么该变量会默认为字符类型，如例中的`nickname(35)`则表示长度等于35位的字符变量。

##### 2. 按照参考定义变量
使用`LIKE`关键字，基本语法如下：

``` abap
DATA <变量1> LIKE <变量2>.
```
例如：

``` abap
DATA:test1(20) TYPE C VALUE 'abc',
     test2 LIKE test1.
     
*这里test1是值为'abc'的字符串，长度为20
*而test2是一个空的字符串，长度为20
```
通过以上操作，`test2`和`test1`会具有相同的类型，注意，**只是类型**！**与值无关**！
#### CONSTANTS: 创建常量
ABAP中使用关键字`CONSTANTS`来定义常量。定义常量必须定初始值，基本语法如下：

``` abap
CONSTANTS <变量名>(长度) TYPE <数据类型> VALUE <默认值>.
```
例如：

``` abap
*定义一个常量
CONSTANTS test1(10) TYPE C VALUE 'hahaha'.

*定义多个常量
CONSTANTS: test2(10) TYPE C VALUE 'heheh',
		   test3(10) TYPE C VALUE '1111'.
```
#### STATICS
声明的变量仅在目前的程序中使用，结束后会自动释放，语法如下：

``` abap
CONSTANTS <变量名>(长度) TYPE <数据类型> VALUE <默认值>.
```
例如，

``` abap
CONSTANTS: CNAME(10) VALUE '周庆日',
		   BIRTH_DAY TYPE D VALUE '19650201'.
```

#### TABLES
用来声明表工作区的数据，对应至ABAP/4字典对象(DictionaryObject)，由SQL命令加载所需数据，语法如下：

``` abap
TABLES <dbtab>
```
例如，

``` abap
*从ABAP/4字典的SPFL表载入MANDT,CARRID,CONNECTION三个字段至SPFL这个表工作区
TABLES: SPFL. 
SELECT * FROM SPFL.  
WRITE: SPFL-MANDT, SPFL-CARRID, SPFL-CONNECTION.
ENDSELECT.
```

### 输出至屏幕
#### WRITE
语法：

``` abap
WRITE 数据项.
```
数据项可以是常量或者变量，例如：

``` abap
WRITE 'This is sample'.
WRITE: 'COMPANY:', STFL-CARRID.
```
关于WRITE语句的更多信息，可以去这里[看看](https://www.baidu.com/s?wd=abap+write%E8%AF%AD%E5%8F%A5)😑

### 数据处理
#### 赋值
语法：

``` abap
MOVE 变量1 TO 变量2.
*or
变量2 = 变量1.
```
例如，

``` abap
MOVE test1 TO test2.
*or
test2 = test1.
```

#### 算术符号
1. `**`乘幂
2. `*`乘
3. `/`除
4. `+`加
5. `-`减
6. `DIV`整数除法
7. `MOD`余数除法

#### 数值函数

1. `ABS(N)`返回数值N的绝对值 
2. `SIGN(N)`返回参数符号，正数返回1，0返回0，负数返回-1
3. `CEIL(N)`返回大于数值N的最小整数 
	
	示例:
	
	``` abap
	*-5.00
	CEIL('-5.65').
	*5.00
	CEIL('4.54').
	```
4. `FLOOR(N)`返回小于数值N的最大整数 
	
	示例：
	
	``` abap
	*-6.00
	FLOOR('-5.65').
	*4.00
	FLOOR('4.54').
	```
5. `TRUNC(N)`返回数值N的整数部分

	示例：
	
	``` abap
	*5.00
	TRUNC('5.65').
	```
6. `FRAC(N)`返回数值N的小数部分

	示例：
	
	``` abap
	*0.200
	FRAC('2.2').
	```
7. `COS(A),SIN(A),TAN(A)`返回三角函数cosA,sinA,tanA的值，A为弧度量
8. `EXP(N)`返回e^N的值
9. `LOG(N)`返回ln^(N)的值
10. `LOG10(N)`返回lg^(N)的值
11. `SQRT(N)`返回N的平方根值
