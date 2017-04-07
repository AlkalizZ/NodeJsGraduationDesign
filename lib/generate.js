'use strict';
var fs = require('fs');
var fileOperations = require('../lib/fileOperations');

/**
 * 
 * @param {*} path 路径
 * @param {*} content 可选参数，默认值为undefined
 */
function generate(path, content){
    var arr = path.split('/');
    // 判断是创建文件夹或是创建文件
    if(content === undefined){
        fileOperations.mkdirSync(path, '0755');
    }else{
        var filename = arr.pop(),
            newPath = arr.join('/');
        if(arr.length === 1) {
            newPath += '/';
            fs.open(path, 'a', '0644', (e, fd) => {
                if(e) throw e;
                fs.write(fd,content,0,'utf8', (e) => {
                    if(e) throw e;
                    fs.closeSync(fd);
                    console.log(`生成文件${path}成功！`);
                });
            });
        }else{
            fileOperations.mkdirSync(newPath, '0755', (e) => {
                fs.open(path, 'a', '0644', (e, fd) => {
                    if(e) throw e;
                    fs.write(fd,content,0,'utf8', (e) => {
                        if(e) throw e;
                        fs.closeSync(fd);
                        console.log(`生成文件${path}成功！`);
                    });
                });
            });
        }
    }
}
module.exports = generate;