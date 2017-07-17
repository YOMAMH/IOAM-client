/**
 * Created by renminghe on 16-8-24.
 */
//按钮点击事件
$(function () {
    // 验证session
    checkCookie();

    Mopload();

    $('input[type="submit"]').click(function () {
        var userName = $.trim($('#userName').val());
        var password = $.trim($('#password').val());
        //登陆验证
        $.ajax({
            url: login_env_config().env + '/user/login',
            type: 'post',
            timeout: 3000,
            data: {userName: userName, pwd: password, base64: base64(userName, "ty_cmdb")},

            // 输入验证
            beforeSend: function () {
                if (!userName || !password) {
                    $('.login_fields__msg > span').text("用户名和密码不能为空").css('color', 'red');
                    return false;
                } else {
                    $('.login_fields__msg > span').text("").css('color', '');
                }
                $('.login').addClass('test');
                setTimeout(function () {
                    $('.login').addClass('testtwo');
                    $('.login_fields__submit>input').val('登录中...');
                }, 300);
                setTimeout(function () {
                    $('.authent').show().animate({right: -320}, {
                        easing: 'easeOutQuint',
                        duration: 600,
                        queue: false
                    });
                    $('.authent').animate({opacity: 1}, {
                        duration: 200,
                        queue: false
                    }).addClass('visible');
                }, 500);
                setTimeout(function () {
                    $('.authent').show().animate({right: 90}, {
                        easing: 'easeOutQuint',
                        duration: 600,
                        queue: false
                    });
                    $('.authent').animate({opacity: 0}, {
                        duration: 200,
                        queue: false
                    }).addClass('visible');
                    $('.login').removeClass('testtwo');
                }, 1500);
                setTimeout(function () {
                    $('.login').removeClass('test');
                    $('.login div').fadeOut(123);
                    $('#userName').val('');
                    $('#password').val('');
                }, 1800);
            },

            // 成功回调
            success: function (data) {
                if (data.status == 200) {
                    handleLoginSuccess(data);
                } else {
                    $('#user').text("");
                    this.error();
                }


            },

            // 错误回调
            error: function (data) {
                setTimeout(function () {
                    $('.success').find('span').text('认证失败').css('fontSize', '25px');
                    $('.success').find('p').text('请重新登陆').css('color', 'white');
                    $('.success').fadeIn();

                }, 2200);
                setTimeout(function () {
                    $('.success').fadeOut();
                    $('.login_fields__submit>input').val('登录');
                    $('.login div').fadeIn(123);
                    $('.success').find('h2').text('');
                    $('.success').find('p').text('');
                    $('.authent').fadeOut();
                    $('.success').find('span').text('');
                    $('.success').find('p').text('');
                }, 2800);
            }
        });

    });

    // 回车登录
    $('body').on('keydown', function (e) {
        var userNmae = Cookies.get("ty_cmdb_user");
        var userAuth = Cookies.get("ty_cmdb_auth");
        if (!userNmae && !userAuth) {
            if (e.keyCode === 13) {
                $('input[type="submit"]').click();
            }
        }
       
    });

    // 密码获取获取焦点
    $('input[type="text"],input[type="password"]').focus(function () {
        $(this).prev().animate({'opacity': '1'}, 200);
    });

    // 密码失去焦点
    $('input[type="text"],input[type="password"]').blur(function () {
        $(this).prev().animate({'opacity': '.5'}, 200);
    });

    // 账号键盘弹起
    $('input[type="text"],input[type="password"]').keyup(function () {
        if (!$(this).val() == '') {
            $(this).next().animate({
                'opacity': '1',
                'right': '30'
            }, 200);
        } else {
            $(this).next().animate({
                'opacity': '0',
                'right': '20'
            }, 200);
        }
    });

    // 验证Cookie
    function checkCookie() {
        if (Cookies.get("ty_cmdb")) {
            $.ajax({
                url: login_env_config().env + '/user/loginAuth',
                type: 'GET',
                headers: {
                    Authorization : Cookies.get("ty_cmdb") + ":" + Cookies.get("ty_cmdb_auth")
                },
                timeout: 3000,
                // 成功回调
                success: function (data) {
                    if (data.status === 200) {
                        $('.banner').addClass('showBanner');
                        $('.nav').addClass('showNav');
                        $('.detail').addClass('showDetailView');
                        var userNmae = Cookies.get("ty_cmdb_user");
                        var userAuth = Cookies.get("ty_cmdb_auth");
                        $('#user').text(userNmae);
                        $('.loginView').hide();
                        $('.contain').show();
                        var authArr = userAuth.split(",");
                        var authNum = '0';
                        authArr.forEach(function (data) {
                            if (authNum < data) authNum = data;
                        });
                        
                        var liArr =  $('#orderNav li').length;
                        if (authNum === "1.1" || !userAuth) {
                            $('#authNav').remove();
                            $('#apmInfo').remove();
                            $('#ucloudInfo').remove();
                            $('#aliInfo').remove();
                            for (var i = 0; i < 4; i++) {
                                $('#orderNav li:eq(3)').remove();
                            }
                        } else if (authNum === "1.2" || authNum === "1.3") {
                            $('#authNav').remove();
                            $('#apmInfo').remove();
                            $('#ucloudInfo').remove();
                            $('#aliInfo').remove();
                            for (var i = 0; i < 3; i++) {
                                $('#orderNav li:eq(4)').remove();
                            }
                            $('.navItemTitle').eq(0).next().slideDown().parent().siblings().children().next().slideUp();
                            $('.navItemTitle').eq(0).next().children().eq(0).children().addClass('actives').parent().siblings().children().removeClass("actives");
                        } else if (authNum === '2') {
                            $('#authNav').remove();
                            $('#orderNav li:eq(6)').remove();
                            
                        }
                    } else {
                        this.error();
                    }
                },

                // 错误回调
                error: function () {
                    $('#user').text("");
                    $('.contain').hide();
                    $('.loginView').show();
                    $('.banner').removeClass('showBanner');
                    $('.nav').removeClass('showNav');
                    $('.detail').removeClass('showDetailView');
                    Cookies.remove("ty_cmdb");
                    Cookies.remove("ty_cmdb_user");
                    Cookies.remove("ty_cmdb_auth");
                }
            });
        } else {
            $('#user').text("");
            $('.contain').hide();
            $('.loginView').show();
            $('.banner').removeClass('showBanner');
            $('.nav').removeClass('showNav');
            $('.detail').removeClass('showDetailView');
            Cookies.remove("ty_cmdb");
            Cookies.remove("ty_cmdb_user");
            Cookies.remove("ty_cmdb_auth");
        }
    }

    //base64 coding
    function base64(str1, str2) {
        return btoa(str1 + ':' + str2);
    }

    // 鼠标移入现实设置面板
    $('.headIcon img').on('mouseenter', function () {
        $('.mySetting').fadeIn();
    });

    // 鼠标移出隐藏设置面板
    $('.banner .mySetting').on('mouseleave', function () {
        $('.mySetting').fadeOut(500);
    });
    $('.content').on('mouseenter', function () {
        $('.mySetting').fadeOut(500);
    });

    // 登出
    $('.mySetting div:eq(1) a').on('click', function () {
        if (confirm("确定退出吗？")) {
            $('.contain').hide();
            $('.loginView').hide();
            Cookies.remove("ty_cmdb");
            Cookies.remove("ty_cmdb_user");
            Cookies.remove("ty_cmdb_auth");
            $('.lodingView').show();
            setTimeout(function () {
                location.href = '/#/apm';
                location.reload(function () {
                    $('.lodingView').hide();
                    $('.loginView').show();
                    $('.banner').removeClass('showBanner');
                    $('.nav').removeClass('showNav');
                    $('.detail').removeClass('showDetailView');
                });
            },400);
        }
    });


    //获取随机数
    function getRandom(n) {
        return Math.floor(Math.random() * n + 1)
    }

    // loding动画
    function Mopload() {
        var docHeight = $(document).height();
        $('.lodingView').css('paddingTop', (docHeight / 2) - 50);
        var load_name_list = ["rotating-plane", "double-bounce", "wave", "wandering-cubes", "pulse", "chasing-dots",
            "three-bounce", "circle", "cube-grid", "run-ball", "fading-circle"];
        var default_load = "rotating-plane";
        var default_index = 0;
        $("[class^=mop-load]").each(function (index) {
            var _mop_html = $(this).html().trim();
            var _mop_class = $(this).attr("class");
            var _temp = _mop_class.split("mop-load-");
            if (_temp.length < 2) {
                return;
            }
            var arr = '<div class="mop-load-div">';
            if (_temp[1].trim() * 1 < load_name_list.length) {
                arr += '<div class="mop-css-' + _temp[1].trim() + '">'
            } else if (_temp[1].trim() == "x") {
                arr += '<div class="mop-css-x">';
            } else {
                return;
            }
            if (_mop_html == "") {
                _mop_html = "正在登出……"
            } else {
                $(this).html(_mop_html);
            }
            arr += '</div><div class="mop-load-text" >' + _mop_html + '</div></div>';
            $(this).html(arr);
            //addfourstlye($(this),"transition","height 2s linear 0s;");
            $(this).css("text-align", "center");
            //$(this).find(".mop-load-div").hide();
        })
        $("[class^=mop-css]").each(function (index) {
            var _mop_class = $(this).attr("class");
            var _temp = _mop_class.split("mop-css-");
            if (_temp == "mop-css") {
                $(this).addClass(default_load);
            }
            if (_temp[1].trim() == "x") {
                var rand = getRandom(load_name_list.length - 1);
                $(this).addClass(load_name_list[rand]);
            } else if (_temp[1] * 1 < load_name_list.length) {
                $(this).addClass(load_name_list[_temp[1]]);
            } else {
                return;
            }
        });
        $(".double-bounce").each(function (index) {
            var arr = '<div class="double-bounce1"></div><div class="double-bounce2"></div>';
            $(this).append(arr);
        });
        $(".wave").each(function (index) {
            var arr = '<div class = "rect1" ></div><div class = "rect2" ></div><div class = "rect3" ></div>' +
                '<div class = "rect4" ></div><div class = "rect5" ></div>';
            $(this).append(arr);
        });
        $(".wandering-cubes").each(function (index) {
            var arr = '<div class="cube1"></div><div class="cube2"></div>';
            $(this).append(arr);
        });
        $(".chasing-dots").each(function (index) {
            var arr = '<div class="dot1"></div><div class="dot2"></div>';
            $(this).append(arr);
        });
        $(".three-bounce").each(function (index) {
            var arr = '<div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div>';
            $(this).append(arr);
        });
        $(".circle").each(function (index) {
            var arr = '<div class="spinner-container container1"><div class="circle1"></div><div class="circle2">' +
                '</div><div class="circle3"></div><div class="circle4"></div></div>';
            arr += '<div class="spinner-container container2"><div class="circle1"></div><div class="circle2">' +
                '</div><div class="circle3"></div><div class="circle4"></div></div>';
            arr += '<div class="spinner-container container3"><div class="circle1"></div><div class="circle2">' +
                '</div><div class="circle3"></div><div class="circle4"></div></div>'
            $(this).append(arr);
        });
        $(".cube-grid").each(function (index) {
            var arr = '<div class="sk-cube"></div><div class="sk-cube"></div><div class="sk-cube"></div>' +
                '<div class="sk-cube"></div><div class="sk-cube"></div><div class="sk-cube"></div>' +
                '<div class="sk-cube"></div><div class="sk-cube"></div><div class="sk-cube"></div>';
            $(this).append(arr);
        });
        $(".run-ball").each(function (index) {
            var arr = '<span class="sk-inner-circle"></span>';
            $(this).append(arr);
        });
        $(".fading-circle").each(function (index) {
            var arr = '<div class="sk-circle1 sk-circle"></div><div class="sk-circle2 sk-circle">' +
                '</div><div class="sk-circle3 sk-circle"></div><div class="sk-circle4 sk-circle">' +
                '</div><div class="sk-circle5 sk-circle"></div><div class="sk-circle6 sk-circle"></div>';
            arr += '<div class="sk-circle7 sk-circle"></div><div class="sk-circle8 sk-circle">' +
                '</div><div class="sk-circle9 sk-circle"></div><div class="sk-circle10 sk-circle">' +
                '</div><div class="sk-circle11 sk-circle"></div><div class="sk-circle12 sk-circle"></div>';
            $(this).append(arr);
        });
    }
    
    // 处理登录成功
    function handleLoginSuccess(data) {
        $('#user').text(data.result.content);
        Cookies.set("ty_cmdb", data.result.hashKey, { expires: 1 });
        Cookies.set("ty_cmdb_auth", data.result.auth, { expires: 1 });
        Cookies.set("ty_cmdb_user", data.result.content, { expires: 1 });
        var liArr =  $('#orderNav li').length;
        var authArr = data.result.auth.split(",");
        var authNum = '0';
        authArr.forEach(function (data) {
            if (authNum < data) authNum = data;
        });
        
        if (authNum === '1.1' || !data.result.auth) {
            $('#authNav').remove();
            $('#apmInfo').remove();
            $('#ucloudInfo').remove();
            $('#aliInfo').remove();
            $('#orderInfo .navItemTitle').next().slideToggle();
            $('#orderInfo .navItemTitle').next().children().eq(0).children().addClass('actives');
            for (var i = 0; i < 4; i++) {
                $('#orderNav li:eq(3)').remove();
            }
            location.href = '/#/workOrder/handedleOrder';
            
        } else if (authNum === '1.2' || authNum === '1.3') {
            $('#authNav').remove();
            $('#apmInfo').remove();
            $('#ucloudInfo').remove();
            $('#aliInfo').remove();
            $('#orderInfo .navItemTitle').next().slideToggle();
            $('#orderInfo .navItemTitle').next().children().eq(0).children().addClass('actives');
            for (var i = 0; i < 3; i++) {
                $('#orderNav li:eq(4)').remove();
            }
            location.href = '/#/workOrder/handedleOrder';
            
        } else if (authNum === '2') {
            $('#authNav').remove();
            $('#orderNav li:eq(6)').remove();
            location.href = '/#/apm/app';
            $('.navItemTitle').eq(0).next().slideDown().parent().siblings().children().next().slideUp();
            $('.navItemTitle').eq(0).next().children().eq(0).children().addClass('actives').parent().siblings().children().removeClass("actives");
        } else if (data.result.auth && data.result.auth === '3') {
            location.href = '/#/apm/app';
            $('.navItemTitle').eq(0).next().slideDown().parent().siblings().children().next().slideUp();
            $('.navItemTitle').eq(0).next().children().eq(0).children().addClass('actives').parent().siblings().children().removeClass("actives");
        }
        
        setTimeout(function () {
            $('.success').find('span').text('认证成功').css({'fontSize': '25px', 'color': '#fff'});
            $('.success').find('p').text('欢迎回来').css('color', 'white');
            $('.success').fadeIn();
            
        }, 2200);
        setTimeout(function () {
            $('.success').fadeOut();
            $('.loginView').hide();
            $('.contain').show();
            $('.banner').addClass('showBanner');
            $('.nav').addClass('showNav');
            $('.detail').addClass('showDetailView');
        }, 2800);
    }
});

