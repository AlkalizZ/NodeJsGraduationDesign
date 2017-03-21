var gulp = require('gulp');
var index = require('./bin/index');

gulp.task('default', () => {
    // 默认任务
    console.log('this is default task');
});
gulp.task('init', () => {
    // 生成基础文件夹及文件
    index.generate('./public/js');
});
gulp.task('new', () => {
    // 新建md文件
});
gulp.task('generate', () => {
    // 生成public文件夹及文件
    index.clean('public');
    index.generate('./public/js');
    index.generate('./public/img');
    index.generate('./public/css');
});
gulp.task('clean', () => {
    // 清除public文件夹
    index.clean('public');
});
