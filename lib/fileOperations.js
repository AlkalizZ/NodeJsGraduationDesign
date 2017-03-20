'use strict';
var fs = require('fs');

/**
 * 
 * @param {*} url 
 * @param {*} mode 目录权限
 * @param {*} cb 回调
 */
function mkdirSync(url,mode,cb){
    var path = require("path"), 
        arr = url.split("/");
    mode = mode || '0755';
    cb = cb || function(){};
    if(arr[0]==="."){//处理 ./aaa
        arr.shift();
    }
    if(arr[0] == ".."){//处理 ../ddd/d
        arr.splice(0,2,arr[0]+"/"+arr[1])
    }
    function inner(cur){
        if(!fs.existsSync(cur)){//不存在就创建一个
            fs.mkdirSync(cur, mode)
        }
        if(arr.length){
            inner(cur + "/"+arr.shift());
        }else{
            cb();
        }
    }
    arr.length && inner(arr.shift());
}









exports.mkdirSync = mkdirSync;
