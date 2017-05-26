var gulp = require('gulp');
var index = require('./bin/index');
var fs = require('fs');
var gulpEjs = require('gulp-ejs');
var logger = require('gulp-logger');
var stylus = require('gulp-stylus');
var fm = require('front-matter');
var concat = require('pipe-concat');
var rename = require('gulp-rename');
var express = require('express');
var path = require('path');
var c = require('child_process');

gulp.task('default', () => {
    // 默认任务
    console.log('this is default task');
});

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
    var description = argv.description || 'description in there';
    var data = fs.readFile('./assets/scaffolds/post.md', 'utf-8');
    var newDate = new Date();
    var postData = `---
title: ${title}
date: ${newDate.getFullYear()}-${newDate.getMonth() + 1}-${newDate.getDate()}
tags:
  - 
  - 
  - 
description: ${description}
---
`;
    index.generate(`./${_config.source_dir}/${title}.md`, postData, cb);  // cb为gulp-task定义的回调函数，调用时就证明该任务已经结束
});

gulp.task('delete', (cb) => {
    var flag = index.fsExistsSync('./_config.json');
    if (!flag) throw Error('未进行初始化');
    // 获取config配置文件
    var _config = JSON.parse(fs.readFileSync('./_config.json', 'utf-8'));
    var argv = require('minimist')(process.argv.slice(2));
    var title = argv.title;

    if(fs.existsSync(`./${_config.source_dir}/${title}.md`)){
        index.clean(`./${_config.source_dir}/${title}.md`);
    }else{
        console.error('该文件不存在');
    }
    cb();
})

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
    themeConfig.tags = [];

    var streamArr = [];
    // 渲染markdown文件
    var arr = fs.readdirSync(`./${_config.source_dir}`);

    arr = arr.filter((value) => {
        return /.\.md$/.test(value);
    });

    arr.forEach((value) => {
        var data = fs.readFileSync(`./${_config.source_dir}/${value}`, 'utf-8');
        var content = fm(data);
        content.attributes.tags.forEach((value) => {
            if(value !== null){
                themeConfig.tags.push(value);
            }
        })
    })
    // tags数组去重
    themeConfig.tags = index.unique(themeConfig.tags);

    arr.forEach((value) => {
        var data = fs.readFileSync(`./${_config.source_dir}/${value}`, 'utf-8');
        var content = fm(data);
        var newDate = new Date(content.attributes.date);
        var singleThemeConfig = JSON.parse(fs.readFileSync(`./themes/${_config.theme}/_config.json`, 'utf-8'));
        for (key in _config) {
            singleThemeConfig[key] = _config[key];
        }

        // 详细文章页面路径为根目录
        var postUrl = `/${content.attributes.title}.html`;

        content.attributes.description = !content.attributes.description ? content.attributes.title : index.marked(content.attributes.description);
        content.attributes.date = `${newDate.getFullYear()}-${newDate.getMonth() + 1}-${newDate.getDate()}`;
        content.attributes.postUrl = postUrl;

        content.attributes.tags = content.attributes.tags.filter((value) => {
            return value !== null;
        })

        // 记录所有有效文档
        themeConfig.posts.push(content.attributes);
        
        singleThemeConfig.tags = themeConfig.tags;
        // 详细文章页面数据
        singleThemeConfig.isIndex = false;
        singleThemeConfig.posts.push({
            postUrl: postUrl,
            title: content.attributes.title,
            formatDate: `${newDate.getFullYear()}年${newDate.getMonth() + 1}月${newDate.getDate()}日`,
            tags: content.attributes.tags,
            body: index.marked(content.body),
            toc: singleThemeConfig.toc,
            permalink: singleThemeConfig.url + postUrl,
            tagClass: index.getRandom(1, 5)
        });
        var _stream = gulp.src(`./themes/${_config.theme}/layout/index.ejs`)
            .pipe(gulpEjs(singleThemeConfig, {}, { ext: '.html' }))
            .pipe(logger({
                after: `${value}文章渲染结束！`
            }))
            .pipe(rename({
                dirname: "/",
                basename: `${content.attributes.title}`,
                extname: ".html"
            }))
            .pipe(gulp.dest(`./${_config.public_dir}`));

        var _stream1 = gulp.src(`./${_config.source_dir}/${value}`, {
            base: `./${_config.source_dir}`
        })
        .pipe(logger({
            after: `下载文档${value}准备就绪`
        }))
        .pipe(rename({
            dirname: "/",
            basename: `${content.attributes.title}`,
            extname: ".md"
        }))
        .pipe(gulp.dest(`./${_config.public_dir}/docs`));
        streamArr.push(_stream, _stream1);
        // 对主页的文章按照时间先后顺序排序
        themeConfig.posts.sort((a, b) => {
            return Date.parse(b.date) - Date.parse(a.date);
        })
    });
    // 主页渲染
    themeConfig.isIndex = true;
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

    

    themeConfig.tags.forEach((value) => {
        var _posts = themeConfig.posts.filter((_val) => {
            return (_val.tags.indexOf(value) !== -1);
        });
        
        var tagConfig = JSON.parse(fs.readFileSync(`./themes/${_config.theme}/_config.json`, 'utf-8'));
        for (key in _config) {
            tagConfig[key] = _config[key];
        }
        tagConfig.tag = value;
        tagConfig.tagsArticle = _posts;
        tagConfig.tags = themeConfig.tags;

        var _stream = gulp.src(`./themes/${_config.theme}/layout/tags.ejs`)
            .pipe(gulpEjs(tagConfig, {}, {ext: '.html'}))
            .pipe(logger({
                after: `${value}标签页渲染结束`
            }))
            .pipe(rename({
                dirname: "/",
                basename: `index`,
                extname: ".html"
            }))
            .pipe(gulp.dest(`./${_config.public_dir}/tags/${value}`))
        streamArr.push(_stream);
    });

    streamArr.push(stream1, stream2, stream3);
    var stream = concat(streamArr);
    return stream;
});

// 清除public文件夹
gulp.task('clean', () => {
    var flag = index.fsExistsSync('./_config.json');
    if (!flag) throw Error('未进行初始化');
    var _config = JSON.parse(fs.readFileSync('./_config.json', 'utf-8'));
    index.clean(`./${_config.public_dir}`);
});

gulp.task('uninit', () => {
    var flag = index.fsExistsSync('./_config.json');
    if (!flag) throw Error('未进行初始化');
    index.clean('./_config.json');
});

// 利用express进行监听
gulp.task('run',['generate'], (cb) => {
    var flag = index.fsExistsSync('./_config.json');
    if (!flag) throw Error('未进行初始化');
    var _config = JSON.parse(fs.readFileSync('./_config.json', 'utf-8'));
    var argv = require('minimist')(process.argv.slice(2));
    var port = argv.port || 8888;
    var app = express();
    app.use(express.static(`${_config.public_dir}`));
    app.listen(port);
    console.log(`listening at port ${port}`);

    if(process.platform === 'darwin'){
        c.exec(`open http://localhost:${port}/`);
    }else if(process.platform === 'linux'){
        c.exec(`xdg-open http://localhost:${port}/`);
    }else{
        c.exec(`start http://localhost:${port}/`);        
    }
    cb();
});

gulp.task('switch', (cb) => {
    var flag = index.fsExistsSync('./_config.json');
    if (!flag) throw Error('未进行初始化');
    var _config = JSON.parse(fs.readFileSync('./_config.json', 'utf-8'));
    var argv = require('minimist')(process.argv.slice(2));
    var switchTheme = argv.theme;
    _config.theme = switchTheme;

    var newConfig = `{
    "title": "${_config.title}",
    "subtitle": "${_config.subtitle}",
    "description": "${_config.description}",
    "author": "${_config.author}",
    "language": "${_config.language}",
    "url": "${_config.url}",
    "root": "${_config.root}",
    "source_dir": "${_config.source_dir}",
    "public_dir": "${_config.public_dir}",
    "new_post_default_name": "${_config.new_post_default_name}",
    "highlight": ${_config.highlight},
    "theme": "${_config.theme}"
}`;

    index.clean('./_config.json');
    index.generate(`./_config.json`, newConfig, cb);
});