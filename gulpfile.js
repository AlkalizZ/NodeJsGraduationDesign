var gulp = require('gulp');
var count = require('gulp-count');
var index = require('./bin/index');
var fs = require('fs');
var ejs = require('ejs');
var gulpEjs = require('gulp-ejs');
var logger = require('gulp-logger');
var stylus = require('gulp-stylus');
var fm = require('front-matter');

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
        index.generate(`./${_config.source_dir}/_post/${title}.md`, data);
    });

    var newDate = new Date();
    var postData = {
        title: title,
        date: `${newDate.getFullYear()}-${newDate.getMonth() + 1}-${newDate.getDate()}`,
        tags:[]
    };
    index.generate(`./${_config.source_dir}/config/${title}.json`, JSON.stringify(postData, null, 2 ));
});

// 生成public文件夹及文件
gulp.task('generate', () => {
    var flag = index.fsExistsSync('./_config.json');    
    if(!flag) throw Error('未进行初始化');
    
    // 获取config配置文件
    var _config = JSON.parse(fs.readFileSync('./_config.json', 'utf-8'));
    var themeConfig = JSON.parse(fs.readFileSync(`./themes/${_config.theme}/_config.json`, 'utf-8'));
    var singleThemeConfig = JSON.parse(fs.readFileSync(`./themes/${_config.theme}/_config.json`, 'utf-8'));
    for(key in _config){
        themeConfig[key] = _config[key];
        singleThemeConfig[key] = _config[key];
    }

    // 渲染markdown文件
    var resultArr = []; // 存放有效的md文件
    var arr = fs.readdirSync(`./${_config.source_dir}/_post/`);

    arr = arr.filter((value) => {
        return /.\.md$/.test(value);
    });

    console.log(arr);
    let readFilePromiseList = arr.map((value) => {

        resultArr.push(value);

        return new Promise((resolve, reject) => {
            let file = `./${_config.source_dir}/_post/${value}`;
            
            fs.readFile(file, 'utf-8', (err, data) => {
                if(err) return reject(err);
                resolve({
                    value,
                    data
                });
            });
        });
    });


    Promise.all(readFilePromiseList)
        .then((mdList) => {
            mdList.forEach((item) => {
                var value = item.value;
                var data = item.data;
                var content = fm(data);
                var newDate = new Date(content.attributes.date);

                // 根据日期和文章标题确定详细文章页面路径
                var postUrl = `./${newDate.getFullYear()}/${newDate.getMonth() + 1}/${newDate.getDate()}/${value}`;

                content.attributes.description = !content.attributes.description? content.attributes.title :index.marked(content.attributes.description);
                content.attributes.date = `${newDate.getFullYear()}-${newDate.getMonth() + 1}-${newDate.getDate()}`;

                // 记录所有有效文档
                themeConfig.posts.push(content.attributes);
                themeConfig.postUrl = postUrl;
                
                // 详细文章页面数据
                singleThemeConfig.isIndex = false;
                singleThemeConfig.posts.push({
                    postUrl: postUrl,
                    title: value,
                    formatDate: `${newDate.getFullYear()}年${newDate.getMonth() + 1}月${newDate.getDate()}日`,
                    tags: content.attributes.tags,
                    body: index.marked(content.body),
                    toc: singleThemeConfig.toc,
                    permalink: singleThemeConfig.url + postUrl
                });
                gulp.src(`./themes/${_config.theme}/layout/index.ejs`)
                    .pipe(gulpEjs(singleThemeConfig, {}, {ext:'.html'}))
                    .pipe(logger({
                        after: `${value}文章渲染结束！`
                    }))
                    .pipe(gulp.dest(`./${_config.public_dir}/` + postUrl))
            })
            
        })
        .catch(console.error);

    // arr.forEach((value) => {
    //     if(/.\.md$/.test(value)){
    //         resultArr.push(value);
    //         fs.readFile(`./${_config.source_dir}/_post/${value}`, 'utf-8', (err, data) => {
    //             if (err) throw err;
    //             var content = fm(data);
    //             var newDate = new Date(content.attributes.date);

    //             // 根据日期和文章标题确定详细文章页面路径
    //             var postUrl = `./${newDate.getFullYear()}/${newDate.getMonth() + 1}/${newDate.getDate()}/${value}`;

    //             content.attributes.description = !content.attributes.description? content.attributes.title :index.marked(content.attributes.description);
    //             content.attributes.date = `${newDate.getFullYear()}-${newDate.getMonth() + 1}-${newDate.getDate()}`;

    //             // 记录所有有效文档
    //             themeConfig.posts.push(content.attributes);
    //             themeConfig.postUrl = postUrl;
                
    //             // 详细文章页面数据
    //             singleThemeConfig.isIndex = false;
    //             singleThemeConfig.posts.push({
    //                 postUrl: postUrl,
    //                 title: value,
    //                 formatDate: `${newDate.getFullYear()}年${newDate.getMonth() + 1}月${newDate.getDate()}日`,
    //                 tags: content.attributes.tags,
    //                 body: index.marked(content.body),
    //                 toc: singleThemeConfig.toc,
    //                 permalink: singleThemeConfig.url + postUrl
    //             });
    //             gulp.src(`./themes/${_config.theme}/layout/index.ejs`)
    //                         .pipe(gulpEjs(singleThemeConfig, {}, {ext:'.html'}))
    //                         .pipe(logger({
    //                             after: `${value}文章渲染结束！`
    //                         }))
    //                         .pipe(gulp.dest('./${_config.public_dir}/' + postUrl))
    //         });

    //     }
    // });

    // 主页渲染
    themeConfig.isIndex = true;
    gulp.src(`./themes/${_config.theme}/layout/index.ejs`)
        .pipe(gulpEjs(themeConfig, {}, {ext:'.html'}))
        .pipe(logger({
            after: `主页渲染结束！`
        }))
        .pipe(gulp.dest(`./${_config.public_dir}`))


    gulp.src([`./themes/${_config.theme}/${_config.source_dir}/background/**`,`./themes/${_config.theme}/${_config.source_dir}/fancybox/**`,`./themes/${_config.theme}/${_config.source_dir}/font-awesome/**`,`./themes/${_config.theme}/${_config.source_dir}/img/**`, `./themes/${_config.theme}/${_config.source_dir}/js/**`,`./themes/${_config.theme}/${_config.source_dir}/css/*.css`], {
        base: `./themes/${_config.theme}/${_config.source_dir}`   //如果设置为 base: 'js' 将只会复制 js目录下文件, 其他文件会忽略
    })
    .pipe(logger({
        after: `相关文件复制结束`
    }))
    .pipe(gulp.dest(`./${_config.public_dir}`));

    gulp.src(`./themes/${_config.theme}/${_config.source_dir}/css/style.styl`)
        .pipe(logger({
            after: `css生成结束！`
        }))
        .pipe(stylus({
            compress: true,
            'include css': true
        }))
        .pipe(gulp.dest(`./${_config.public_dir}/css/`));
});

// 清除public文件夹
gulp.task('clean', () => {    
    var flag = index.fsExistsSync('./_config.json');    
    if(!flag) throw Error('未进行初始化');
    var _config = JSON.parse(fs.readFileSync('./_config.json', 'utf-8'));    
    index.clean(`${_config.public_dir}`);    
});

gulp.task('uninit', () => {
    var flag = index.fsExistsSync('./_config.json');    
    if(!flag) throw Error('未进行初始化');
    index.clean('./_config.json');
})