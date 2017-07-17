import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import{ActivatedRoute, Router, Params}from'@angular/router';
import {Http, Headers, RequestOptions} from '@angular/http';
import {AppEnvConfig} from '../../assets/conf/envConfig';
import "rxjs/add/operator/map";
import {BaseTool} from '../../assets/baseTool';

const d = "6b545381b02a66bef6a9681c9411d31121453056dth";    // 签名校验key

declare const $: any;    // jquery
declare const Cookies;    // cookie

let dataSourceMap = {
    "uCloud": "UCloud",
    "aliCloud": "阿里云",
};

let instanceMap = {
    "uhost": "云虚机",
    "uphost": "云物理机",
    "uredis": "云Redis",
    "umemcached": "云Memcached",
    "uhadoop": "uhadoop",
    "eip": "公网弹性IP",
    "udb": "云数据库",
    "ulb": "ulb",
    "ukafka": "ukafka",
    // "alHost": "云虚机",
    // "alEip": "公网弹性IP",
    // "alRds": "云数据库",
    // "alSlb": "云负载均衡",
    // "alVpc": "阿里VPC",
    // "alRedis": "云Redis",
};

let priorityMap = {
    "0": "一般",
    "1": "高",
    "2": "非常高",
};

let tagMap = {
    "brs": "听云Browser",
    "cctl": "听云Controller",
    "app": "听云App",
    "svr": "听云Server",
    "comm": "听云Common",
    "saas": "听云Saas",
    "net": "听云Network",
    "base": "听云基础网络",
};

let hrefMap = {
    "听云Browser": "/apm/browser",
    "听云Netop": "/apm/netop",
    "听云Controller": "/apm/controller",
    "听云App": "/apm/app",
    "听云Server": "/apm/server",
    "听云Common": "/apm/common",
    "听云Saas": "/apm/saas",
    "听云Network": "/apm/network",
    "架构组": "/apm/base",
    "听云Alarm": "/apm/alarm",
};

@Component({
    selector: 'app-uhost-manage-detail',
    templateUrl: './uhost-manage-detail.component.html',
    styleUrls: ['./uhost-manage-detail.component.css']
})
export class UhostManageDetailComponent implements OnInit {
    private UHostId: string;
    private instanceName: string;
    public hostInfo: any;
    private baseTool: any;    // 工具函数
    public changeHistoryInfo: any;    // 变更历史记录
    public ordeerInfo = [];    // 变更历史记录详情
    private instanceType: string;    // 实例类型缓存
    constructor(private route: ActivatedRoute, private router: Router, private http: Http, private cdr: ChangeDetectorRef) {
        this.baseTool = BaseTool.sharedBaseTool();    // 工具函数
        this.baseTool.handleAuth(this, '2');
        this.instanceName = this.route.snapshot.queryParams['instance_name'];
        this.changeHistory(this.instanceName, this);
        this.getHostInfo(this, this.instanceName);
    }

    ngOnInit() {
        this.orderInfo(this);    // 点击显示对应工单详情
        this.back();    // 返回
        this.hostList(this);
    }

    // 获取服务器状态数据
    getHostInfo(self, hostName) {
        let options = this.baseTool.Header();
        this.http.get(`${AppEnvConfig.env}/host/uhost/appGroup?hostName=${hostName}`, options)
            .map(res => res.json())
            .subscribe(data => {
                $('.conver').hide();
                if (data.status == 200) {
                    self.hostInfo = data.result.content;
                    self.baseTool.reload(self);
                    // 隔行变色
                    $('.hostTab .hostItem:even').css('backgroundColor', '#F7F9FC');
                }
            });
    }

    // 重新渲染界面
    reload() {
        this.cdr.detectChanges();    // 禁止自动检测
        this.cdr.markForCheck();    // 手动检测数据变化
    }

    // 时间轴
    systole(self) {
        setTimeout(function () {
            if (!$(".history").length) {
                return;
            }
            let $warpEle = $(".history-date"),
                $targetA = $warpEle.find("h2 a,ul li dl dt a"),
                parentH,
                eleTop = [];

            parentH = $(".history-date").height();


            $warpEle.parent().css({"height": 59});

            setTimeout(function () {

                $warpEle.find("ul").children(":not('h2:first')").each(function (idx) {
                    eleTop.push($(this).position().top);
                    $(this).css({"margin-top": -eleTop[idx]}).children().hide();
                }).animate({"margin-top": 0}, 1600).children().fadeIn();

                $warpEle.parent().animate({"height": parentH, "opacity": "1"}, "slow");

                $warpEle.find("ul").children(":not('h2:first')").addClass("bounceInDown").css({
                    "-webkit-animation-duration": "2s",
                    "-webkit-animation-delay": "0",
                    "-webkit-animation-timing-function": "ease",
                    "-webkit-animation-fill-mode": "both"
                }).end().children("h2").css({"position": "relative"});

            }, 600);

        }, 1000);

        // $targetA.click(function () {
        //     $(this).parent().css({"position": "relative"});
        //     $(this).parent().siblings().slideToggle();
        //     $warpEle.parent().removeAttr("style");
        //     return false;
        // });

    };

    // 变更历史
    changeHistory(instanceName, self) {
        if (instanceName) {
            let options = this.baseTool.Header();
            this.http.get(`${AppEnvConfig.env}/work/ordersInfo/${instanceName}`, options)
                .map(res => res.json())
                .subscribe(data => {
                    if (data.result.hasOwnProperty('content')) {
                        this.changeHistoryInfo = data.result.content;
                        this.reload();
                        this.systole(self);
                    } else {
                        alertView('获取工单数据失败，请稍后尝试...', '#D8534F');
                    }

                });
        }
    }

    // 对应工单详情
    orderInfo(self) {
        $(".history").delegate('button.orderInfoBtn', 'click', function () {
            // 处理工单详情数据
            let index = $(this).parent().parent().index() - 1;
            handleOrderInfoData(self, index);
            $('.hostInfoDetail').show().animate({"right": "0"});
        });

        // 关闭
        $('.hostInfoDetail .closeBtn').on('click', function () {
            $('.hostInfoDetail').animate({"right": "-400px"}, function () {
                $(this).hide();
            });
        });
    }

    // 返回键
    back() {
        $('.orderInfoItem .title .backBtn').on('click', function () {
            $('.orderInfoItem').animate({"left": "100%"}, function () {
                $(this).hide();
            });
        });
    }

    // 跳转主机列表
    hostList(self) {
        $('.orderContainer .hostTab').delegate('.detailBtn', 'click', function () {
            let tagName = $.trim($(this).parent().parent().children().eq(0).find("span").text());
            let appName = $.trim($(this).parent().parent().children().eq(1).find("i").text());
            self.router.navigate([hrefMap[tagName]], {queryParams: {instance_name: appName}});
        });
    }
}

// base64编码
function base64(str1, str2) {
    return btoa(str1 + '^&' + str2);
}

// 弹出框
function alertView(text, color) {
    $('.hostInfoRequestResView').text(text)
        .css('backgroundColor', color).fadeIn(300);
    setTimeout(function () {
        $('.hostInfoRequestResView').text('')
            .css('backgroundColor', 'none').fadeOut(500);
    }, 2000);
}

// 超时
function timeOut(data) {
    setTimeout(function () {
        if (!data) {
            alertView('获取数据失败，请稍后尝试...', '#D8534F');
        }
    }, 3000);
}

// 处理工单详情数据
function handleOrderInfoData(self, index) {
    let hostOrderItem = self.changeHistoryInfo[index];
    let change_type = hostOrderItem["change_type"];
    let action = "";
    let query_type1 = "-";
    let query_type2 = "-";
    if (change_type === "updateHost") action = "更新主机配置";
    else if (change_type === "createHost") action = "创建主机";
    else if (change_type === "updateHostOS") action = "修改主机操作系统配置";

    if (hostOrderItem.query_type) {
        let query_type = hostOrderItem.query_type.split("/");
        query_type1 = dataSourceMap[$.trim(query_type[0])];
        query_type2 = instanceMap[$.trim(query_type[1])];
    }

    $(".hostInfoDetail .hostInfoBase ul li:eq(0) span").text(hostOrderItem.change_title);
    $(".hostInfoDetail .hostInfoBase ul li:eq(1) span").text(action);
    $(".hostInfoDetail .hostInfoBase ul li:eq(2) span").text(hostOrderItem.accept_user_last);
    $(".hostInfoDetail .hostInfoBase ul li:eq(3) span").text(`${query_type1} / ${query_type2}`);
    $(".hostInfoDetail .hostInfoBase ul li:eq(4) span").text(hostOrderItem.tag);
    $(".hostInfoDetail .hostInfoBase ul li:eq(5) span").text(hostOrderItem.zone);
    $(".hostInfoDetail .hostInfoBase ul li:eq(6) span").text(hostOrderItem.send_user);
    $(".hostInfoDetail .hostInfoBase ul li:eq(7) span").text(new Date(hostOrderItem["create_time"]).toLocaleString());
    $(".hostInfoDetail .hostInfoBase ul li:eq(8) textarea").val(hostOrderItem.note);
    $(".hostInfoDetail .hostInfoBase ul li:eq(9) textarea").val(hostOrderItem.change_content);
    $(".hostInfoDetail .hostInfoBase ul li:eq(10) textarea").val(hostOrderItem.work_order_timeline);
}
