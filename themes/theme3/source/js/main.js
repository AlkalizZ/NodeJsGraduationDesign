require([], function (){

    var isMobileInit = false;
    var loadMobile = function(){
        require(['/js/mobile.js'], function(mobile){
            mobile.init();
            isMobileInit = true;
        });
    }
    var isPCInit = false;
    var loadPC = function(){
        require(['/js/pc.js'], function(pc){
            pc.init();
            isPCInit = true;
        });
    }

    var browser={
        versions:function(){
        var u = window.navigator.userAgent;
        return {
            trident: u.indexOf('Trident') > -1, //IE内核
            presto: u.indexOf('Presto') > -1, //opera内核
            webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
            gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, //火狐内核
            mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
            ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
            android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或者uc浏览器
            iPhone: u.indexOf('iPhone') > -1 || u.indexOf('Mac') > -1, //是否为iPhone或者安卓QQ浏览器
            iPad: u.indexOf('iPad') > -1, //是否为iPad
            webApp: u.indexOf('Safari') == -1 ,//是否为web应用程序，没有头部与底部
            weixin: u.indexOf('MicroMessenger') == -1 //是否为微信浏览器
            };
        }()
    }

    $(window).bind("resize", function(){
        if(isMobileInit && isPCInit){
            $(window).unbind("resize");
            return;
        }
        var w = $(window).width();
        if(w >= 700){
            loadPC();
        }else{
            loadMobile();
        }
    });

    if(browser.versions.mobile === true || $(window).width() < 700){
        loadMobile();
    }else{
        loadPC();
    }

    //是否使用fancybox
    if(yiliaConfig.fancybox === true){
        require(['/fancybox/jquery.fancybox.js'], function(pc){
            var isFancy = $(".isFancy");
            if(isFancy.length != 0){
                var imgArr = $(".article-inner img");
                for(var i=0,len=imgArr.length;i<len;i++){
                    var src = imgArr.eq(i).attr("src");
                    var title = imgArr.eq(i).attr("alt");
                    imgArr.eq(i).replaceWith("<a href='"+src+"' title='"+title+"' rel='fancy-group' class='fancy-ctn fancybox'><img src='"+src+"' title='"+title+"'></a>");
                }
                $(".article-inner .fancy-ctn").fancybox();
            }
        });

    }
    //是否开启动画
    if(yiliaConfig.animate === true){

        require(['/js/jquery.lazyload.js'], function(){
            //avatar
            $(".js-avatar").attr("src", $(".js-avatar").attr("lazy-src"));
            $(".js-avatar")[0].onload = function(){
                $(".js-avatar").addClass("show");
            }
        });

      if(yiliaConfig.isHome === true) {
        // 滚动条监听使用scrollreveal.js
        // https://github.com/jlmakes/scrollreveal.js
        // 使用cdn[//cdn.bootcss.com/scrollReveal.js/3.0.5/scrollreveal.js]
        require([
          '//cdn.bootcss.com/scrollReveal.js/3.0.5/scrollreveal.js'
        ], function (ScrollReveal) {
          // 更多animation:
          // http://daneden.github.io/animate.css/
          var animationNames = [
            "pulse", "fadeIn","fadeInRight", "flipInX", "lightSpeedIn","rotateInUpLeft", "slideInUp","zoomIn",
            ],
            len = animationNames.length,
            randomAnimationName = animationNames[Math.ceil(Math.random() * len) - 1];

          // ie9 不支持css3 keyframe动画, safari不支持requestAnimationFrame, 不使用随机动画，切回原来的动画
          if (!window.requestAnimationFrame) {
              $('.body-wrap > article').css({opacity: 1});

              if (navigator.userAgent.match(/Safari/i)) {
                  function showArticle(){
                      $(".article").each(function(){
                          if( $(this).offset().top <= $(window).scrollTop()+$(window).height() && !($(this).hasClass('show')) ) {
                              $(this).removeClass("hidden").addClass("show");
                              $(this).addClass("is-hiddened");
                          }else{
                              if(!$(this).hasClass("is-hiddened")){
                                  $(this).addClass("hidden");
                              }
                          }
                      });
                  }
                  $(window).on('scroll', function(){
                      showArticle();
                  });
                  showArticle();
              }
              return;
          }
          // document.body有些浏览器不支持监听scroll，所以使用默认的document.documentElement
          ScrollReveal({
            duration: 0,
            afterReveal: function (domEl) {
              // safari不支持requestAnimationFrame不支持document.documentElement的onscroll所以这里不会执行
              // 初始状态设为opacity: 0, 动画效果更平滑一些(由于脚本加载是异步，页面元素渲染后在执行动画，感觉像是延时)
              $(domEl).addClass('animated ' + randomAnimationName).css({opacity: 1});
            }
          }).reveal('.body-wrap > article');

        });
      } else {
        $('.body-wrap > article').css({opacity: 1});
      }

    }

    //是否新窗口打开链接
    if(yiliaConfig.open_in_new == true){
        $(".article a[href]").attr("target", "_blank")
    }
    $(".archive-article-title, .github-widget a").attr("target", "_blank");

    //随机颜色
    var colorList = ["#6da336", "#ff945c", "#66CC66", "#99CC99", "#CC6666", "#76becc", "#c99979", "#918597", "#4d4d4d"];
    var id = Math.ceil(Math.random()*(colorList.length-1));
    //PC
    $("#container .left-col .overlay").css({"background-color": colorList[id],"opacity": .3});
    //移动端
    $("#container #mobile-nav .overlay").css({"background-color": colorList[id],"opacity": .7});



    /**
     * 顶部进度条部分js
     * totalHeight: 整个页面高度
     * height: 可视区高度
     * @type {*|jQuery}
     */
    var totalHeight = $('.mid-col').height(),
          progress = $('#progress');

    $(document).scroll(function() {
      var scrollTop = $(document).scrollTop(),
          height = $(window).height();
      var percent = (scrollTop / (totalHeight - height)) * 100;
      if(percent > 100) percent = 100;
      progress.width(percent + '%');
    });

    var searchInput = $('.switch-part4-search input');
    
    // 获取文章关键信息。 包括：文章标题，文章标签，文章描述，文章时间。
    var totalInfo = [],
        articles = $('.body-wrap article');

    articles.each(function(i, item){
        var _info = {};
        _info.title = $(this).attr('data-id');
        _info.date = $(this).attr('date-time');
        _info.description = $(this).attr('date-description');
        _info.tags = [];
        $('[data-id="'+ $(this).attr('data-id') + '"] .article-tag-list-item a').each(function(i, item){
            _info.tags.push(item.innerHTML);
        });
        totalInfo.push(_info);        
    });

    searchInput.change(function(){
        var _val = searchInput.val();

        // TODO 将搜索框搜索的内容，与文章关键信息匹配，将成功搜索的部分留下，其余部分删除
    })
    

    // 控制台输出文字
    if (/webkit/.test(navigator.userAgent.toLowerCase())) {
        console.log('%c @ Alkali Lan - 蓝歆      https://www.alkalixin.cn', 'line-height:32px;font-family:"Segoe UI","Lucida Grande",Helvetica,Arial,"Microsoft YaHei","Hiragino Sans GB","Hiragino Sans GB W3",sans-serif;color:#666;font-size:14px;');
        console.log('%c @ Alkali Lan - 蓝歆      https://www.alkalixin.cn', 'line-height:32px;font-family:"Segoe UI","Lucida Grande",Helvetica,Arial,"Microsoft YaHei","Hiragino Sans GB","Hiragino Sans GB W3",sans-serif;color:#ccc;font-size:14px;');
        console.log('%c @ Alkali Lan - 蓝歆      https://www.alkalixin.cn', 'line-height:32px;font-family:"Segoe UI","Lucida Grande",Helvetica,Arial,"Microsoft YaHei","Hiragino Sans GB","Hiragino Sans GB W3",sans-serif;color:#fff;font-size:14px;');
    }

    require(['/js/highlight.min.js'], function(){
        $(document).ready(function() {
          $('pre code').each(function(i, block) {
            hljs.highlightBlock(block);
          });
        });
      })
});