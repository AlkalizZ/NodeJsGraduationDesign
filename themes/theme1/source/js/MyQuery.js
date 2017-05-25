/**
 * Created by Alkali on 15/8/7.
 */
;(function (window) {
    var _ = {
        addHandler: function (oElement, sEvent, fnHandler) {
            oElement.addEventListener ? oElement.addEventListener(sEvent, fnHandler, false) : oElement.attachEvent("on" + sEvent, fnHandler)
        },
        removeHandler: function (oElement, sEvent, fnHandler) {
            oElement.removeEventListener ? oElement.removeEventListener(sEvent, fnHandler, false) : oElement.detachEvent("on" + sEvent, fnHandler)
        },
        addLoadHandler: function (fnHandler) {
            this.addHandler(window, "load", fnHandler)
        },
        hasClass: function (obj, cls) {
            return obj.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
        },
        addClass: function (element, value) {
            if (!element.className) {
                element.className = value;
            } else {
                var newClassName = element.className;
                newClassName += " " + value;
                element.className = newClassName;
            }
        },
        removeClass: function (obj, cls) {
            if (_.hasClass(obj, cls)) {
                var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
                obj.className = obj.className.replace(reg, ' ');
            }
        },
        getTagList: function (element, tag) {
            if (!tag) return element.children;
            var list = element.children,
                tagList = [];
            for (var i = 0, len = list.length; i < len; i++) {
                if (list[i].tagName.toLowerCase() == tag.toLowerCase()) {
                    tagList.push(list[i]);
                }
            }
            return tagList;
        },
        getObjStyle: function (obj, style) {
            if (obj.currentStyle)
                return obj.currentStyle[style];
            else if (window.getComputedStyle)
                return window.getComputedStyle(obj, null)[style];
            else
                return null;
        },
        getClassName: function (className) {
            var el = [],
                _el = document.getElementsByTagName('*');
            for (var i = 0; i < _el.length; i++) {
                if (_.hasClass(_el[i], className)) {
                    el[el.length] = _el[i];
                }
            }
            return el;
        },
        setStyle: function (el, strCss, callback) {
            function endsWith(str, suffix) {
                var l = str.length - suffix.length;
                return l >= 0 && str.indexOf(suffix, l) == l;
            }

            var sty = el.style,
                cssText = sty.cssText;
            if (!endsWith(cssText, ';')) {
                cssText += ';';
            }
            sty.cssText = cssText + strCss;
            if (callback && typeof callback === "function") callback.call(this);
        },
        insertAfter: function (newElement, targetElement) {
            var parent = targetElement.parentNode;
            if (parent.lastChild == targetElement) {
                parent.appendChild(newElement);
            } else {
                parent.insertBefore(newElement, targetElement.nextSibling);
            }
        },
        //给某一类名元素的下一兄弟元素添加class名
        //比如给每一个h1元素的下一兄弟元素都加上一个相同的class
        //需要用addClass函数
        styleElementSiblings: function (tag, theclass) {
            if (!document.getElementsByTagName) return false;
            var elems = document.getElementsByTagName(tag);
            var elem;
            for (var i = 0; i < elems.length; i++) {
                elem = getNextElement(elem[i].nextSibling);
                _.addClass(elem, theclass);
            }
        },
        rand: function (min, max) {
            return Math.round(min + (Math.random() * (max - min)));
        },
        fade: function (element, transparency, speed, callback) {//透明度渐变：transparency:透明度 0(全透)-100(不透)；speed:速度1-100，默认为1
            if (typeof(element) == "string") element = document.getElementById(element);
            if (!element.effect) {
                element.effect = {};
                element.effect.fade = 0;
            }
            clearInterval(element.effect.fade);
            var speed = speed || 1;
            var start = (function (elem) {
                var alpha;
                if (navigator.userAgent.toLowerCase().indexOf("msie") != -1) {
                    alpha = elem.currentStyle.filter.indexOf("opacity=") >= 0 ? (parseFloat(elem.currentStyle.filter.match(/opacity=([^)]*)/)[1])) + '' : '100';
                } else {
                    alpha = 100 * elem.ownerDocument.defaultView.getComputedStyle(elem, null)["opacity"];
                }
                return alpha;
            })(element);
            element.effect.fade = setInterval(function () {
                start = start < transparency ? Math.min(start + speed, transparency) : Math.max(start - speed, transparency);
                element.style.opacity = start / 100;
                element.style.filter = "alpha(opacity=" + start + ")";
                if (Math.round(start) == transparency) {
                    element.style.opacity = transparency / 100;
                    element.style.filter = "alpha(opacity=" + transparency + ")";
                    clearInterval(element.effect.fade);
                    if (callback) callback.call(element);
                }
            }, 20);
        },
        move: function (element, position, speed, callback) {//移动到指定位置，position:移动到指定left及top 格式{left:120, top:340}或{left:120}或{top:340}；speed:速度 1-100，默认为10
            if (typeof(element) == 'string') element = document.getElementById(element);
            if (!element.effect) {
                element.effect = {};
                element.effect.move = 0;
            }
            clearInterval(element.effect.move);
            var speed = speed || 10;
            var start = (function (elem) {
                var posi = {left: elem.offsetLeft, top: elem.offsetTop};
                while (elem = elem.offsetParent) {
                    posi.left += elem.offsetLeft;
                    posi.top += elem.offsetTop;
                }
                ;
                return posi;
            })(element);
            element.style.position = 'relative';
            var style = element.style;
            var styleArr = [];
            if (typeof(position.left) == 'number')styleArr.push('left');
            if (typeof(position.top) == 'number')styleArr.push('top');
            element.effect.move = setInterval(function () {
                for (var i = 0; i < styleArr.length; i++) {
                    start[styleArr[i]] += (position[styleArr[i]] - start[styleArr[i]]) * speed / 100;
                    style[styleArr[i]] = start[styleArr[i]] + 'px';
                }
                for (var i = 0; i < styleArr.length; i++) {
                    if (Math.round(start[styleArr[i]]) == position[styleArr[i]]) {
                        if (i != styleArr.length - 1)continue;
                    } else {
                        break;
                    }
                    for (var i = 0; i < styleArr.length; i++)style[styleArr[i]] = position[styleArr[i]] + 'px';
                    clearInterval(element.effect.move);
                    if (callback)callback.call(element);
                }
            }, 20);
        },
        resize: function (element, size, speed, callback) {//长宽渐变：size:要改变到的尺寸 格式 {width:400, height:250}或{width:400}或{height:250}；speed:速度 1-100，默认为10
            if (typeof(element) == "string") element = document.getElementById(element);
            if (!element.effect) {
                element.effect = {};
                element.effect.resize = 0;
            }
            clearInterval(element.effect.resize);
            var speed = speed || 10;
            var start = {width: element.offsetWidth, height: element.offsetHeight};
            var styleArr = [];
            if (!(navigator.userAgent.toLowerCase().indexOf('msie') != -1 && document.compatMode == 'BackCompat')) {
                //除了ie下border-content式盒模型情况外，需要对size加以修正
                var CStyle = document.defaultView ? document.defaultView.getComputedStyle(element, null) : element.currentStyle;
                if (typeof(size.width) == 'number') {
                    styleArr.push('width');
                    size.width = size.width - CStyle.paddingLeft.replace(/\D/g, '') - CStyle.paddingRight.replace(/\D/g, '');
                }
                if (typeof(size.height) == 'number') {
                    styleArr.push('height');
                    size.height = size.height - CStyle.paddingTop.replace(/\D/g, '') - CStyle.paddingBottom.replace(/\D/g, '');
                }
            }
            element.style.overflow = 'hidden';
            var style = element.style;
            element.effect.resize = setInterval(function () {
                for (var i = 0; i < styleArr.length; i++) {
                    start[styleArr[i]] += (size[styleArr[i]] - start[styleArr[i]]) * speed / 100;
                    style[styleArr[i]] = start[styleArr[i]] + 'px';
                }
                for (var i = 0; i < styleArr.length; i++) {
                    if (Math.round(start[styleArr[i]]) == size[styleArr[i]]) {
                        if (i != styleArr.length - 1)continue;
                    } else {
                        break;
                    }
                    for (var i = 0; i < styleArr.length; i++)style[styleArr[i]] = size[styleArr[i]] + 'px';
                    clearInterval(element.effect.resize);
                    if (callback)callback.call(element);
                }
            }, 20);
        },
        // 格式化参数,即对参数做处理
        formatParams: function (data) {
            var arr = [];
            for (var i in data) {
                arr.push(encodeURIComponent(i) + '=' + encodeURIComponent(data[i]));
            }

            // 每一次提交都添加一个随机数,拒绝缓存
            arr.push(('v=' + Math.random()).replace('.', ''));

            return arr.join('&');
        },
        ajax: function (options) {
            // 默认处理
            options = options || {};
            options.type = (options.type || 'GET').toUpperCase();
            options.dataType = options.dataType || 'json';

            // 处理即将发送的data,
            // 无论是get方式还是post方式，
            // 当前后两次请求的参数完全一样时，
            // 浏览器就有可能调用缓存里的数据，
            // 最直接的结果就是造成有些操作没有生效的假象。
            var params = _.formatParams(options.data);

            // 创建 - 第一步
            var xhr;
            if (window.XMLHttpRequest) {
                xhr = new XMLHttpRequest();
            } else {
                xhr = new ActiveXObject('Microsoft.XMLHTTP');
            }

            // 接收 - 第三步
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {
                    var status = xhr.status;
                    if (status >= 200 && status < 300) {
                        options.success && options.success(xhr.responseText);
                    } else {
                        options.fail && options.fail(status);
                    }
                    options.complete();
                }
            };

            // 连接与发送 - 第二步
            if (options.type == 'GET') {
                xhr.open('GET', options.url, true);
                xhr.send(null);
            } else if (options.type == 'POST') {
                xhr.open('POST', options.url, true);
                xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                xhr.send(params);
            }

        }
    };

    window._ = _;
})(window);
