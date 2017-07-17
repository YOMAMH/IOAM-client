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

let DATASET = {};    // 缓存下拉数据

// 文件类型枚举
const FILE_TYPE_ENUM = {
    APP_FILE: "app_file",
    SQL_FILE: "sql_file",
};

@Component({
    selector: 'app-work-apporder-manage',
    templateUrl: './work-apporder-manage.component.html',
    styleUrls: ['./work-apporder-manage.component.css']
})
export class WorkApporderManageComponent implements OnInit {

    private baseTool: any;    // 工具函数
    public orderInfo: any;    // 我的工单数据
    constructor(private route: ActivatedRoute, private http: Http, private cdr: ChangeDetectorRef) {
        this.baseTool = BaseTool.sharedBaseTool();    // 工具函数
        this.workOrderHandledInfo();    // 获取我的应用工单数据

    }

    ngOnInit() {
        this.handledOrderDetail(this);    // 处理我的已解决工单数据
        this.pageation(this);    // 分页
        this.selecter();    // 三级联动
        this.addOrders(this);    // 新增工单
        this.silviomoreto(this);    // 多选
        this.tingyunProductions();    // 听云产品线二级联动
        this.addWorkOrder(this);    // 获取2级以上权限用户
    }

    addWorkOrder(self) {
        // 确认按钮
        $('#createSure').on('click', function () {
            let title = $('.addContentTitle input').val();    // 主题
            let change_type = $('.queryType  option:selected').val();    // 申请类型
            let query_type = $('.typeView option:selected').val();   // 产品源
            let query_type1 = $('.typeView1 option:selected').val();   // 产品类型
            let tag = $('.tagView option:selected').val();    // 业务组
            let zone = $('.ZoneView option:selected').val();    // 机房
            let accept = $('.orderForPerson option:selected').text();   // 受理人
            let firstLive = $('.firstList option:selected').val();    // 优先级
            let str = $('.noteView').val();    // 备注
            let change_instance_name = $('.filter-option.pull-left').html();    // 实例名称
            let argObj = {
                title: title,
                type: "未处理",
                reason: "",
                query_type: `${query_type} / ${query_type1}`,
                tag: tag,
                zone: zone,
                note: str,
                accept: accept,
                firstLive: firstLive,
                send_user: Cookies.get("ty_cmdb_user") + ":" + Cookies.get("ty_cmdb"),
                accept_user: accept,
                accept_user_last: accept,
                priority: firstLive,
                change_type: change_type,
                change_instance_name: change_instance_name === "Nothing selected" ? "" : change_instance_name,
            };

            if (argObj.title) {
                if (!argObj.change_instance_name && (argObj.change_type === "updateHostOS" || argObj.change_type === "updateHost")) {
                    self.baseTool.alertView("请填写完整工单", self.baseTool.failure);
                    return false
                }
                $('#createSure').attr("disabled", "disabled");
                let body = JSON.stringify(argObj);
                let options = self.baseTool.Header();
                self.http.post(AppEnvConfig.env + "/work/createOrder", body, options)
                    .map(res => res.json())
                    .subscribe(data => {
                        $('#createSure').removeAttr("disabled");
                        if (data.status == 200) {
                            self.baseTool.successView("提交成功");
                            $('.modal.fade.bs-example-modal-lg.in').click();
                            setTimeout(function () {
                                location.href = "/#/workOrder/handedleOrder";
                            }, 2000);
                        } else {
                            self.baseTool.failureView("提交失败，请稍后再试...");
                            $('.modal.fade.bs-example-modal-lg.in').click();
                        }
                    });
            } else {
                self.baseTool.alertView("请填写完整工单", self.baseTool.failure);
            }

        });

        // 取消按钮
        $('#createCancel').on('click', function () {
            $('.addContentTitle input').val("");    // 主题
            $('.noteView').val("");    // 备注
            $('.filter-option.pull-left').html("");
            $('.modal.fade.bs-example-modal-lg.in').click();
        });

    }

    // 工单数据处理
    workOrderHandledInfo(index = 0) {
        $('.conver').show();
        let options = this.baseTool.Header();
        let user = Cookies.get("ty_cmdb_user") + ":" + Cookies.get("ty_cmdb");
        this.http.get(AppEnvConfig.env + "/work/workProdOrderInfo?index=" + index + "&user=" + user, options)
            .map(res => res.json())
            .subscribe(data => handleInfo(this, data));
    }

    // 工单详情
    handledOrderDetail(self) {
        $(function () {
            $('.hostTab').delegate('.detailBtn', 'click', function () {
                let idIndex = $(this).parent().parent().children().eq(0).find("span").text();
                let orderType = $(this).parent().parent().children().eq(3).find("span").text();
                let updateType = $(this).parent().parent().children().eq(2).text();

                $('#reason').hide().find("textarea").attr('disabled', 'disabled');
                $('#change_content').find("textarea").attr('disabled', 'disabled').hide();
                $('#changeTitle').attr('disabled', 'disabled').hide();
                $('#downloadAppFile').hide();
                $('#downloadSqlFile').hide();
                $('#testerAction').hide().find("textarea").attr('disabled', 'disabled');
                $('#proerAction').hide().find("textarea").attr('disabled', 'disabled');
                $('#handleAcBtn').hide();
                $('#reSentBtn').hide();
                $('.modal.fade.detailView .addContentGroup').eq(2).find("input").attr('disabled', 'disabled');
                $('.modal.fade.detailView .addContentGroup').eq(3).find("input").attr('disabled', 'disabled');
                $('.modal.fade.detailView .addContentGroup').eq(4).find("input").attr('disabled', 'disabled');

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
                        $('.modal.fade.detailView .addContentGroup').eq(2).find("i").text(item.update_type);
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
                        $('.modal.fade.detailView .addContentGroup').eq(13).find("span").text(item.order_type);
                        $('.modal.fade.detailView .addContentGroup').eq(14).find("span").text(item.accept_user_last);
                        $('#reason').find("textarea").val(item.reason);
                        $('#testerAction').find("textarea").val(item.tester_action);
                        $('#proerAction').find("textarea").val(item.proer_action);
                        if (orderType === "运维审核通过，已实施") {
                            $('#testerAction').show();
                            $('#reason').show();
                            $('#handleAcBtn').show();

                            if (updateType === "产品发布") $('#proerAction').show();
                        } else if (orderType === "测试未通过，待确认" || orderType === "运维审核未通过" || orderType === "产品未通过，待确认") {
                            $('.modal.fade.detailView .addContentGroup').eq(2).find("input").removeAttr('disabled');
                            $('.modal.fade.detailView .addContentGroup').eq(3).find("input").removeAttr('disabled');
                            $('.modal.fade.detailView .addContentGroup').eq(4).find("input").removeAttr('disabled');
                            $('#reSentBtn').show();
                        } else if (orderType === "运维审核执行中") {
                            $('#testerAction').show();
                            if (updateType === "产品发布") $('#proerAction').show();
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
                let group = $('.modal.fade.detailView .addContentGroup').eq(0).find("span").text();
                let user = Cookies.get("ty_cmdb_user") + ":" + Cookies.get("ty_cmdb");
                let body = JSON.stringify({
                    id: id,
                    order_type: "已关单",
                    user: user,
                    group: group,
                });
                let options = self.baseTool.Header();

                self.http.put(AppEnvConfig.env + "/work/manageHandledProdOrder", body, options)
                    .map(res => res.json())
                    .subscribe(data => {
                        if (data.status == 200) {
                            self.baseTool.successView("提交成功");
                            $('.modal.fade.detailView.in').click();
                            self.baseTool.refView("workOrder/handledProdOrder");
                        } else {
                            self.baseTool.failureView("提交失败，请稍后再试...");
                            $('.modal.fade.detailView.in').click();
                        }
                    });
            });

            // 下载附件
            $('#downloadAppFile').on('click', downloadFiles.bind(this, FILE_TYPE_ENUM.APP_FILE));
            $('#downloadSqlFile').on('click', downloadFiles.bind(this, FILE_TYPE_ENUM.SQL_FILE));

            // 再次提交
            $('#reSentBtn').on('click', function () {
                let id = $('.modal.fade.detailView .addContentGroup').eq(0).find("i").text();
                $("#addOrderType").text(id);
                let pro_type = $('.modal.fade.detailView .addContentGroup').eq(0).find("span").text();
                let pro_name = $('.modal.fade.detailView .addContentGroup').eq(1).find("span").text();
                let updateType = $('.modal.fade.detailView .addContentGroup').eq(2).find("i").text();
                let update_verson = $('.modal.fade.detailView .addContentGroup').eq(3).find("span").text();
                let jenkins_name = $('.modal.fade.detailView .addContentGroup').eq(4).find("span").text();
                let build_num = $('.modal.fade.detailView .addContentGroup').eq(5).find("span").text();
                let change_content = $('.modal.fade.detailView .addContentGroup').eq(6).find("textarea").val();
                let conf_update = $('.modal.fade.detailView .addContentGroup').eq(7).find("textarea").val();
                let update_depend = $('.modal.fade.detailView .addContentGroup').eq(8).find("textarea").val();


                resentView($('.orderContainer .orderItem:eq(0) select option'), pro_type);
                resentView($('.orderContainer .orderItem:eq(1) select option'), pro_name);
                resentView($('.orderContainer .orderItem:eq(2) select option'), updateType);
                $('.orderContainer .orderItem:eq(3) input').val(update_verson);
                $('.orderContainer .orderItem:eq(4) input').val(build_num);
                $('.orderContainer .orderItem:eq(5) input').val(jenkins_name);
                $('.orderContainer .orderItem:eq(6) textarea').val(change_content);
                $('.orderContainer .orderItem:eq(7) textarea').val(conf_update);
                $('.orderContainer .orderItem:eq(8) textarea').val(update_depend);
                $('.modal.fade.detailView.in').click();
                $('.orderMainContainer').animate({left: "-100%"}, function () {
                    $('.mainPage .orderContainer').show();
                    $('.mainPage .hostContainer').hide();
                });


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

                self.workOrderHandledInfo(index);
            })
        });
    }

    // 获取本地数据数量
    infoTotalCount(self, cb) {
        let options = self.baseTool.Header();
        let user = Cookies.get("ty_cmdb_user") + ":" + Cookies.get("ty_cmdb");
        self.http.get(AppEnvConfig.env + "/work/handledProdOrderInfoCount?user=" + user, options)
            .map(res => res.json())
            .subscribe(data => {
                if (data.status == 200) {
                    cb(data.result.content);
                }
            });
    }


    // 三级联动
    selecter() {
        $('select.typeView').on('change', function () {
            let dataSet = Maps.selectArr[$(this).val()];
            let zoneSet = Maps.zoneMap[$(this).val()];
            let childenStr = '';
            let zoneStr = '<option value="all">不限</option>';
            dataSet.forEach(data => {
                childenStr += `<option value="${data.val}">${data.text}</option>`
            });
            zoneSet.forEach(data => {
                zoneStr += `<option value="${data.val}">${data.text}</option>`
            });
            $('select.typeView1').html(childenStr);
            $('select.ZoneView').html(zoneStr);
        });
    }

    // 新增工单
    addOrders(self) {

        // 应用工单
        $('ul.dropdown-menu li:eq(0)').on('click', function () {
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
            let pro_type = $('.orderBox .orderItem:eq(0) select option:selected').val();    // 业务类别
            let pro_name = $('.orderBox .orderItem:eq(1) select option:selected').val();    // 应用名称
            let update_type = $('.orderBox .orderItem:eq(2) select option:selected').val();    // 升级类型
            let update_verson = $('.orderBox .orderItem:eq(3) input').val();    // 迭代版本
            let jenkins_name = $('.orderBox .orderItem:eq(4) input').val();    // jenkins名称
            let build_num = $('.orderBox .orderItem:eq(5) input').val();    // Build Num
            let change_content = $('.orderBox .orderItem:eq(6) textarea').val();    // 升级功能列表
            let conf_update = $('.orderBox .orderItem:eq(7) textarea').val();    // 配置文件修改
            let update_depend = $('.orderBox .orderItem:eq(8) textarea').val();    // 升级依赖描述
            let send_user = Cookies.get("ty_cmdb_user") + ":" + Cookies.get("ty_cmdb");   // 工单提交人
            let accept_user = $('.orderForPerson1 option:selected').text();   // 受理人
            let order_type = "测试审核中";    // 工单状态
            let order_flag = $("#addOrderType").text();
            let updateBody = {
                pro_type: pro_type,
                pro_name: pro_name,
                update_type: update_type,
                update_verson: update_verson,
                jenkins_name: jenkins_name,
                build_num: build_num,
                change_content: change_content,
                conf_update: conf_update,
                update_depend: update_depend,
                send_user: send_user,
                accept_user: accept_user,
                order_type: order_type,
                accept_user_last: accept_user,
            };


            let formData = new FormData();
            if ($('#app_file')[0].files[0]) formData.append('app_file', $('#app_file')[0].files[0]);
            if ($('#sql_file')[0].files[0]) formData.append('sql_file', $('#sql_file')[0].files[0]);

            let options = self.baseTool.formHeader();
            $('#commitBtn').attr("disabled", "disabled");
            if (order_flag) {
                updateBody.order_type = "再次提交，测试审核中";
                updateBody["id"] = order_flag;
                formData = formate(updateBody, formData);

                self.http.put(AppEnvConfig.env + "/work/manageHandledProdOrder", formData, options)
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
                self.http.post(`${AppEnvConfig.env}/work/createProdOrder`, formData, options)
                    .map(res => res.json())
                    .subscribe(data => {
                        $('#commitBtn').removeAttr("disabled");
                        if (data.status == 200) {
                            self.baseTool.successView("提交成功");
                            self.baseTool.refView("workOrder/handledProdOrder");
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
            $('.orderBox .orderItem:eq(0) select').val("tingyun_netop");
            let dataSet = DATASET["tingyun_netop"];
            let childenStr = '';
            dataSet.forEach(data => {
                childenStr += `<option value="${data.node_name}">${data.name}</option>`
            });
            $('.orderItem:eq(1) select').html(childenStr);
            $('.orderBox .orderItem:eq(2) select').val("0");
            $('.orderBox .orderItem:eq(3) input').val("无");
            $('.orderBox .orderItem:eq(4) input').val("无");
            $('.orderBox .orderItem:eq(5) input').val("无");
            $('.orderBox .orderItem:eq(6) textarea').val("无");
            $('.orderBox .orderItem:eq(7) textarea').val("无");
            $('.orderBox .orderItem:eq(8) textarea').val("无");
            $('.orderBox .orderItem:eq(9) input').val("");
            $('.orderBox .orderItem:eq(10) input').val("");
            $('.orderBox .orderItem:eq(11) select').val("0");
        });
    }

    // 多选
    silviomoreto(self) {
        // 网络请求
        otherNetwork(self);

        // 为每个select选项框注册事件
        $('.typeView').on('change', otherNetwork.bind(this, self));
        $('.typeView1').on('change', otherNetwork.bind(this, self));
        $('.tagView').on('change', otherNetwork.bind(this, self));
        $('.ZoneView').on('change', otherNetwork.bind(this, self));
    }

    //tingyunProductions
    tingyunProductions() {
        Maps.porderctMap(this, (data) => {
            // 初始化下拉列表
            DATASET = data;
            let childrenFeast = '';
            Object.keys(data).forEach(item => {
                if (item === "tingyun_netop") {
                    childrenFeast += `<option value="${item}" selected="selected">${item}</option>`;
                } else {
                    childrenFeast += `<option value="${item}">${item}</option>`;
                }
            });
            $('.orderItem:eq(0) select').html(childrenFeast);
            let dataSet = data["tingyun_netop"];
            let childenStr = '';
            if (dataSet instanceof Array) {
                dataSet.forEach(data => {
                    childenStr += `<option value="${data.node_name}">${data.name}</option>`;
                });
                $('.orderItem:eq(1) select').html(childenStr);
            }

            // 响应下拉列表改变事件
            $('.orderItem:eq(0) select').on('change', function () {
                dataSet = data[$(this).val()];
                childenStr = "";
                dataSet.forEach(data => {
                    childenStr += `<option value="${data.name}">${data.name}</option>`
                });
                $('.orderItem:eq(1) select').html(childenStr);
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
            if (item.order_type === "已通过，已关单") {
                $(".hostItem").eq(i).children().eq(2).css("color", "green").find("i")
                    .addClass("fa-check-circle-o").show();
            } else if (item.order_type === "未通过，已关单") {
                $(".hostItem").eq(i).children().eq(2).css("color", "red").find("i")
                    .addClass("fa-ban").show();
            } else if (item.order_type === "再次提交") {
                $(".hostItem").eq(i).children().eq(2).css("color", "#673ab7");
            } else if (item.order_type === "测试审核中" || item.order_type === "再次提交，测试审核中" || item.order_type === "产品审核中") {
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

            if (item.update_type === 0) {
                $(".hostItem").eq(i).children().eq(2).text("修复bug");
            } else if (item.update_type === 1) {
                $(".hostItem").eq(i).children().eq(2).text("产品发布");
            }

        });
        $('.hostTab .hostItem:even').css('backgroundColor', '#F7F9FC');
    } else {
        self.orderInfo = [];
    }
}

// otherNetwork
function otherNetwork(self) {
    let type1 = $('.typeView option:selected').val();
    let type2 = $('.typeView1 option:selected').val();
    let tag = $('.tagView option:selected').val();
    let zone = $('.ZoneView option:selected').val();

    // 获取相应数据
    let urlStr = "/";
    if (type1 === "aliCloud") urlStr += "alCloud";
    else if (type1 === "uCloud") urlStr += "host";
    if (type2 === "uhost" || type2 === "alHost" || type2 === "uphost") {
        if (type2 === "alHost") {
            type2 = "host";
        }
        urlStr += `/${type2}/others?tag=${tag}&zone=${zone}`;
        let options = self.baseTool.Header();
        self.http.get(`${AppEnvConfig.env}${urlStr}`, options)
            .map(res => res.json())
            .subscribe(data => {
                if (data.status == 200) {
                    let childenStr = '';
                    let childenStr1 = '';
                    self.baseTool.reload(self);
                    if (type1 === "uCloud") {
                        data.result.content.forEach((data, i) => {
                            childenStr += `<li rel="${i}"><a tabindex="0" class="" style=""><span class="text">${data.Name}</span><i class="glyphicon glyphicon-ok icon-ok check-mark"></i></a></li>`;
                            childenStr1 += `<option>${data.Name}</option>`;
                        });
                    } else if (type1 === "aliCloud") {
                        data.result.content.forEach((data, i) => {
                            childenStr += `<li rel="${i}"><a tabindex="0" class="" style=""><span class="text">${data.InstanceName}</span><i class="glyphicon glyphicon-ok icon-ok check-mark"></i></a></li>`;
                            childenStr1 += `<option>${data.InstanceName}</option>`;
                        });
                    }

                    $('.selectpicker').selectpicker({
                        'selectedText': 'cat'
                    });
                    $('#id_select').html(childenStr1);
                    $('.dropdown-menu.open ul').html(childenStr);
                }
            });
    } else {
        $('#id_select').html("");
        $('.dropdown-menu.open ul').html("");
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
    location.href = `${AppEnvConfig.env}/work/donwloadFiles?type=${FILE_TYPE_ENUM}&id=${idStr}`;
}