var gulp = require('gulp');
var count = require('gulp-count');
var index = require('./bin/index');
var fs = require('fs');
var ejs = require('ejs');
var gulpEjs = require('gulp-ejs');
var logger = require('gulp-logger');
var stylus = require('gulp-stylus');
var fm = require('front-matter');
var concat = require('pipe-concat');
var rename = require('gulp-rename');

gulp.task('default', () => {
    // 默认任务
    console.log('this is default task');
});
//TODO 生成基础文件夹及文件
gulp.task('init', (cb) => {

    var flag = index.fsExistsSync('./_config.json');
    if (flag) throw Error('已经初始化');
    fs.readFile('./assets/_config.json', 'utf-8', (err, data) => {
        if (err) {
            console.log(err);
        }
        index.generate('./_config.json', data, cb);
    });
});

// 新建md文件
gulp.task('new', (cb) => {
    var flag = index.fsExistsSync('./_config.json');
    if (!flag) throw Error('未进行初始化');

    // 获取config配置文件
    var _config = JSON.parse(fs.readFileSync('./_config.json', 'utf-8'));

    var argv = require('minimist')(process.argv.slice(2));
    var title = argv.title || _config.new_post_default_name;
    var tags = argv.tags;
    var description = argv.description;
    var data = fs.readFile('./assets/scaffolds/post.md', 'utf-8');

    var newDate = new Date();

    var postData = `---
title: ${title}
date: ${newDate.getFullYear()}-${newDate.getMonth() + 1}-${newDate.getDate()}
tags:
  - 
  - 
  - 
description: description in there
---
`;
    // var content = fm(data);
    // content.attributes.title = title;
    // content.attributes.date = `${newDate.getFullYear()}-${newDate.getMonth() + 1}-${newDate.getDate()}`;
    // content.attributes.tags = tags;
    // content.attributes.description = description;

    // console.log(description)

    index.generate(`./${_config.source_dir}/_post/${title}.md`, postData, cb);  // cb为gulp-task定义的回调函数，调用时就证明该任务已经结束
});

// 生成public文件夹及文件
gulp.task('generate', () => {
    var flag = index.fsExistsSync('./_config.json');
    if (!flag) throw Error('未进行初始化');

    // 获取config配置文件
    var _config = JSON.parse(fs.readFileSync('./_config.json', 'utf-8'));
    var themeConfig = JSON.parse(fs.readFileSync(`./themes/${_config.theme}/_config.json`, 'utf-8'));
    for (key in _config) {
        themeConfig[key] = _config[key];
    }

    var streamArr = [];
    var stream;
    // 渲染markdown文件
    var arr = fs.readdirSync(`./${_config.source_dir}/_post/`);

    arr = arr.filter((value) => {
        return /.\.md$/.test(value);
    });

    arr.forEach((value) => {
        var data = fs.readFileSync(`./${_config.source_dir}/_post/${value}`, 'utf-8');
        var content = fm(data);
        var newDate = new Date(content.attributes.date);
        var singleThemeConfig = JSON.parse(fs.readFileSync(`./themes/${_config.theme}/_config.json`, 'utf-8'));
        for (key in _config) {
            singleThemeConfig[key] = _config[key];
        }

        // 根据日期和文章标题确定详细文章页面路径
        var postUrl = `./${value.split(/\.md$/)[0]}.html`;

        content.attributes.description = !content.attributes.description ? content.attributes.title : index.marked(content.attributes.description);
        content.attributes.date = `${newDate.getFullYear()}-${newDate.getMonth() + 1}-${newDate.getDate()}`;
        content.attributes.postUrl = postUrl;

        // 记录所有有效文档
        themeConfig.posts.push(content.attributes);

        // 详细文章页面数据
        singleThemeConfig.posts.push({
            postUrl: postUrl,
            title: value,
            formatDate: `${newDate.getFullYear()}年${newDate.getMonth() + 1}月${newDate.getDate()}日`,
            tags: content.attributes.tags,
            body: index.marked(content.body),
            toc: singleThemeConfig.toc,
            permalink: singleThemeConfig.url + postUrl,
            tagClass: index.getRandom(1, 5)
        });
        var _stream = gulp.src(`./themes/${_config.theme}/layout/singleArticle.ejs`)
            .pipe(gulpEjs(singleThemeConfig, {}, { ext: '.html' }))
            .pipe(logger({
                after: `${value}文章渲染结束！`
            }))
            .pipe(rename(`${value.split(/\.md$/)[0]}.html`))
            .pipe(gulp.dest(`./${_config.public_dir}`));
        streamArr.push(_stream);
        // 对主页的文章按照时间先后顺序排序
        themeConfig.posts.sort((a, b) => {
            return Date.parse(b.date) - Date.parse(a.date);
        })
    });
    // 主页渲染
    var stream1 = gulp.src(`./themes/${_config.theme}/layout/index.ejs`)
        .pipe(gulpEjs(themeConfig, {}, { ext: '.html' }))
        .pipe(logger({
            after: `主页渲染结束！`
        }))
        .pipe(gulp.dest(`./${_config.public_dir}`))

    var stream2 = gulp.src([`./themes/${_config.theme}/${_config.source_dir}/background/**`, `./themes/${_config.theme}/${_config.source_dir}/fancybox/**`, `./themes/${_config.theme}/${_config.source_dir}/font-awesome/**`, `./themes/${_config.theme}/${_config.source_dir}/img/**`, `./themes/${_config.theme}/${_config.source_dir}/js/**`, `./themes/${_config.theme}/${_config.source_dir}/css/*.css`], {
        base: `./themes/${_config.theme}/${_config.source_dir}`   //如果设置为 base: 'js' 将只会复制 js目录下文件, 其他文件会忽略
    })
        .pipe(logger({
            after: `相关文件复制结束`
        }))
        .pipe(gulp.dest(`./${_config.public_dir}`));

    var stream3 = gulp.src(`./themes/${_config.theme}/${_config.source_dir}/css/style.styl`)
        .pipe(logger({
            after: `css生成结束！`
        }))
        .pipe(stylus({
            compress: true,
            'include css': true
        }))
        .pipe(gulp.dest(`./${_config.public_dir}/css/`));

    streamArr.push(stream1, stream2, stream3);
    var stream = concat(streamArr);
    return stream;
});

// 清除public文件夹
gulp.task('clean', () => {
    var flag = index.fsExistsSync('./_config.json');
    if (!flag) throw Error('未进行初始化');
    var _config = JSON.parse(fs.readFileSync('./_config.json', 'utf-8'));
    index.clean(`${_config.public_dir}`);
});

gulp.task('uninit', () => {
    var flag = index.fsExistsSync('./_config.json');
    if (!flag) throw Error('未进行初始化');
    index.clean('./_config.json');
})