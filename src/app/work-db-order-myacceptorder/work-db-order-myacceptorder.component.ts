import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import{ActivatedRoute, Router, Params}from'@angular/router';
import {Http, Headers, RequestOptions} from '@angular/http';
import {AppEnvConfig} from '../../assets/conf/envConfig';
import {BaseTool} from '../../assets/baseTool';
import "rxjs/add/operator/map";
import {log} from "util";
import {Maps} from "../../assets/baseTool/maps";

declare const $: any;    // jquery
declare const Cookies;    // cookie
'use strict';

const FILE_TYPE_ENUM = {    // 文件类型枚举
    APP_FILE: "app_file",
    SQL_FILE: "sql_file",
};

@Component({
    selector: 'app-work-db-order-myacceptorder',
    templateUrl: './work-db-order-myacceptorder.component.html',
    styleUrls: ['./work-db-order-myacceptorder.component.css']
})
export class WorkDbOrderMyacceptorderComponent implements OnInit {

    private baseTool: any;    // 工具函数
    public orderInfo: any;    // 我的工单数据
    constructor(private route: ActivatedRoute, private http: Http, private cdr: ChangeDetectorRef) {
        this.baseTool = BaseTool.sharedBaseTool();    // 工具函数
        this.baseTool.handleAuth(this, '2');    // 处理权限
        this.workOrderHandledInfo();    // 获取工单数据

    }

    ngOnInit() {
        this.handledOrderDetail(this);    // 处理我的已解决工单数据
        this.pageation(this);    // 分页
        this.showDetailView();    // 详情按钮
    }


    // 工单数据处理
    workOrderHandledInfo(index = 0) {
        $('.conver').show();
        let options = this.baseTool.Header();
        let user = Cookies.get("ty_cmdb_user") + ":" + Cookies.get("ty_cmdb");
        this.http.get(AppEnvConfig.env + "/work/workOrderDBInfo?index=" + index, options)
            .map(res => res.json())
            .subscribe(data => handleInfo(this, data));
    }

    // 工单详情
    handledOrderDetail(self) {
        $(function () {
            $('.hostTab').delegate('.detailBtn', 'click', function () {
                let idIndex = $(this).parent().parent().children().eq(0).find("span").text();
                $('.modal .handleBtn').hide();
                $('#downloadSqlFile').hide();
                $('.modal.fade.detailView .addContentGroup').eq(8).find("textarea").attr('disabled', 'disabled');
                self.orderInfo.forEach((item, i) => {
                    if (item.id == idIndex) {

                        let sql_file = item.sql_file;
                        if (sql_file) {
                            sql_file = sql_file.substring(sql_file.lastIndexOf("%^") + 2);
                            $('#downloadSqlFile').show();
                        }
                        $('.modal.fade.detailView .addContentGroup').eq(0).find("span").text(item.schema_name);
                        $('.modal.fade.detailView .addContentGroup').eq(0).find("i").text(item.id);
                        $('.modal.fade.detailView .addContentGroup').eq(1).find("span").text(item.update_target);
                        $('.modal.fade.detailView .addContentGroup').eq(2).find("span").text(item.update_type);
                        $('.modal.fade.detailView .addContentGroup').eq(3).find("span").text(item.update_note);
                        $('.modal.fade.detailView .addContentGroup').eq(4).find("span").text(item.handle_time);
                        $('.modal.fade.detailView .addContentGroup').eq(5).find("span").text(item.order_type);
                        $('.modal.fade.detailView .addContentGroup').eq(6).find("textarea").val(item.work_order_timeline);
                        $('.modal.fade.detailView .addContentGroup').eq(7).find("span").text(sql_file);
                        $('.modal.fade.detailView .addContentGroup').eq(8).find("textarea").val(item.reason);


                        if (item.order_type === "待处理" || item.order_type === "再次提交") {
                            $('.modal .handleBtn').show();
                            $('.modal.fade.detailView .addContentGroup').eq(8).find("textarea").removeAttr('disabled');
                        }
                        return;
                    }
                });
            });

            // 关闭按钮
            $('.modal.fade.detailView .closeBtn').on('click', function () {
                $('.modal.fade.detailView.in').click();
            });


            // 通过
            $('#handleAcBtn').on('click', function () {
                let id = $('.modal.fade.detailView .addContentGroup').eq(0).find("i").text();
                let user = Cookies.get("ty_cmdb_user") + ":" + Cookies.get("ty_cmdb");
                let reason = $('#reason').val();
                $('#handleAcBtn').attr("disabled", "disabled");
                handleMyAcceptOrder(self, "已通过，待确认", () => $('#handleAcBtn').removeAttr("disabled"));
            });

            // 回据
            $('#reSentBtn').on('click', function () {
                let id = $('.modal.fade.detailView .addContentGroup').eq(0).find("i").text();
                let user = Cookies.get("ty_cmdb_user") + ":" + Cookies.get("ty_cmdb");
                let reason = $('#reason').val();
                $('#reSentBtn').attr("disabled", "disabled");
                handleMyAcceptOrder(self, "未通过", () => $('#reSentBtn').removeAttr("disabled"));

            });

            // 下载附件
            $('#downloadSqlFile').on('click', downloadFiles.bind(this, FILE_TYPE_ENUM.SQL_FILE));
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
        let user = Cookies.get("ty_cmdb_user") + ":" + Cookies.get("ty_cmdb");
        self.http.get(AppEnvConfig.env + "/work/workOrderDBInfoCount?user=" + user, options)
            .map(res => res.json())
            .subscribe(data => {
                if (data.status == 200) {
                    cb(data.result.content);
                }
            });
    }

    // 详情按钮
    showDetailView() {
        $(function () {
            $('.hostTab').delegate('.detailBtn', 'click', function () {
                let text = $(this).parent().parent().children().eq(1).find('span').text();
                if (text === "已通过，已确认" || text === "未通过，已确认") {
                    $("#handleAcBtn").hide();
                    $("#reSentBtn").hide();
                } else {
                    $("#handleAcBtn").show();
                    $("#reSentBtn").show();
                }
            });
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
            if (item.order_type === "待处理" || item.order_type === "再次提交") {
                $(".hostItem").eq(i).find("div.orderType").css("backgroundColor", "#e86727");
                $(".hostItem").eq(i).children().eq(7).find("button").text("审批");
            } else if (item.order_type === "未通过") {
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
    location.href = `${AppEnvConfig.env}/work/donwloadDBFiles?type=${FILE_TYPE_ENUM}&id=${idStr}`;
}

// 处理工单
function handleMyAcceptOrder(self, type, cb) {

    let options = self.baseTool.Header();
    let id = $('.modal.fade.detailView .addContentGroup').eq(0).find("i").text();
    let user = Cookies.get("ty_cmdb_user") + ":" + Cookies.get("ty_cmdb");
    let reason = $('#reason').val();
    let body = JSON.stringify({
        action: type,
        accept_user_last: user,
        accept_user: "运维组",
        reason: reason,
        id: id,
    });

    self.http.put(AppEnvConfig.env + "/work/updateDbOrder", body, options)
        .map(res => res.json())
        .subscribe(data => {
            if (cb) cb();
            if (data.status === 200) {
                self.baseTool.alertView("更新工单状态成功", self.baseTool.success);
                $('.modal.fade.detailView.in').click();
                self.baseTool.refView("workOrder/myAcceptDBOrder");
            } else {
                self.baseTool.alertView("更新工单状态失败，请稍后再试...", self.baseTool.failure);
                $('.modal.fade.detailView.in').click();
            }
        });
}
