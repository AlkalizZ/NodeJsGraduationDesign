'use strict';
var fs = require('fs');
var fileOperations = require('../lib/fileOperations');

function clean (path){
    fileOperations.rmdirSync(path, function(e){
        console.log(`删除${path}目录以及子目录成功`);
    })
}
exports.clean = clean;