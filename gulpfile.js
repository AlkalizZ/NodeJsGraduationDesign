var gulp = require('gulp');
var index = require('./bin/index');

gulp.task('default', () => {
  // 默认任务
  console.log(123);
});
gulp.task('init', () => {
  // 生成基础文件夹及文件

});
gulp.task('new', () => {
  // 新建md文件
});
gulp.task('generate', () => {
  // 生成public文件夹及文件
});
gulp.task('g', () => {
    gulp.run('generate');
});
gulp.task('clean', () => {
  // 清除public文件夹
    
    index.clean('public');
});
