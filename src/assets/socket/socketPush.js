/**
 * Created by renminghe on 2017/4/20.
 * 即时推送
 */
var TYPE = 0;
$(function () {
    var socket = io.connect(login_env_config().envPort);
    var authLive = parseInt(Cookies.get("ty_cmdb_auth"));
    var user = Cookies.get("ty_cmdb_user") + ":" + Cookies.get("ty_cmdb");
    socket.on('connect', function () {
        console.log("socket服务器连接成功");
        socket.emit('loginIn',Cookies.get("ty_cmdb_user") + ":" + Cookies.get("ty_cmdb"));
    });
    socket.on('OrderMsg', function (msg) {    // 收到工单信息推送
        if (msg.accept === user) {
            TYPE = 0;
            $('#myAcceptNav').find('span').show();
            $('.showMsg .msgTitle').text(msg.msg);
            $('.showMsg').show().animate({"right": "15px"});
            setTimeout(function () {
                $('.showMsg').animate({"right": "-280px"},function () {
                    $('.showMsg').hide();
                });
            },5000);
        } else if (msg.accept === "不限" && authLive > 1) {
            TYPE = 1;
            $('#pubAcceptNav').find('span').show();
            $('.showMsg .msgTitle').text(msg.msg);
            $('.showMsg').show().animate({"right": "15px"});
            setTimeout(function () {
                $('.showMsg').animate({"right": "-280px"},function () {
                    $('.showMsg').hide();
                });
            },5000);
        }
    });
    
    
    // 忽略
    $('.showMsg .unHandleMsgBtn').on('click', function () {
        $('.showMsg').animate({"right": "-280px"},function () {
            $('.showMsg').hide();
        });
    });
    
    // 查看
    $('.showMsg .handleMsgBtn').on('click', function () {
        console.log(TYPE);
        if (TYPE) {
            $('#pubAcceptNav').find('span').hide();
            $('.showMsg').animate({"right": "-280px"},function () {
                $('.showMsg').hide();
                location.href = "/#/workOrder/publicAcceptOrder";
                $(".navItemTitle").next().children().children().removeClass("actives");
                $('#pubAcceptNav a').addClass("actives");
            });
        } else {
            $('#myAcceptNav').find('span').hide();
            $('.showMsg').animate({"right": "-280px"},function () {
                $('.showMsg').hide();
                location.href = "/#/workOrder/myAcceptOrder";
                $(".navItemTitle").next().children().children().removeClass("actives");
                $('#myAcceptNav a').addClass("actives");
            });
        }
        
        
    });
    
    // 点击数量消失
    $('#myAcceptNav').on('click', function () {
        UNHANDLE_ORDER_COUNT = 0;
        $('#myAcceptNav').find('span').text("").hide();
    });
    
    // 点击数量消失
    $('#pubAcceptNav').on('click', function () {
        UNHANDLE_PUBLICORDER_COUNT = 0;
        $('#pubAcceptNav').find('span').text("").hide();
    });
});