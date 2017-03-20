'use strict';
var fs = require('fs');
var fileOperations = require('../lib/fileOperations');
var path = require('path');

function generate(){
    fileOperations.mkdirSync('../public/js','0755',function(e){
        
    });
    fileOperations.mkdirSync('../public/css','0755',function(e){
        
    });
    fileOperations.mkdirSync('../public/img','0755',function(e){
        console.log(e);
    });
}
exports.generate = generate;