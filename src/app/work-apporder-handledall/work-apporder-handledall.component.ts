import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import{ActivatedRoute, Router, Params}from'@angular/router';
import {Http, Headers, RequestOptions} from '@angular/http';
import {AppEnvConfig} from '../../assets/conf/envConfig';
import {BaseTool} from '../../assets/baseTool';
import "rxjs/add/operator/map";

declare const $: any;    // jquery
declare const Cookies;    // cookie

let AUTH = '0';

// 文件类型枚举
const FILE_TYPE_ENUM = {
    APP_FILE: "app_file",
    SQL_FILE: "sql_file",
};


@Component({
    selector: 'app-work-apporder-handledall',
    templateUrl: './work-apporder-handledall.component.html',
    styleUrls: ['./work-apporder-handledall.component.css']
})
export class WorkApporderHandledallComponent implements OnInit {

    private baseTool: any;    // 工具函数
    public orderInfo: any;    // 我的工单数据
    constructor(private route: ActivatedRoute, private router: Router, private http: Http, private cdr: ChangeDetectorRef) {
        this.baseTool = BaseTool.sharedBaseTool();    // 工具函数
        this.baseTool.handleAuth(this, '3');    // 处理权限
        this.workOrderHandledInfo();    // 获取已解决工单数据
        this.getLocalAuth();    // 获取权限
    }

    ngOnInit() {
        this.handledOrderDetail(this);    // 处理已解决工单数据
        this.pageation(this);    // 分页
        this.dropOrder(this);    // 删除工单
    }

    // 获取权限
    getLocalAuth() {
        let userAuth = Cookies.get("ty_cmdb_auth");
        let arr = userAuth.split(',');
        let authLive = '0';
        arr.forEach(data => {
            if (authLive < data) authLive = data;
        });
        AUTH = authLive;
    }

    addWorkOrder(self, data) {
        data.forEach((item) => {
            $('.orderForPerson').append('<option value="' + item.uidNumber + '">' + item.name + ':' + item.uidNumber + '</option>');
        });
        // 确认按钮
        $('#createSure').on('click', function () {
            let title = $('.addContentTitle input').val();    // 主题
            let query_type = $('.typeView option:selected').val();   // 产品类型
            let tag = $('.tagView option:selected').val();    // 业务组
            let zone = $('.ZoneView option:selected').val();    // 机房
            let accept = $('.orderForPerson option:selected').text();   // 受理人
            let firstLive = $('.firstList option:selected').val();    // 优先级
            let str = $('.noteView').val();    // 备注
            let argObj = {
                title: title,
                type: "未处理",
                reason: "",
                query_type: query_type,
                tag: tag,
                zone: zone,
                note: str,
                accept: accept,
                firstLive: firstLive,
                send_user: Cookies.get("ty_cmdb_user") + ":" + Cookies.get("ty_cmdb"),
                accept_user: accept,
                accept_user_last: accept,
                priority: firstLive,
            };
            if (argObj.title) {
                let body = JSON.stringify(argObj);
                let options = self.baseTool.Header();
                self.http.post(AppEnvConfig.env + "/work/createOrder", body, options)
                    .map(res => res.json())
                    .subscribe(data => {
                        if (data.status == 200) {
                            self.baseTool.successView("提交成功");
                            $('.modal.fade.bs-example-modal-lg.in').click();
                            self.baseTool.refView("workOrder/handedleOrder");
                        } else {
                            self.baseTool.failureView("提交失败，请稍后再试...");
                            $('.modal.fade.bs-example-modal-lg.in').click();
                        }
                    });
            } else {
                alert("请填写完整工单");
            }

        });

        // 取消按钮
        $('#createCancel').on('click', function () {
            $('.addContentTitle input').val("");    // 主题
            $('.noteView').val("");    // 备注
            $('.modal.fade.bs-example-modal-lg.in').click();
        });
    }

    // 受理用户列表
    acceptUser(self, cb) {
        let options = self.baseTool.Header();
        self.http.get(AppEnvConfig.env + "/user/auth/userInfo?auth=2", options)
            .map(res => res.json())
            .subscribe(data => {
                if (data.status == 200) {
                    cb(self, data.result.content);
                }
            });
    }

    // 工单数据处理
    workOrderHandledInfo(index = 0) {
        $('.conver').show();
        let options = this.baseTool.Header();
        this.http.get(AppEnvConfig.env + "/work/workProdOrderHandledInfoAll?index=" + index, options)
            .map(res => res.json())
            .subscribe(data => handleInfo(this, data));
    }

    // 已处理工单详情
    handledOrderDetail(self) {
        $(function () {
            $('.hostTab').delegate('.detailBtn', 'click', function () {
                let idIndex = $(this).parent().parent().children().eq(0).find("span").text();
                $('#downloadAppFile').hide();
                $('#downloadSqlFile').hide();
                self.orderInfo.forEach((item, i) => {
                    if (item.id == idIndex) {
                        let createTime = new Date(item.create_time).toLocaleString();
                        let updateType = item.update_type;
                        let app_file = '';
                        let sql_file = '';
                        app_file = item.app_file;
                        sql_file = item.sql_file;
                        if (updateType === 0) updateType = "修复bug";
                        else if (updateType === 1) updateType = "产品发布";
                        if (app_file) {
                            app_file = app_file.substring(app_file.lastIndexOf("%^") + 2);
                            $('#downloadAppFile').show();
                        }
                        if (sql_file) {
                            sql_file = sql_file.substring(sql_file.lastIndexOf("%^") + 2);
                            $('#downloadSqlFile').show();
                        }


                        $('.modal.fade.detailView .addContentGroup').eq(0).find("span").text(item.pro_type);
                        $('.modal.fade.detailView .addContentGroup').eq(0).find("i").text(item.id);
                        $('.modal.fade.detailView .addContentGroup').eq(1).find("span").text(item.pro_name);
                        $('.modal.fade.detailView .addContentGroup').eq(2).find("span").text(updateType);
                        $('.modal.fade.detailView .addContentGroup').eq(3).find("span").text(item.update_verson);
                        $('.modal.fade.detailView .addContentGroup').eq(4).find("span").text(item.build_num);
                        $('.modal.fade.detailView .addContentGroup').eq(5).find("span").text(item.jenkins_name);
                        $('.modal.fade.detailView .addContentGroup').eq(6).find("textarea").val(item.change_content);
                        $('.modal.fade.detailView .addContentGroup').eq(7).find("textarea").val(item.conf_update);
                        $('.modal.fade.detailView .addContentGroup').eq(8).find("textarea").val(item.update_depend);
                        $('.modal.fade.detailView .addContentGroup').eq(9).find("span").text(app_file);
                        $('.modal.fade.detailView .addContentGroup').eq(10).find("span").text(sql_file);
                        $('.modal.fade.detailView .addContentGroup').eq(11).find("textarea").val(item.work_order_timeline);
                        $('.modal.fade.detailView .addContentGroup').eq(12).find("span").text(createTime);
                        $('.modal.fade.detailView .addContentGroup').eq(13).find("span").text(item.send_user);
                        $('#change_content').find("textarea").val(item.change_content);
                        $('#changeTitle').val(item.change_title);
                        $('#reason').val(item.reason);
                        if (AUTH > '2') $("#dropBtn").show();
                        return;
                    }
                });
            });

            // 关闭按钮
            $('.modal.fade.detailView .closeBtn').on('click', function () {
                $('.modal.fade.detailView.in').click();
            });

            // 下载附件
            $('#downloadAppFile').on('click',downloadFiles.bind(this, FILE_TYPE_ENUM.APP_FILE));
            $('#downloadSqlFile').on('click',downloadFiles.bind(this, FILE_TYPE_ENUM.SQL_FILE));
        });
    }

    // 分页
    pageation(self) {
        // 分页
        self.infoTotalCount(self, function (dataCount) {
            $('.M-box3').pagination({
                totalData: dataCount ? dataCount : 50,
                showData: 10,
                jump: true,
                coping: true,
                homePage: '首页',
                endPage: '末页',
                prevContent: '上页',
                nextContent: '下页'
            });

            // 分页按钮
            let index = 0;
            $('.M-box3').delegate('a', 'click', function () {
                switch ($(this).text()) {
                    case '下页': {
                        index += 10;
                    }
                        break;
                    case '上页': {
                        index -= 10;
                    }
                        break;
                    case '末页': {
                        index = (Math.floor(dataCount / 10) - 1) * 10;
                    }
                        break;
                    case '首页': {
                        index = 0;
                    }
                        break;
                    case '跳转': {
                        index = ($('.M-box3').find('.active').text() - 1) * 10;
                    }
                        break;
                    default: {
                        index = ($(this).text() - 1) * 10;
                    }
                        break;
                }

                self.workOrderHandledInfo(index);
            })
        });
    }

    // 获取本地数据数量
    infoTotalCount(self, cb) {
        let options = self.baseTool.Header();
        self.http.get(AppEnvConfig.env + "/work/handledProdOrderInfoAllCount", options)
            .map(res => res.json())
            .subscribe(data => {
                if (data.status == 200) {
                    cb(data.result.content);
                }
            });
    }

    // 删除工单
    dropOrder(self) {
        $("#dropBtn").on("click", function () {
            if (AUTH > '2') {
                $("#dropBtn").attr("disabled", "disabled");
                let id = $('.modal.fade.detailView .addContentGroup').eq(0).find("i").text();
                let options = self.baseTool.Header();
                if (confirm("确定删除该工单吗？")) {
                    self.http.delete(AppEnvConfig.env + "/work/dropUnHandleProdOrderInfo?id=" + id, options)
                        .map(res => res.json())
                        .subscribe(data => {
                            $("#dropBtn").removeAttr("disabled");
                            if (data.status == 200) {
                                self.baseTool.alertView("删除成功!", self.baseTool.success);
                                $('.modal.fade.detailView.in').click();
                                self.baseTool.refView("workOrder/prodOrderAll");

                            } else {
                                let msg = '';
                                if (data.hasOwnProperty("msg")) msg = data.msg;
                                self.baseTool.alertView("删除失败! " + msg, self.baseTool.success);
                            }
                        });
                }

            }

        });

    }


}

// 处理数据
function handleInfo(self, data) {
    $('.conver').hide();
    if (data.status === 200) {
        self.orderInfo = data.result.content;
        self.baseTool.reload(self);
        self.orderInfo.forEach((item, i) => {
            $(".hostItem").eq(i).children().eq(2).css("color", "#000").find("i")
                .removeClass("fa-check-circle-o").removeClass("fa-ban").hide();
            if (item.order_type === "已通过，已关单") {
                $(".hostItem").eq(i).children().eq(2).css("color", "green").find("i")
                    .addClass("fa-check-circle-o").show();
            } else if (item.order_type === "未通过，已关单") {
                $(".hostItem").eq(i).children().eq(2).css("color", "red").find("i")
                    .addClass("fa-ban").show();
            } else if (item.order_type === "再次提交") {
                $(".hostItem").eq(i).children().eq(2).css("color", "#673ab7");
            } else if (item.order_type === "测试审核中" || item.order_type === "再次提交，测试审核中" ||item.order_type === "产品审核中") {
                $(".hostItem").eq(i).find("div.orderType").css("backgroundColor", "#e86727");
            } else if (item.order_type === "运维审核执行中") {
                $(".hostItem").eq(i).find("div.orderType").css("backgroundColor", "#0084c5");
            } else if (item.order_type === "运维审核通过，已实施") {
                $(".hostItem").eq(i).find("div.orderType").css("backgroundColor", "#0084c5");
                $(".hostItem").eq(i).children().eq(6).find('button').text("关单");
            } else if (item.order_type === "测试未通过，待确认" || item.order_type === "运维审核未通过" || item.order_type === "产品未通过，待确认") {
                $(".hostItem").eq(i).find("div.orderType").css("backgroundColor", "#e83619");
            } else if (item.order_type === "已关单") {
                $(".hostItem").eq(i).find("div.orderType").css("backgroundColor", "rgba(82, 83, 84, 0.37)");
            }


        });
        $('.hostTab .hostItem:even').css('backgroundColor', '#F7F9FC');
    } else {
        self.orderInfo = [];
    }
}

// 下载
function downloadFiles(FILE_TYPE_ENUM) {
    let idStr = $('#sign').text();
    location.href = `${AppEnvConfig.env}/work/donwloadFiles?type=${FILE_TYPE_ENUM}&id=${idStr}`;
}

