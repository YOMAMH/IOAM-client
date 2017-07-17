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

let DATASET = [];    // 缓存数据库列表数据

const FILE_TYPE_ENUM = {    // 文件类型枚举
    APP_FILE: "app_file",
    SQL_FILE: "sql_file",
};

@Component({
    selector: 'app-work-db-manage',
    templateUrl: './work-db-manage.component.html',
    styleUrls: ['./work-db-manage.component.css']
})
export class WorkDbManageComponent implements OnInit {

    private baseTool: any;    // 工具函数
    public orderInfo: any;    // 我的工单数据
    constructor(private route: ActivatedRoute, private http: Http, private cdr: ChangeDetectorRef) {
        this.baseTool = BaseTool.sharedBaseTool();    // 工具函数
        this.workOrderHandledInfo();    // 获取我的已解决工单数据
        this.selecter();    // 获取数据库列表

    }

    ngOnInit() {
        this.handledOrderDetail(this);    // 处理我的已解决工单数据
        this.pageation(this);    // 分页
        this.addOrders(this);    // 新增工单
    }


    // 工单数据处理
    workOrderHandledInfo(index = 0) {
        $('.conver').show();
        let options = this.baseTool.Header();
        let user = Cookies.get("ty_cmdb_user") + ":" + Cookies.get("ty_cmdb");
        this.http.get(AppEnvConfig.env + "/work/workOrderDBInfo?index=" + index + "&user=" + user, options)
            .map(res => res.json())
            .subscribe(data => handleInfo(this, data));
    }

    // 已处理工单详情
    handledOrderDetail(self) {
        $(function () {
            $('.hostTab').delegate('.detailBtn', 'click', function () {
                let idIndex = $(this).parent().parent().children().eq(0).find("span").text();
                $('.modal .handleBtn').hide();
                $('#downloadSqlFile').hide();
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
                        $('.modal.fade.detailView .addContentGroup').eq(4).find("textarea").val(item.update_step);
                        $('.modal.fade.detailView .addContentGroup').eq(5).find("span").text(item.handle_time);
                        $('.modal.fade.detailView .addContentGroup').eq(6).find("span").text(item.order_type);
                        $('.modal.fade.detailView .addContentGroup').eq(7).find("textarea").val(item.work_order_timeline);
                        $('.modal.fade.detailView .addContentGroup').eq(8).find("span").text(sql_file);

                        if (item.order_type === "未通过" || item.order_type === "已通过，待确认") {
                            $('.modal .handleBtn').show();
                            if (item.order_type === "已通过，待确认") $('#reSentBtn').hide();
                            else $('#reSentBtn').show();
                        }
                        return;
                    }
                });
            });

            // 关闭按钮
            $('.modal.fade.detailView .closeBtn').on('click', function () {
                $('.modal.fade.detailView.in').click();
            });


            // 确认
            $('#handleAcBtn').on('click', function () {
                let id = $('.modal.fade.detailView .addContentGroup').eq(0).find("i").text();
                let user = Cookies.get("ty_cmdb_user") + ":" + Cookies.get("ty_cmdb");
                let body = {
                    id: id,
                    order_type: "已关单",
                    accept_user_last: user,
                    user: user
                };
                let options = self.baseTool.formHeader();
                $('#handleAcBtn').attr('disabled', 'disabled');
                let formData = new FormData();
                formData = formate(body, formData);

                self.http.put(AppEnvConfig.env + "/work/manageHandledDbOrder", formData, options)
                    .map(res => res.json())
                    .subscribe(data => {
                        $('#handleAcBtn').removeAttr('disabled');
                        if (data.status == 200) {
                            self.baseTool.successView("提交成功");
                            $('.modal.fade.detailView.in').click();
                            self.baseTool.refView("workOrder/handedleOrder");
                        } else {
                            self.baseTool.failureView("提交失败，请稍后再试...");
                            $('.modal.fade.detailView.in').click();
                        }
                    });
            });

            // 再次提交
            $('#reSentBtn').on('click', function () {
                let id = $('.modal.fade.detailView .addContentGroup').eq(0).find("i").text();
                let schema_name = $('.modal.fade.detailView .addContentGroup').eq(0).find("span").text();
                let update_target = $('.modal.fade.detailView .addContentGroup').eq(1).find("span").text();
                let update_type = $('.modal.fade.detailView .addContentGroup').eq(2).find("span").text();
                let update_note = $('.modal.fade.detailView .addContentGroup').eq(3).find("span").text();
                let update_step = $('.modal.fade.detailView .addContentGroup').eq(4).find("textarea").val();
                $('#addOrderType').text(id);

                if (update_type === "增加新库") {
                    $('.orderContainer .orderItem:eq(0) select option').removeAttr('selected');
                    $('.orderContainer .orderItem:eq(0) select option:eq(0)').attr('selected', 'selected');
                    $('.orderContainer .orderItem:eq(3)').fadeIn().find('input').val(schema_name);
                } else {
                    resentView($('.orderContainer .orderItem:eq(0) select option'), schema_name);
                }

                resentView($('.orderContainer .orderItem:eq(1) select option'), update_target);
                resentView($('.orderContainer .orderItem:eq(2) select option'), update_type);
                $('.orderContainer .orderItem:eq(4) input').val(update_note);
                $('.orderContainer .orderItem:eq(5) textarea').val(update_step);
                $('.modal.fade.detailView.in').click();
                $('.orderMainContainer').animate({left: "-100%"}, function () {
                    $('.mainPage .orderContainer').show();
                    $('.mainPage .hostContainer').hide();
                });

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


    selecter() {
        let options = this.baseTool.Header();
        this.http.get(AppEnvConfig.env + "/work/orderDbListInfo", options)
            .map(res => res.json())
            .subscribe(data => {
                if (data.status === 200) {
                    if (DATASET.length < 1) {
                        DATASET = data.result.content;
                    }
                    let opStr = '<option value="无">无</option>';
                    DATASET.forEach(item => {
                        opStr += `<option value="${item.name}">${item.name}</option>`;
                    });
                    $(".hostTab .orderItem:eq(0) select").html(opStr);
                }

            });
        $(function () {
            $("#newDataBase").fadeOut();
            // 注册数据库变更类型
            $("#dbChangeType").on("change", function () {
                if ($(this).val() === "增加新库") {
                    $("#newDataBase").fadeIn();
                    $('.orderBox .orderItem:eq(0) select option:eq(0)').removeAttr("selected");
                    $('.orderBox .orderItem:eq(0) select option:eq(0)').attr("selected", "selected");
                    $('.orderBox .orderItem:eq(1) select option:eq(0)').removeAttr("selected");
                    $('.orderBox .orderItem:eq(1) select option:eq(2)').attr("selected", "selected");
                } else {
                    $("#newDataBase").fadeOut();
                }

            });

        });

    }

    // 新增工单
    addOrders(self) {

        // 应用工单
        $('#createDbOrder').on('click', function () {
            $('.orderMainContainer').animate({left: "-100%"}, function () {
                $('.mainPage .orderContainer').show();
                $('.mainPage .hostContainer').hide();
            });

        });

        // 返回工单主页
        $('.orderContainer .title .backBtn').on('click', function () {
            $('.orderMainContainer').animate({left: "0"}, function () {
                $('.mainPage .hostContainer').show();
                $('.mainPage .orderContainer').hide();
            });
        });

        // 提交应用工单
        $('#commitBtn').on('click', () => {
            let schema_name = "";    // 名称
            let update_target = $('.orderBox .orderItem:eq(1) select option:selected').val();    // 升级对象
            let update_type = $('.orderBox .orderItem:eq(2) select option:selected').val();    // 升级类型
            let update_note = $('.orderBox .orderItem:eq(4) input').val();    // 操作备注
            let update_step = $('.orderBox .orderItem:eq(5) textarea').val();    // 操作步骤
            let send_user = Cookies.get("ty_cmdb_user") + ":" + Cookies.get("ty_cmdb");   // 工单提交人
            if (update_type === "增加新库") schema_name = $('.orderBox .orderItem:eq(3) input').val();
            else schema_name = $('.orderBox .orderItem:eq(0) select option:selected').val();
            let order_flag = $("#addOrderType").text();
            let updateBody = {
                schema_name: schema_name,
                update_target: update_target,
                update_type: update_type,
                update_note: update_note,
                update_step: update_step,
                send_user: send_user,
                order_type: "待处理",
                accept_user: "运维组",
                accept_user_last: "",
            };


            let formData = new FormData();
            let options = self.baseTool.formHeader();
            if (order_flag) {
                $('#commitBtn').attr("disabled", "disabled");
                updateBody.order_type = "再次提交";
                updateBody["id"] = order_flag;
                formData = formate(updateBody, formData);
                if ($('#sql_file')[0].files[0]) formData.append('sql_file', $('#sql_file')[0].files[0]);

                self.http.put(AppEnvConfig.env + "/work/manageHandledDbOrder", formData, options)
                    .map(res => res.json())
                    .subscribe(data => {
                        if (data.status == 200) {
                            $('#commitBtn').removeAttr("disabled");
                            $("#addOrderType").text("");
                            self.baseTool.successView("提交成功");
                            $('.modal.fade.detailView.in').click();
                            self.baseTool.refView("workOrder/handledProdOrder");
                        } else {
                            self.baseTool.failureView("提交失败，请稍后再试...");
                            $('.modal.fade.detailView.in').click();
                        }
                    });
            } else {
                formData = formate(updateBody, formData);
                if ($('#sql_file')[0].files[0]) formData.append('sql_file', $('#sql_file')[0].files[0]);

                $('#commitBtn').attr("disabled", "disabled");
                self.http.post(`${AppEnvConfig.env}/work/createDbOrder`, formData, options)
                    .map(res => res.json())
                    .subscribe(data => {
                        $('#commitBtn').removeAttr("disabled");
                        if (data.status == 200) {
                            self.baseTool.successView("提交成功");
                            self.baseTool.refView("workOrder/workDbOrder");
                        } else {
                            let msg = '';
                            if (data.hasOwnProperty("msg")) msg = data.msg;
                            self.baseTool.failureView("提交失败，" + msg);
                        }
                    });
            }

        });

        // 重置
        $('#resetBtn').on('click', () => {
            $('.orderBox .orderItem:eq(0) select option:eq(0)').removeAttr("selected");
            $('.orderBox .orderItem:eq(0) select option:eq(0)').attr("selected", "selected");
            $('.orderBox .orderItem:eq(1) select option:eq(0)').removeAttr("selected");
            $('.orderBox .orderItem:eq(1) select option:eq(0)').attr("selected", "selected");
            $('.orderBox .orderItem:eq(2) select option:eq(0)').removeAttr("selected");
            $('.orderBox .orderItem:eq(2) select option:eq(0)').attr("selected", "selected");
            $("#newDataBase").val("").fadeOut();
            $('.orderBox .orderItem:eq(4) input').val("无");
            $('.orderBox .orderItem:eq(5) textarea').val("");
            $('.orderBox .orderItem:eq(6) input').val("");
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

// formate
function formate(obj, data) {
    Object.keys(obj).forEach(item => {
        data.append(item, obj[item])
    });
    return data;
}

function resentView(dom, change_type) {
    for (let i = 0; i < dom.length; i++) {
        if ($(dom[i]).val() === change_type) {
            $(dom[i]).attr("selected", "selected").siblings().removeAttr("selected");
            return;
        }
    }
}

// 下载
function downloadFiles(FILE_TYPE_ENUM) {
    let idStr = $('#sign').text();
    location.href = `${AppEnvConfig.env}/work/donwloadDBFiles?type=${FILE_TYPE_ENUM}&id=${idStr}`;
}