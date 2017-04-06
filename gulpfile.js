var gulp = require('gulp');
var count = require('gulp-count');
var index = require('./bin/index');
var fs = require('fs');


gulp.task('default', () => {
    // 默认任务
    console.log('this is default task');
});

//TODO 生成基础文件夹及文件
gulp.task('init', () => {
    fs.readFile('./assets/_config.yml', 'utf-8', (err, data) => {
        if(err){
            console.log(err);
        }
        index.generate('./_config.yml', data);
    });
});

// 新建md文件
gulp.task('new', () => {
    var argv = require('minimist')(process.argv.slice(2));
    fs.readFile('./assets/scaffolds/post.md', 'utf-8', (err, data) => {
        if(err){
            console.log(err);
        }
        index.generate(`./source/_post/${argv.title}.md`, data);
    });
});

// 生成public文件夹及文件
gulp.task('generate', () => {
    // index.clean('public');
    var f = {};
    gulp.src('./source/_post/*.md')
    .pipe(count());
});

// 清除public文件夹
gulp.task('clean', () => {
    index.clean('public');
});
