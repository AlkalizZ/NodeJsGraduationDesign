'use strict';
var fs = require('fs');
var fileOperations = require('../lib/fileOperations');

function generate(path){
    fileOperations.mkdirSync(path, '0755', function(e){
        
    });
}

fs.open('./a/b/test.js', 'w', '0644', function(e,fd){
    if(e) throw e;
    fs.write(fd,"first fs!",0,'utf8',function(e){
        if(e) throw e;
        fs.closeSync(fd);
        console.log('gaoding');
    })
});

exports.generate = generate;