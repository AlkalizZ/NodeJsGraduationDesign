/**
 * Created by Alkali on 2017/3/14.
 */

'use strict';
var generate = require('../lib/generate');
var fileOperations =  require('../lib/fileOperations');
var clean = require('../lib/clean');
var marked = require('../lib/parse');
var getRandom = require('../lib/getRandom');
var unique = require('../lib/unique');

exports.clean = clean;
exports.generate = generate;
exports.marked = marked;
exports.fsExistsSync = fileOperations.fsExistsSync;
exports.getRandom = getRandom;
exports.unique = unique;
