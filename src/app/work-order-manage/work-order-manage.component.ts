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

@Component({
    selector: 'app-work-order-manage',
    templateUrl: './work-order-manage.component.html',
    styleUrls: ['./work-order-manage.component.css']
})
export class WorkOrderManageComponent implements OnInit {

    private baseTool: any;    // 工具函数
    public orderInfo: any;    // 我的工单数据
    constructor(private route: ActivatedRoute, private http: Http, private cdr: ChangeDetectorRef) {
        this.baseTool = BaseTool.sharedBaseTool();    // 工具函数
        this.workOrderHandledInfo();    // 获取我的已解决工单数据

    }

    ngOnInit() {
        this.addWorkOrder(this);    // 获取2级以上权限用户
        this.handledOrderDetail(this);    // 处理我的已解决工单数据
        this.pageation(this);    // 分页
        this.showDetailView();    // 详情按钮
        this.selecter();    // 三级联动
        this.addOrders(this);    // 新增工单
        this.silviomoreto(this);    // 多选
        this.tingyunProductions();    // 听云产品线二级联动
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
            let accept = "";   // 受理人
            let firstLive = $('.firstList option:selected').val();    // 优先级
            let str = $('.noteView').val();    // 备注
            let change_instance_name = $('.filter-option.pull-left').html();    // 实例名称
            let order_flag = $("#addOrderType").text();
            if (order_flag) accept = Cookies.get("ty_cmdb_user") + ":" + Cookies.get("ty_cmdb");
            else  accept = "运维组";
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

            if (order_flag) {
                if (argObj.title) {
                    $('#createSure').attr("disabled", "disabled");
                    argObj.type = "再次提交";
                    argObj["id"] = order_flag;
                    let body = JSON.stringify(argObj);
                    let options = self.baseTool.Header();
                    self.http.post(AppEnvConfig.env + "/work/manageHandledOrder", body, options)
                        .map(res => res.json())
                        .subscribe(data => {
                            $('#createSure').removeAttr("disabled");
                            if (data.status == 200) {
                                $("#addOrderType").text("");
                                self.baseTool.successView("提交成功");
                                $('.modal.fade.detailView.in').click();
                                self.baseTool.refView("workOrder/handedleOrder");
                            } else {
                                self.baseTool.failureView("提交失败，请稍后再试...");
                                $('.modal.fade.detailView.in').click();
                            }
                        });
                } else {
                    self.baseTool.alertView("请填写完整工单", self.baseTool.failure);
                }

            } else {
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
                                self.baseTool.refView("workOrder/handedleOrder");
                            } else {
                                self.baseTool.failureView("提交失败，请稍后再试...");
                                $('.modal.fade.bs-example-modal-lg.in').click();
                            }
                        });
                } else {
                    self.baseTool.alertView("请填写完整工单", self.baseTool.failure);
                }
            }


        });

        // 取消按钮
        $('#createCancel').on('click', function () {
            $('.addContentTitle input').val("");    // 主题
            $('.noteView').val("");    // 备注
            $('.filter-option.pull-left').html("");
            $('.modal.fade.bs-example-modal-lg .centerView .addContentGroup textarea.noteView').val("");

            $("div.btn-group.bootstrap-select.show-tick.bla.bli button span.filter-option.pull-left").text("");
            $("button.btn.dropdown-toggle.selectpicker.btn-default").attr("title", "");
            $('.dropdown-menu.open ul li').removeClass("selected");
            $('#id_select').children().removeAttr("selected");

            $('.modal.fade.bs-example-modal-lg.in').click();
        });

    }

    // 工单数据处理
    workOrderHandledInfo(index = 0) {
        $('.conver').show();
        let options = this.baseTool.Header();
        let user = Cookies.get("ty_cmdb_user") + ":" + Cookies.get("ty_cmdb");
        this.http.get(AppEnvConfig.env + "/work/workOrderInfo?index=" + index + "&user=" + user, options)
            .map(res => res.json())
            .subscribe(data => handleInfo(this, data));
    }

    // 已处理工单详情
    handledOrderDetail(self) {
        $(function () {
            $('.hostTab').delegate('.detailBtn', 'click', function () {
                let idIndex = $(this).parent().parent().children().eq(0).find("span").text();
                $('.modal .handleBtn').hide();
                self.orderInfo.forEach((item, i) => {
                    if (item.id == idIndex) {
                        let priority = '';
                        let zone = '';
                        let change_type = '';
                        if (item.priority == 0) {
                            priority = "一般";
                        } else if (item.priority == 1) {
                            priority = "高";
                        } else if (item.priority == 2) {
                            priority = "非常高";
                        }
                        if (item.zone == "all") {
                            zone = "不限";
                        } else if (item.zone == "cn-bj1") {
                            zone = "北京一";
                        } else if (item.zone == "cn-bj2") {
                            zone = "北京二";
                        } else if (item.zone == "hk") {
                            zone = "香港";
                        }

                        $('.modal.fade.detailView .addContentGroup').eq(0).find("span").text(item.title);
                        $('.modal.fade.detailView .addContentGroup').eq(0).find("i").text(item.id);
                        $('.modal.fade.detailView .addContentGroup').eq(1).find("span").text(item.query_type);
                        $('.modal.fade.detailView .addContentGroup').eq(1).find("i").text(item.change_type);
                        $('.modal.fade.detailView .addContentGroup').eq(2).find("span").text(item.change_instance_name);
                        $('.modal.fade.detailView .addContentGroup').eq(3).find("span").text(item.tag);
                        $('.modal.fade.detailView .addContentGroup').eq(4).find("span").text(zone);
                        $('.modal.fade.detailView .addContentGroup').eq(5).find("span").text(item.accept_user_last);
                        $('.modal.fade.detailView .addContentGroup').eq(6).find("span").text(item.handle_time);
                        $('.modal.fade.detailView .addContentGroup').eq(7).find("span").text(priority);
                        $('.modal.fade.detailView .addContentGroup').eq(7).find("i").text(item.priority);
                        $('.modal.fade.detailView .addContentGroup').eq(8).find("textarea").val(item.note);
                        $('.modal.fade.detailView .addContentGroup').eq(9).find("span").text(item.type);
                        $('.modal.fade.detailView .addContentGroup').eq(10).find("textarea").val(item.reason);
                        $('.modal.fade.detailView .addContentGroup').eq(11).find("textarea").val(item.work_order_timeline);

                        if (item.type === "已通过，待确认" || item.type === "未通过，待确认") $('.modal .handleBtn').show();
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
                let itemType = $('.modal.fade.detailView .addContentGroup').eq(9).find("span").text();
                let accept_user_last = $('.modal.fade.detailView .addContentGroup').eq(5).find("span").text();
                let reason = $('#noteView2').val();
                let user = Cookies.get("ty_cmdb_user") + ":" + Cookies.get("ty_cmdb");
                let type = "";
                if (itemType === "已通过，待确认" || itemType === "已通过") type = "已通过，已确认";
                if (itemType === "未通过，待确认" || itemType === "未通过") type = "未通过，已确认";
                let body = JSON.stringify({
                    id: id,
                    type: type,
                    accept_user_last: accept_user_last,
                    reason: reason,
                    user: user
                });
                let options = self.baseTool.Header();

                self.http.post(AppEnvConfig.env + "/work/manageHandledOrder", body, options)
                    .map(res => res.json())
                    .subscribe(data => {
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
                let title = $('.modal.fade.detailView .addContentGroup').eq(0).find("span").text();
                let query_type = $('.modal.fade.detailView .addContentGroup').eq(1).find("span").text();
                let change_type = $('.modal.fade.detailView .addContentGroup').eq(1).find("i").text();
                let change_instance_name = $('.modal.fade.detailView .addContentGroup').eq(2).find("span").text();
                let tag = $('.modal.fade.detailView .addContentGroup').eq(3).find("span").text();
                let zone = $('.modal.fade.detailView .addContentGroup').eq(4).find("span").text();
                let priority = $('.modal.fade.detailView .addContentGroup').eq(7).find("i").text();
                let note = $('.modal.fade.detailView .addContentGroup').eq(8).find("textarea").val();

                $('#addOrderType').text(id);
                $('.modal.fade.detailView.in').click();

                $('.modal.fade.bs-example-modal-lg .centerView .addContentTitle input').val(title);
                let change_typeArr = $('.modal.fade.bs-example-modal-lg .centerView .addContentGroup:eq(0) select').children();
                let hostTypeArr = $('.modal select.typeView').children();
                let baseTypeArr = $('.modal select.typeView1').children();
                let query_typeArr = query_type.split("/");
                let tagArr = $('.modal select.tagView').children();
                let zoneArr = $('.modal select.ZoneView').children();
                let priorityArr = $('.modal select.firstList').children();
                resentView(change_typeArr, change_type);
                resentView(hostTypeArr, $.trim(query_typeArr[0]));
                resentView(baseTypeArr, $.trim(query_typeArr[1]));
                resentView(tagArr, tag);
                resentView(zoneArr, zone);
                resentView(priorityArr, priority);
                otherNetwork(self, function () {
                    $('.modal.fade.bs-example-modal-lg .centerView .addContentGroup textarea.noteView').val(note);

                    $("div.btn-group.bootstrap-select.show-tick.bla.bli button span.filter-option.pull-left").text(change_instance_name);
                    $("button.btn.dropdown-toggle.selectpicker.btn-default").attr("title", change_instance_name);
                    let change_instance_nameArr = change_instance_name.split(",");
                    change_instance_nameArr.forEach((data) => {
                        resentView($('.dropdown-menu.open ul li'), data, 1);
                        resentView($('#id_select').children(), data);
                    });
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
        self.http.get(AppEnvConfig.env + "/work/handledOrderInfoCount?user=" + user, options)
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
            formData = formate(updateBody, formData);
            if ($('#app_file')[0].files[0]) formData.append('app_file', $('#app_file')[0].files[0]);
            if ($('#sql_file')[0].files[0]) formData.append('sql_file', $('#sql_file')[0].files[0]);

            let options = self.baseTool.formHeader();
            $('#commitBtn').attr("disabled", "disabled");

            self.http.post(`${AppEnvConfig.env}/work/createProdOrder`, formData, options)
                .map(res => res.json())
                .subscribe(data => {
                    $('#commitBtn').removeAttr("disabled");
                    if (data.status == 200) {
                        self.baseTool.successView("提交成功");
                        setTimeout(function () {
                            location.href = "/#/workOrder/handledProdOrder";
                        }, 2000);
                    } else {
                        let msg = '';
                        if (data.hasOwnProperty("msg")) msg = data.msg;
                        self.baseTool.failureView("提交失败，" + msg);
                    }
                });
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
        otherNetwork(self, "");

        // 为每个select选项框注册事件
        $('.typeView').on('change', otherNetwork.bind(this, self, ""));
        $('.typeView1').on('change', otherNetwork.bind(this, self, ""));
        $('.tagView').on('change', otherNetwork.bind(this, self, ""));
        $('.ZoneView').on('change', otherNetwork.bind(this, self, ""));
    }

    // tingyunProductions
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
            if (item.type === "未处理" || item.type === "再次提交") {
                $(".hostItem").eq(i).find("div.orderType").css("backgroundColor", "#e86727");
            } else if (item.type === "未通过，待确认") {
                $(".hostItem").eq(i).find("div.orderType").css("backgroundColor", "#e83619");
            } else if (item.type === "未通过，已确认" || item.type === "已通过，已确认") {
                $(".hostItem").eq(i).find("div.orderType").css("backgroundColor", "rgba(82, 83, 84, 0.37)");
            }

            if (parseInt(item.priority) === 0) {
                $(".hostItem").eq(i).children().eq(3).text("一般");
            } else if (parseInt(item.priority) === 1) {
                $(".hostItem").eq(i).children().eq(3).text("高").css("color", "orange");
            } else if (parseInt(item.priority) === 2) {
                $(".hostItem").eq(i).children().eq(3).text("非常高").css("color", "red");
            }

            if (item.change_type === "updateHost") $(".hostItem").eq(i).children().eq(1).text("修改主机配置");
            else if (item.change_type === "createHost") $(".hostItem").eq(i).children().eq(1).text("创建主机");
            else if (item.change_type === "updateHostOS") $(".hostItem").eq(i).children().eq(1).text("修改主机操作系统配置");

        });
        $('.hostTab .hostItem:even').css('backgroundColor', '#F7F9FC');
    } else {
        self.orderInfo = [];
    }
}

// otherNetwork
function otherNetwork(self, cb) {
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
                            childenStr1 += `<option value="${data.Name}">${data.Name}</option>`;
                        });
                    } else if (type1 === "aliCloud") {
                        data.result.content.forEach((data, i) => {
                            childenStr += `<li rel="${i}"><a tabindex="0" class="" style=""><span class="text">${data.InstanceName}</span><i class="glyphicon glyphicon-ok icon-ok check-mark"></i></a></li>`;
                            childenStr1 += `<option value="${data.InstanceName}">${data.InstanceName}</option>`;
                        });
                    }

                    $('.selectpicker').selectpicker({
                        'selectedText': 'cat'
                    });
                    $('#id_select').html(childenStr1);
                    $('.dropdown-menu.open ul').html(childenStr);
                    if (cb) cb();
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

function resentView(dom, change_type, flag=0) {
    if (flag === 1) {
        $('.dropdown-menu.open ul li').eq(0).addClass("selected");
        for (let i = 0; i < dom.length; i ++) {
            if ($(dom[i]).find("span").text() === change_type) {
                return;
            }
        }
    } else {
        for (let i = 0; i < dom.length; i ++) {
            if ($(dom[i]).val() === change_type) {
                $(dom[i]).attr("selected", "selected").siblings().removeAttr("selected");
                return;
            }
        }
    }

}