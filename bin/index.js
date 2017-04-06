/**
 * Created by Alkali on 2017/3/14.
 */

'use strict';
var generate = require('../lib/generate');
var clean = require('../lib/clean');
var marked = require('../lib/parse');

exports.clean = clean.clean;
exports.generate = generate.generate;
exports.marked = marked;