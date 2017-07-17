import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {Http, Headers, RequestOptions} from '@angular/http';
import "rxjs/add/operator/map";
import {AppEnvConfig} from '../../assets/conf/envConfig';
import {ActivatedRoute, Router} from '@angular/router';
import {BaseTool} from '../../assets/baseTool';
import {type} from "os";
import {escape} from "querystring";

declare const $: any;    // jquery
declare const Cookies;    // cookie

// 文件类型枚举
const FILE_TYPE_ENUM = {
    APP_FILE: "app_file",
    SQL_FILE: "sql_file",
};

@Component({
    selector: 'app-work-apporder-myacceptorder',
    templateUrl: './work-apporder-myacceptorder.component.html',
    styleUrls: ['./work-apporder-myacceptorder.component.css']
})
export class WorkApporderMyacceptorderComponent implements OnInit {

    private baseTool: any;    // 工具函数
    public unHandleOrderInfo: any;    // 我的未处理受理工单数据
    public handleOrderInfo: any;    // 我的已处理受理工单数据
    constructor(private route: ActivatedRoute, private router: Router, private http: Http, private cdr: ChangeDetectorRef) {
        this.baseTool = BaseTool.sharedBaseTool();   // 工具函数
        this.baseTool.handleAuth(this, '1.2');    // 处理权限
        this.myHandledAcceptInfo(this);    // 获取我受理的工单
        this.pageation(this);    // 分页
    }

    ngOnInit() {
        this.acceptOrderDetail(this);    // 我的受理工单详情
        this.disagreeQueryOrder(this);    // 回据我的受理工单
        this.agreeQueryOrder(this);    // 通过我的受理工单
        // this.resAcceptBtn(this);    // 转出
    }

    // 我的已处理委托工单
    myHandledAcceptInfo(self, index = 0) {
        $('.conver').show();
        let options = this.baseTool.Header();
        let user = Cookies.get("ty_cmdb_user") + ":" + Cookies.get("ty_cmdb");
        this.http.get(`${AppEnvConfig.env}/work/myAcceptProdOrder?user=${user}&index=${index}`, options)
            .map(res => res.json())
            .subscribe(data => handleOrder(self, data, "handled"));
    }

    // 个人受理工单详情
    acceptOrderDetail(self) {
        $(function () {
            $('.hostTab').delegate('.detailBtn', 'click', function () {
                let orderType = $.trim($(this).parent().parent().children().eq(2).find("span").text());
                let idIndex = $.trim($(this).parent().parent().children().eq(0).find("span").text());
                showDetail(self.handleOrderInfo, idIndex, orderType);
            });


            // 关闭按钮
            $('.modal.fade.detailView .closeBtn').on('click', function () {
                $('.modal.fade.detailView.in').click();
            });

            // 通过
            $('#createSure').on('click', function () {
                let orderType = $.trim($("#orderType").text());
                let ident = $('.modal.fade.detailView .addContentGroup').eq(0).find("i").text();
                if (orderType === "测试审核中" || orderType === "再次提交，测试审核中") {
                    let tester_action = $('#testerAction').find('textarea').val();
                    let text = "";
                    let update_type = $('#update_type').text();
                    text = update_type === "修复bug" ? "运维审核执行中" : "产品审核中";
                    let group = $('.modal .centerView .addContentGroup:eq(0)').find("span").text();
                    if (tester_action) handleMyAcceptOrder(self, {
                        text: text,
                        tester_action: tester_action,
                        group: group,
                    }, ident);
                    else self.baseTool.alertView("请填写完整变更记录", self.baseTool.failure);
                } else if (orderType === "产品审核中") {
                    let tester_action = $('#testerAction').find('textarea').val();
                    let proer_action = $('#proerAction').find('textarea').val();
                    let group = $('.modal .centerView .addContentGroup:eq(0)').find("span").text();
                    if (tester_action) handleMyAcceptOrder(self, {
                        text: "运维审核执行中",
                        tester_action: tester_action,
                        proer_action: proer_action,
                        group: group,
                    }, ident);
                    else self.baseTool.alertView("请填写完整变更记录", self.baseTool.failure);
                } else if (orderType === "运维审核执行中") {
                    let update_type = $('#update_type').text();
                    let change_content = $.trim($('#change_content').find("textarea").val());
                    let change_title = $('#changeTitle').val();
                    let reason = $('#reason').find('textarea').val();
                    let tester_action = $('#testerAction').find('textarea').val();
                    let proer_action = $('#proerAction').find('textarea').val();
                    if (change_content && change_title) handleMyAcceptOrder(self, {
                        text: "运维审核通过，已实施",
                        change_content: change_content,
                        change_title: change_title,
                        reason: reason,
                        tester_action: tester_action,
                        proer_action: proer_action,
                    }, ident);
                    else self.baseTool.alertView("请填写完整变更记录", self.baseTool.failure);
                }

            });

            // 拒绝
            $('#createCancel').on('click', function () {
                let ident = $('.modal.fade.detailView .addContentGroup').eq(0).find("i").text();
                let orderType = $.trim($("#orderType").text());
                if (orderType === "测试审核中") {
                    let tester_action = $('#testerAction').find('textarea').val();
                    let update_type = $('#update_type').text();
                    let group = $('.modal .centerView .addContentGroup:eq(0)').find("span").text();
                    if (tester_action) handleMyAcceptOrder(self, {
                        text: "测试未通过，待确认",
                        tester_action: tester_action,
                        group: group,
                    }, ident);
                    else self.baseTool.alertView("请填写完整变更记录", self.baseTool.failure);
                } else if (orderType === "产品审核中") {
                    let proderAction = $('#proerAction').find('textarea').val();
                    let tester_action = $('#testerAction').find('textarea').val();
                    let group = $('.modal .centerView .addContentGroup:eq(0)').find("span").text();
                    if (proderAction) handleMyAcceptOrder(self, {
                        text: "产品未通过，待确认",
                        tester_action: tester_action,
                        proder_action: proderAction,
                        group: group,
                    }, ident);
                    else self.baseTool.alertView("请填写完整变更记录", self.baseTool.failure);
                } else if (orderType === "运维审核执行中") {
                    let reason = $('#reason').find('textarea').val();
                    let tester_action = $('#testerAction').find('textarea').val();
                    if (reason) handleMyAcceptOrder(self, {
                        text: "运维审核未通过",
                        reason: reason,
                        tester_action: tester_action,
                    }, ident);
                    else self.baseTool.alertView("请填写完整变更记录", self.baseTool.failure);
                }
            });

            // 下载附件
            $('#downloadAppFile').on('click', downloadFiles.bind(this, FILE_TYPE_ENUM.APP_FILE));
            $('#downloadSqlFile').on('click', downloadFiles.bind(this, FILE_TYPE_ENUM.SQL_FILE));
        });
    }

    // 回据我的受理工单
    disagreeQueryOrder(self) {
        $(function () {
            $('.hostTab').delegate('.deleteBtn', 'click', function () {
                let idIndex = $(this).parent().parent().children().eq(0).find("span").text();
                handleMyAcceptOrder(self, "未通过，待确认", idIndex)
            });
        });
    }

    // 通过我的受理工单
    agreeQueryOrder(self) {
        $(function () {
            $('.hostTab').delegate('.consentBtn', 'click', function () {
                let idIndex = $(this).parent().parent().children().eq(0).find("span").text();
                handleMyAcceptOrder(self, "已通过，待确认", idIndex)
            });
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

                self.myUnHandleAcceptInfo(self, index);
                self.myHandledAcceptInfo(self, index);
            })
        });
    }

    // 获取本地数据数量
    infoTotalCount(self, cb) {
        let user = Cookies.get("ty_cmdb_user") + ":" + Cookies.get("ty_cmdb");
        let options = self.baseTool.Header();
        self.http.get(AppEnvConfig.env + "/work/orderProdTotalCount?user=" + user, options)
            .map(res => res.json())
            .subscribe(data => {
                if (data.status == 200) {
                    cb(data.result.content);
                }
            });
    }

    // 转出
    resAcceptBtn(self) {
        $(function () {
            let options = self.baseTool.Header();
            let idInfiy = '';
            self.http.get(AppEnvConfig.env + "/user/auth/userInfo?auth=2", options)
                .map(res => res.json())
                .subscribe(data => {
                    if (data.status == 200) {
                        data.result.content.forEach((data) => {
                            $('#acceptView').append('<option>' + data.name + ':' + data.uidNumber + '</option>');
                        });
                    } else {
                        self.baseTool.alertView("获取工单管理者数据失败...", self.baseTool.failure);
                    }
                });

            // 转出按钮
            $('.hostTab').delegate('.reAcceptBtn', 'click', function () {
                idInfiy = $(this).parent().parent().children().eq(0).find("span").text();
            });
            // 确认
            $('#sureBtn').on('click', function () {
                let acceptUser = $('#acceptView option:selected').text();
                let reason = $('.modal.fade.bs-example-modal-lg .noteView').val();
                let user = Cookies.get("ty_cmdb_user") + ":" + Cookies.get("ty_cmdb");
                let body = JSON.stringify({
                    accept_user_last: acceptUser,
                    id: idInfiy,
                    reason: reason,
                    user: user,
                    orderAction: "resAccept"
                });

                self.http.put(`${AppEnvConfig.env}/work/updateMyAcceptProdOrder`, body, options)
                    .map(res => res.json())
                    .subscribe(data => {
                        if (data.status == 200) {
                            self.baseTool.alertView("工单转出成功", self.baseTool.success);
                            $('.modal.fade.bs-example-modal-lg.in').click();
                            self.baseTool.refView("workOrder/myAcceptProdOrder");
                        } else {
                            self.baseTool.alertView("工单转出失败...", self.baseTool.failure);
                            $('.modal.fade.bs-example-modal-lg.in').click();
                        }
                    });
            });

            // 取消
            $('#cancleResBtn').on('click', function () {
                $('.modal.fade.bs-example-modal-lg .noteView').val("");
                $('.modal.fade.bs-example-modal-lg.in').click();
            });
        });
    }


}

// 处理工单数据
function handleOrder(self, data, type) {
    $('.conver').hide();

    if (data.status === 200) {
        self.handleOrderInfo = data.result.content;
        self.baseTool.reload(self);
        self.handleOrderInfo.forEach((item, i) => {

            if ($(".handledOrderItem").eq(i).children().eq(2).text() === "未通过，待确认") {
                $(".handledOrderItem").eq(i).children().eq(2).css("color", "red");
            } else if ($(".handledOrderItem").eq(i).children().eq(2).text() === "已通过，待确认") {
                $(".handledOrderItem").eq(i).children().eq(2).css("color", "orange");
            } else if ($(".handledOrderItem").eq(i).children().eq(2).text() === "已通过，已确认") {
                $(".handledOrderItem").eq(i).children().eq(2).css("color", "green");
            } else if ($(".handledOrderItem").eq(i).children().eq(2).text() === "未通过，已确认") {
                $(".handledOrderItem").eq(i).children().eq(2).css("color", "rgba(95, 95, 95, .6)");
            } else if ($(".handledOrderItem").eq(i).children().eq(2).text() === "测试审核中" || $(".handledOrderItem").eq(i).children().eq(2).text() === "再次提交，测试审核中" || $(".handledOrderItem").eq(i).children().eq(2).text() === "产品审核中") {
                $(".handledOrderItem").eq(i).find("div.orderType").css("backgroundColor", "#e86727");
            } else if ($(".handledOrderItem").eq(i).children().eq(2).text() === "运维审核执行中") {
                $(".handledOrderItem").eq(i).find("div.orderType").css("backgroundColor", "#0084c5");
                $(".handledOrderItem").eq(i).children().eq(5).find('button').text("审批");
            } else if ($(".handledOrderItem").eq(i).children().eq(2).text() === "运维审核通过，已实施") {
                $(".handledOrderItem").eq(i).find("div.orderType").css("backgroundColor", "#0084c5");
                $(".handledOrderItem").eq(i).children().eq(5).find('button').text("详情");
            } else if ($.trim($(".handledOrderItem").eq(i).children().eq(2).text()) === "测试未通过，待确认" || $.trim($(".handledOrderItem").eq(i).children().eq(2).text()) === "运维审核未通过" || $.trim($(".handledOrderItem").eq(i).children().eq(2).text()) === "产品未通过，待确认") {
                $(".handledOrderItem").eq(i).find("div.orderType").css("backgroundColor", "#e83619");
                $(".handledOrderItem").eq(i).children().eq(5).find('button').text("详情");
            } else if ($.trim($(".handledOrderItem").eq(i).children().eq(2).text()) === "已关单") {
                $(".handledOrderItem").eq(i).find("div.orderType").css("backgroundColor", "rgba(82, 83, 84, 0.37)");
                $(".handledOrderItem").eq(i).children().eq(5).find('button').text("详情");
            }
        });
    } else {
        self.handleOrderInfo = [];
        self.baseTool.reload(self);
    }
}

// 显示详情
function showDetail(arg, idIndex, orderType) {
    $('#downloadAppFile').hide();
    $('#downloadSqlFile').hide();
    $("#testerAction").removeAttr('disabled').hide();
    $("#proerAction").removeAttr('disabled').hide();
    $("#reason").removeAttr('disabled').hide();
    $(".modal .centerView .handleLast").hide();
    $(".modal .centerView .handle").show();

    arg.forEach((item, i) => {
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
            if (orderType === "测试审核中" || orderType === "再次提交，测试审核中") $("#testerAction").show();
            else if (orderType === "产品审核中") {
                $("#testerAction").show().find("textarea").val(item.tester_action).attr('disabled', 'disabled');
                $("#proerAction").show();
            }
            else if (orderType === "运维审核执行中") {
                $("#testerAction").show().find("textarea").val(item.tester_action).attr('disabled', 'disabled');
                $("#proerAction").show().find("textarea").val(item.proer_action).attr('disabled', 'disabled');
                $("#reason").show();
                $(".modal .centerView .handleLast").show();
            }
            else if (orderType === "运维审核通过，已实施") {
                $(".modal .centerView .handle").hide();
            }
            else if (orderType === "测试未通过，待确认") {
                $("#testerAction").show().find("textarea").val(item.tester_action).attr('disabled', 'disabled');
                $(".modal .centerView .handle").hide();
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
            $('.modal.fade.detailView .addContentGroup').eq(14).find("span").text(item.order_type);

            if (item.update_type === 0) $("#proerAction").hide();

            return;
        }
    });
}

// 处理工单
function handleMyAcceptOrder(self, type, ident) {
    $('#createCancel').attr('disabled', 'disabled');
    $('#createSure').attr('disabled', 'disabled');
    let options = self.baseTool.Header();
    let user = Cookies.get("ty_cmdb_user") + ":" + Cookies.get("ty_cmdb");
    let queryBody = {
        user: user,
        active: type.text,
        id: ident,
        group: type.group,
    };
    if (type.hasOwnProperty("tester_action")) queryBody["tester_action"] = type.tester_action;
    if (type.hasOwnProperty("proer_action")) queryBody["proer_action"] = type.proer_action;
    if (type.hasOwnProperty("reason")) queryBody["reason"] = type.reason;
    if (type.hasOwnProperty("change_content")) queryBody["change_content"] = type.change_content;
    if (type.hasOwnProperty("change_title")) queryBody["change_title"] = type.change_title;
    let body = JSON.stringify(queryBody);


    self.http.put(`${AppEnvConfig.env}/work/updateMyAcceptProdOrder`, body, options)
        .map(res => res.json())
        .subscribe(data => {
            $('#createCancel').removeAttr('disabled');
            $('#createSure').removeAttr('disabled');
            if (data.status === 200) {
                self.baseTool.alertView("更新工单状态成功", self.baseTool.success);
                $('.modal.fade.detailView.in').click();
                self.baseTool.refView("workOrder/myAcceptProdOrder");
            } else {
                let msg = '';
                if (data.hasOwnProperty("msg")) msg = data.msg;
                self.baseTool.alertView("更新工单状态失败, " + msg, self.baseTool.failure);
                $('.modal.fade.detailView.in').click();
            }
        });
}

// 下载
function downloadFiles(FILE_TYPE_ENUM) {
    let idStr = $('#sign').text();
    location.href = `${AppEnvConfig.env}/work/donwloadFiles?type=${FILE_TYPE_ENUM}&id=${idStr}`;
}
