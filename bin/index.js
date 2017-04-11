/**
 * Created by Alkali on 2017/3/14.
 */

'use strict';
var generate = require('../lib/generate');
var fileOperations =  require('../lib/fileOperations');
var clean = require('../lib/clean');
// var marked = require('../lib/parse');
var marked = require('../lib/P');

exports.clean = clean;
exports.generate = generate;
exports.marked = marked;
exports.fsExistsSync = fileOperations.fsExistsSync;