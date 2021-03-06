/*!
 * cullet Cao+Bullet, a JavaScriptPlugIn v1.0.0
 * http://www.jimi.la/
 *
 * Copyright 2016, CaoYuhao
 * All rights reserved.
 * Date: 2016-5-9 21:13:30
 */


;
(function (w, d, $, undefined) {
    function CommentCell(container, json) {

        this.C = this.container = (typeof container == 'string') ? $(container) : container;
        this.txt = json.txt || 'jimi.la ' + new Date().getTime();
        this.top = json.top; //出身位置一定是top随机 left 100%（就是屏幕右端）
        this.id = json.id;
        this.speed = json.speed;
        this.imgUrl = json.imgUrl;
        this.backgroundColor = json.backgroundColor || 'white';

        this.winH = $(window).height();
        this.winW = $(window).width();
        this.JM = this.jqueryMap = {};
        this.init();
    };

    CommentCell.prototype = {
        init: function () {
            this.initConfig();
            this.createDom();
            this.initCSS();
            this.bindEvent();
        },
        initConfig: function () {

        },
        createDom: function () {
            var that = this;
            $(this.C).append('<div class="comment" id=cell' + that.id + '>' +
                '<div class="commentImg">' + '<img src="' + that.imgUrl + '" alt=""/>' + '</div>' +
                '<div class="commentTxt">' + that.txt + '</div>' +
                '</div>');

            //setJqMap
            this.JM.$cell = $(this.C).find('#cell' + that.id);

        },
        initCSS: function () {
            var that = this;

            //设置当前弹幕本身的css
            this.JM.$cell.css({left: that.winW});
            this.JM.$cell.css({top: that.top});


            this.JM.$cell.css({
                position: 'absolute',
                display: 'block',
                'box-sizing': 'border-box',
                'font-size': '16px',
                'padding': '3px 10px',
                'border-radius': '30px',
                'background-color': that.backgroundColor,
                opacity: '0.8',
            });

            this.JM.$cell.find('.commentImg').css({
                float: 'left',
                'border-radius': '50%',
                'margin-top': '2px',
                'margin-right': '10px',
            }).find('img').css({
                width: '24px',
                'border-radius': '50%'
            });

            this.JM.$cell.find('.commentTxt').css({
                'margin-top': '4px',
                float: 'right',
            });


        },
        bindEvent: function () {
            var that = this;

        },
        move: function () {
            var that = this;
            var cellLeft = this.cssCell('left');
            this.cssCell('left', (cellLeft - that.speed));
            if (this.cssCell('left') <= (-this.cssCell('width'))) {
                that.die();
            }
            ;


        },
        die: function () {
            var that = this;
            //删除分两步 一个是ccm数组里删除自己 另一个是 删除dom节点

            that.jqueryMap.$cell.remove(); //维护dom
            ccm.commentArr = _.without(ccm.commentArr, that); //维护数组

//                that.consoleFns.showLength();

        },
        cssCell: function (property, value) {
            if (!value) {
                return parseFloat(this.jqueryMap.$cell.css(property));
            }
            else {
                this.jqueryMap.$cell.css(property, value);
            }
        },


        consoleFns: {
            showLength: function () {
                var that = this;
                console.log($('.comment').length);
                console.log(ccm.commentArr.length);
            },
        }
    };
    function CommentCellManage(container) {
        this.C = this.container = (typeof container == 'string') ? $(container) : container;
        this.commentArr = [];//维护的弹幕列表 还是要不能只用dom树维护节点
        this.commentArrLimit = 200;

        this.winH = $(window).height();
        this.winW = $(window).width();
        this.cellH = 30;
        this.cellPaddingTop = 15;

        this.lineNumber = Math.floor(this.winH / (this.cellH + this.cellPaddingTop)); //弹幕应该有的行数
        this.lineResArr = [];//保存了所有行的数组 一开始是空
        this.lineResArrFixed = [];//保存了所有行的数组 不能动
        for (i = 1; i < this.lineNumber - 2; i++) { //第一行和最后两行不能有弹幕
            this.lineResArr.push(i);
            this.lineResArrFixed.push(i);
        }
        ;


        this.speed = 1.1;
        this.FPS = 60;
        this.timer = null;
        this.init();

    };

    CommentCellManage.prototype = {
        init: function () {
            this.bindEvent();
        },
        bindEvent: function () {
            var that = this;

        },
        push: function (newJson) {
            var that = this;

            function GetRandom(begin, end) {
                return Math.floor(Math.random() * (end - begin)) + begin;
            };

            function GetTop(lineIndex) { //静态方法 根据行号返回top值
                return (lineIndex * (that.cellH + that.cellPaddingTop) + that.cellPaddingTop);
            };

            function GetLineNum() {
                var res = that.lineResArr[GetRandom(0, that.lineResArr.length)];
//                    var res = that.lineResArr[0];
                that.lineResArr = _.without(that.lineResArr, res);
                if (that.lineResArr.length == 0) {
                    for (i = 1; i < that.lineNumber - 2; i++) {
                        that.lineResArr.push(i);
                    }
                }
                return res;
            };

            if (this.commentArr.length >= this.commentArrLimit) {
                console.log('Too Many Comments');
                return;
            }
            ;


            //原json
            var json = {
                txt: '弹幕 ' + new Date().getTime(),
                id: new Date().getTime(),
                lineNum: 1,
                top: GetTop(1),
                imgUrl: 'img/logo.jpg',
                speed: 1.1,
                backgroundColor: 'white'
            };

            //适配器
            for (var k in newJson) {
                json[k] = newJson[k];

            }
            ;


            var lineNum = GetLineNum();
            var top = GetTop(lineNum);
            json.lineNum = lineNum;
            json.top = top;
            var cc = new CommentCell(that.C, json);

            this.commentArr.push(cc);
        },
        move: function () {
            var that = this;
            for (i = 0; i < that.commentArr.length; i++) {
                if (that.commentArr[i]) {
                    that.commentArr[i].move();
                }
                ;
            }
            ;
        },


        start: function () {
            //循环移动
            var that = this;

            if (that.timer) {
                console.log('Timer already exists');
                return;
            } else {
                that.timer = setInterval(function () {
                    that.move();
                }, 1000 / that.FPS);

            }
            ;

        },
        pause: function () {
            var that = this;
            clearInterval(that.timer);
            delete(that.timer); //原来timer要delete
        },
        changeSpeed: function (speedValue) {
            var that = this;

            if (!speedValue) {
                return;
            }
            else {
                //新加的改变速度
                that.speed += speedValue;
                that.speed = (that.speed <= 1.1) ? 1.1 : that.speed;
                that.speed = (that.speed >= 5.1) ? 5.1 : that.speed;

                //旧的也改变速度
                for (i = 0; i < that.commentArr.length; i++) {
                    if (that.commentArr[i]) {
                        that.commentArr[i].speed = that.speed;
                    }
                }
            }
        }

    };
    function InputBox(container, data) {
        this.C = this.container = container;
        this.data = data;
        this.config = {};
        this.init();
    };

    InputBox.prototype = {
        init: function () {
            this.initConfig();
            this.createDom();
            this.initCSS();
            this.bindEvent();
        },
        initConfig: function () {

        },
        createDom: function () {

            $(this.C).html("<div class='input'></div>");

            $(this.C).find('.input').html(
                "<div class='imgCon'></div>" +
                "<div class='txtCon'></div>"
            );

            $(this.C).find('.imgCon').html('<img src="img/logo.jpg" alt=""/>');
            $(this.C).find('.txtCon').html('<input type="text" value="随便说点什么"/>' +
                '<div class="submit">发表观点</div>');


        },
        initCSS: function () {
            var that = this;
            var winH = $(window).height();
            var winW = $(window).width();


            $(this.C).find('.input').css({
                position: 'absolute',
                bottom: '0px',
                width: winW,
                height: '40px',
                'box-sizing': 'border-box',
                padding: '5px',
                'background-color': '#4b85fd',
//                    opacity: '0.6',
                'font-size': '16px',
            });


            $(this.C).find('.imgCon img').css({
                float: 'left',
                width: '30px',
                display: 'block',
                'border-radius': '50%',
            });

            $(this.C).find('.txtCon').css({
                float: 'right',
                'background-color': '#e6efff',
                'border-radius': '20px',
                width: '100px',
                height: '30px',
                position: 'relative',
            });


            $(this.C).find('.txtCon input').css({
                'background-color': '#bcc3d0',
                'background-color': '#e6efff',

                color: 'gray',
                height: '30px',
                'margin-left': '15px',

            });

            $(this.C).find('.txtCon .submit').css({
                position: 'absolute',
                right: '10px',
                top: '5px',
                border: '1px solid #000',
                'border-radius': '30px',
                'font-size': '12px',
                'box-sizing': 'border-box',
                padding: '1px 5px',
            });


        },
        bindEvent: function () {
            var that = this;

            var winH = $(window).height();
            var winW = $(window).width();


            console.log($(this.C).find('.txtCon'));
            $(this.C).find('.imgCon').css({width: 30});
            $(this.C).find('.txtCon').css({width: (winW - 10 - 30 - 5)});
            $(this.C).find('.txtCon input').focus(function () {
                if ($(this).val() == '随便说点什么') {
                    $(this).val('').css({color: 'black'});
                }
            }).blur(function () {
                if ($(this).val() == '') {
                    $(this).val('随便说点什么').css({color: 'gray'});
                }
            });

            $(this.C).find('.submit').click(function () {
                var txt = $('.txtCon input').val();
                ccm.push({
                    txt: txt,
                    backgroundColor: 'lightblue'
                });

            });

        }
    };

    w.CommentCell = CommentCell;
    w.CommentCellManage = CommentCellManage;
    w.InputBox = InputBox;
})(window, document, jQuery);



