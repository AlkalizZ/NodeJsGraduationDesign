var gulp = require('gulp');
var count = require('gulp-count');
var index = require('./bin/index');
var fs = require('fs');
var ejs = require('ejs');

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
});

// 生成public文件夹及文件
gulp.task('generate', () => {
    var flag = index.fsExistsSync('./_config.json');    
    if(!flag) throw Error('未进行初始化');
    
    // 获取config配置文件
    var _config = JSON.parse(fs.readFileSync('./_config.json', 'utf-8'));
    // 渲染markdown文件
    fs.readdir('./source/_post/', (err, files) => {
        if(err) throw err;
        var arr = [];
        files.forEach((value) => {
            if(value.split('.')[1] === 'md'){
                // arr.push(value);
                fs.readFile(`./source/_post/${value}`, 'utf-8', (err, data) => {
                    if (err) throw err;
                    index.generate(`./public/${value.split('.')[0]}.html`, index.marked(data));
                });
            }
        })
        // files = arr;
    });
    var content = fs.readFileSync('./themes/theme1/layout/index.ejs', 'utf-8');
    
    var html = ejs.renderFile('./themes/theme1/layout/index.ejs', (e) => {
        console.log(e);
    });
    index.generate('./public/index.html', html);



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