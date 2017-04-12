var gulp = require('gulp');
var count = require('gulp-count');
var index = require('./bin/index');
var fs = require('fs');
var ejs = require('ejs');
var gulpEjs = require('gulp-ejs');
var logger = require('gulp-logger');
var stylus = require('gulp-stylus');

gulp.task('default', () => {
    // 默认任务
    console.log('this is default task');
});
//TODO 生成基础文件夹及文件
gulp.task('init', () => {

    var flag = index.fsExistsSync('./_config.json');    
    if(flag) throw Error('已经初始化');
    fs.readFile('./assets/_config.json', 'utf-8', (err, data) => {
        if(err){
            console.log(err);
        }
        index.generate('./_config.json', data);
    });
});

// 新建md文件
gulp.task('new', () => {
    var flag = index.fsExistsSync('./_config.json');    
    if(!flag) throw Error('未进行初始化');
    
    // 获取config配置文件
    var _config = JSON.parse(fs.readFileSync('./_config.json', 'utf-8'));
    
    var argv = require('minimist')(process.argv.slice(2));
    var title = argv.title || _config.new_post_default_name;
    fs.readFile('./assets/scaffolds/post.md', 'utf-8', (err, data) => {
        if(err){
            console.log(err);
        }
        index.generate(`./source/_post/${title}.md`, data);
    });

    var newDate = new Date();
    var postData = {
        title: title,
        date: `${newDate.getFullYear()}-${newDate.getMonth() + 1}-${newDate.getDate()}`,
        tags:[]
    };
    index.generate(`./source/config/${title}.json`, JSON.stringify(postData, null, 2 ));
});

// 生成public文件夹及文件
gulp.task('generate', () => {
    var flag = index.fsExistsSync('./_config.json');    
    if(!flag) throw Error('未进行初始化');
    
    // 获取config配置文件
    var _config = JSON.parse(fs.readFileSync('./_config.json', 'utf-8'));
    var themeConfig = JSON.parse(fs.readFileSync(`./themes/${_config.theme}/_config.json`, 'utf-8'));
    for(key in _config){
        themeConfig[key] = _config[key];
    }

    // 渲染markdown文件
    var resultArr = []; // 存放有效的md文件
    var arr = fs.readdirSync('./source/_post/');
    arr.forEach((value) => {
        if(value.split('.')[1] === 'md'){
            resultArr.push(value);
            fs.readFile(`./source/_post/${value}`, 'utf-8', (err, data) => {
                if (err) throw err;
                // index.generate(`./public/${value.split('.')[0]}.html`, index.marked(data));
            });
        }
    });
    for(var i = 0; i < resultArr.length; i++){
        var postConfig = JSON.parse(fs.readFileSync(`./source/config/${resultArr[i].split('.')[0]}.json`, 'utf-8'));
        themeConfig.posts.push(postConfig);
    }

    gulp.src(`./themes/${_config.theme}/layout/index.ejs`)
        .pipe(gulpEjs(themeConfig, {}, {ext:'.html'}))
        .pipe(logger({
            after: `ejs模板渲染结束！`
        }))
        .pipe(gulp.dest("./public"))

    gulp.src([`./themes/${_config.theme}/source/background/**`,`./themes/${_config.theme}/source/fancybox/**`,`./themes/${_config.theme}/source/font-awesome/**`,`./themes/${_config.theme}/source/img/**`, `./themes/${_config.theme}/source/js/**`,`./themes/${_config.theme}/source/css/*.css`], {
        base: `./themes/${_config.theme}/source`   //如果设置为 base: 'js' 将只会复制 js目录下文件, 其他文件会忽略
    })
    .pipe(logger({
        after: `相关文件复制结束`
    }))
    .pipe(gulp.dest('./public'));

    gulp.src(`./themes/${_config.theme}/source/css/style.styl`)
        .pipe(logger({
            after: `css生成结束！`
        }))
        .pipe(stylus({
            compress: true,
            'include css': true
        }))
        .pipe(gulp.dest('./public/css/'));
});

// 清除public文件夹
gulp.task('clean', () => {
    var flag = index.fsExistsSync('./_config.json');    
    if(!flag) throw Error('未进行初始化');
    index.clean('public');    
});

gulp.task('uninit', () => {
    var flag = index.fsExistsSync('./_config.json');    
    if(!flag) throw Error('未进行初始化');
    index.clean('./_config.json');
})