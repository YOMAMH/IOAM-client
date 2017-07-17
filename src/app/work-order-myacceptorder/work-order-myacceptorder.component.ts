import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {Http, Headers, RequestOptions} from '@angular/http';
import "rxjs/add/operator/map";
import {AppEnvConfig} from '../../assets/conf/envConfig';
import {ActivatedRoute, Router} from '@angular/router';
import {BaseTool} from '../../assets/baseTool';
import {type} from "os";

declare const $: any;    // jquery
declare const Cookies;    // cookie

let AUTH = '0';

@Component({
    selector: 'app-work-order-myacceptorder',
    templateUrl: './work-order-myacceptorder.component.html',
    styleUrls: ['./work-order-myacceptorder.component.css']
})
export class WorkOrderMyacceptorderComponent implements OnInit {

    private baseTool: any;    // 工具函数
    public handleOrderInfo: any;    // 我的已处理受理工单数据
    public authLive: string = '0';

    constructor(private route: ActivatedRoute, private router: Router, private http: Http, private cdr: ChangeDetectorRef) {
        this.baseTool = BaseTool.sharedBaseTool();   // 工具函数
        this.baseTool.handleAuth(this, '2');    // 处理权限
        this.myHandledAcceptInfo(this);    // 获取我受理的已处理工单
        this.pageation(this);    // 分页
        this.getLocalAuth();    // 获取权限
    }

    ngOnInit() {
        this.acceptOrderDetail(this);    // 我的受理工单详情
        // this.disagreeQueryOrder(this);    // 回据我的受理工单
        // this.agreeQueryOrder(this);    // 通过我的受理工单
        // this.resAcceptBtn(this);    // 转出
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

    // 我的已处理委托工单
    myHandledAcceptInfo(self, index = 0) {
        $('.conver').show();
        let options = this.baseTool.Header();
        this.http.get(AppEnvConfig.env + "/work/myAcceptOrder?index=" + index, options)
            .map(res => res.json())
            .subscribe(data => handleOrder(self, data, "handled"));
    }

    // 个人受理工单详情
    acceptOrderDetail(self) {
        $(function () {
            $('.hostTab').delegate('.detailBtn', 'click', function () {
                let idIndex = $(this).parent().parent().children().eq(0).find("span").text();
                showDetail(self.handleOrderInfo, idIndex);

            });


            // 关闭按钮
            $('.modal.fade.detailView .closeBtn').on('click', function () {
                $('.modal.fade.detailView.in').click();
            });

            // 通过
            $('#createSure').on('click', function () {
                let ident = $('.modal.fade.detailView .addContentGroup').eq(0).find("i").text();
                let change_instance_name = $.trim($('#changeInstanceName').val());
                let change_content = $.trim($('#change_content').find("textarea").val());
                let change_title = $('#changeTitle').val();
                let chackStr = self.baseTool.formatStr(change_content);

                if (change_instance_name && change_content && change_title && chackStr) handleMyAcceptOrder(self, {
                    text: "已通过，待确认",
                    change_instance_name: change_instance_name,
                    change_content: change_content,
                    change_title: change_title,
                }, ident);
                else if (!self.baseTool.formatStr(change_content)) self.baseTool.alertView("请填写正确变更记录变更内容", self.baseTool.failure);
                else self.baseTool.alertView("请填写完整变更记录", self.baseTool.failure);
            });

            // 拒绝
            $('#createCancel').on('click', function () {
                let ident = $('.modal.fade.detailView .addContentGroup').eq(0).find("i").text();
                let change_instance_name = $.trim($('#changeInstanceName').val());
                handleMyAcceptOrder(self, {text: "未通过，待确认", change_instance_name: change_instance_name}, ident);
            });
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
        let options = self.baseTool.Header();
        self.http.get(AppEnvConfig.env + "/work/orderTotalCount", options)
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

                self.http.post(AppEnvConfig.env + "/work/updateMyAcceptOrder", body, options)
                    .map(res => res.json())
                    .subscribe(data => {
                        if (data.status == 200) {
                            self.baseTool.alertView("工单转出成功", self.baseTool.success);
                            $('.modal.fade.bs-example-modal-lg.in').click();
                            self.baseTool.refView("workOrder/myAcceptOrder");
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

    // 删除工单
    dropOrder(self) {
        $("#dropBtn").on("click", function () {
            if (AUTH > '2') {
                $("#dropBtn").attr("disabled", "disabled");
                let id = $('.modal.fade.detailView .addContentGroup').eq(0).find("i").text();
                let options = self.baseTool.Header();
                if (confirm("确定删除该工单吗？")) {
                    self.http.delete(AppEnvConfig.env + "/work/dropUnHandleOrderInfo?id=" + id, options)
                        .map(res => res.json())
                        .subscribe(data => {
                            $("#dropBtn").removeAttr("disabled");
                            if (data.status == 200) {
                                self.baseTool.alertView("删除成功!", self.baseTool.success);
                                $('.modal.fade.detailView.in').click();
                                self.baseTool.refView("workOrder/myAcceptOrder");

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

// 处理工单数据
function handleOrder(self, data, type) {
    $('.conver').hide();
    if (data.status === 200) {
        self.handleOrderInfo = data.result.content;
        self.baseTool.reload(self);
        self.handleOrderInfo.forEach((item, i) => {

            if (parseInt(item.priority) === 0) {
                $(".handledOrderItem").eq(i).children().eq(3).text("一般");
            } else if (parseInt(item.priority) === 1) {
                $(".handledOrderItem").eq(i).children().eq(3).text("高");
            } else if (parseInt(item.priority) === 2) {
                $(".handledOrderItem").eq(i).children().eq(3).text("非常高");
            }

            if ($(".handledOrderItem").eq(i).children().eq(2).text() === "未处理" || $(".handledOrderItem").eq(i).children().eq(2).text() === "再次提交") {
                $(".handledOrderItem").eq(i).find("div.orderType").css("backgroundColor", "#e86727");
                $(".handledOrderItem").eq(i).children().eq(6).find("button").text("审核");
            } else if (item.type === "未通过，待确认") {
                $(".handledOrderItem").eq(i).find("div.orderType").css("backgroundColor", "#e83619");
            } else if (item.type === "未通过，已确认" || item.type === "已通过，已确认") {
                $(".handledOrderItem").eq(i).find("div.orderType").css("backgroundColor", "rgba(82, 83, 84, 0.37)");
            }

            if ($(".handledOrderItem").eq(i).children().eq(1).text() === "updateHost") {
                $(".handledOrderItem").eq(i).children().eq(1).text("修改主机配置")
            } else if ($(".handledOrderItem").eq(i).children().eq(1).text() === "createHost") {
                $(".handledOrderItem").eq(i).children().eq(1).text("创建主机")
            } else if ($(".handledOrderItem").eq(i).children().eq(1).text() === "updateHostOS") {
                $(".handledOrderItem").eq(i).children().eq(1).text("修改主机操作系统配置")
            }

        });
    } else {
        self.handleOrderInfo = [];
        self.baseTool.reload(self);
    }
}

// 显示详情
function showDetail(arg, idIndex) {
    $(".modal .handle").hide();
    $(".modal .changeView input").attr("disabled", "disabled");
    $(".modal .changeView textarea").attr("disabled", "disabled");
    $("#dropBtn").hide();
    arg.forEach((item, i) => {
        if (item.id == idIndex) {
            let priority = '';
            let zone = '';
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
            let createTime = new Date(item.create_time).toLocaleString();
            $('.modal.fade.detailView .addContentGroup').eq(0).find("span").text(item.title);
            $('.modal.fade.detailView .addContentGroup').eq(0).find("i").text(item.id);
            $('.modal.fade.detailView .addContentGroup').eq(1).find("span").text(item.query_type);
            $('.modal.fade.detailView .addContentGroup').eq(2).find("span").text(item.change_instance_name ? item.change_instance_name : "");
            $('.modal.fade.detailView .addContentGroup').eq(3).find("span").text(item.tag);
            $('.modal.fade.detailView .addContentGroup').eq(4).find("span").text(zone);
            $('.modal.fade.detailView .addContentGroup').eq(5).find("span").text(item.send_user);
            $('.modal.fade.detailView .addContentGroup').eq(6).find("span").text(createTime);
            $('.modal.fade.detailView .addContentGroup').eq(7).find("span").text(priority);
            $('.modal.fade.detailView .addContentGroup').eq(8).find("textarea").val(item.note);
            $('.modal.fade.detailView .addContentGroup').eq(9).find("span").text(item.type);
            $('.modal.fade.detailView .addContentGroup').eq(10).find("textarea").val(item.work_order_timeline);
            $('.modal.fade.detailView .addContentGroup').eq(11).find("textarea").val(item.reason);
            $('.modal.fade.detailView .addContentGroup').eq(12).find("textarea").val(item.change_content);
            $('.modal.fade.detailView .addContentGroup').eq(12).find("#changeInstanceName").val(item.change_instance_name);
            $('.modal.fade.detailView .addContentGroup').eq(12).find("#changeTitle").val(item.change_title);

            if (item.change_instance_name && (item.change_type === "updateHost" || item.change_type === "updateHostOS")) {
                let str = "";
                if (item.type === "已通过，已确认") {
                    str = item.change_content;
                } else {
                    let strTem = $.trim(item.change_instance_name);
                    let strArr = strTem.split(',');
                    strArr.forEach(strItem => {
                        if (strItem) {
                            str += `${$.trim(strItem)}:;\r`;
                        }
                    });

                }
                $('#change_content_detail').val(str);

            }

            if (item.type === "未处理" || item.type === "再次提交") {
                $(".modal .handle").show();
                $(".modal .changeView input").removeAttr("disabled");
                $(".modal .changeView textarea").removeAttr("disabled");
                if (AUTH > '2') $("#dropBtn").show();
            }
            return;
        }
    });


}

// 处理工单
function handleMyAcceptOrder(self, type, ident) {
    let options = self.baseTool.Header();
    let user = Cookies.get("ty_cmdb_user") + ":" + Cookies.get("ty_cmdb");
    let reason = $('#reason').val();
    let body = JSON.stringify({
        user: user,
        active: type.text,
        change_instance_name: type.change_instance_name ? type.change_instance_name : "",
        change_content: type.change_content ? type.change_content : "",
        change_title: type.change_title ? type.change_title : "",
        id: ident,
        reason: reason
    });

    self.http.post(AppEnvConfig.env + "/work/updateMyAcceptOrder", body, options)
        .map(res => res.json())
        .subscribe(data => {
            if (data.status === 200) {
                self.baseTool.alertView("更新工单状态成功", self.baseTool.success);
                $('.modal.fade.detailView.in').click();
                self.baseTool.refView("workOrder/myAcceptOrder");
            } else {
                self.baseTool.alertView("更新工单状态失败，请稍后再试...", self.baseTool.failure);
                $('.modal.fade.detailView.in').click();
            }
        });
}
