import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import{ActivatedRoute, Router, Params}from'@angular/router';
import {Http, Headers, RequestOptions} from '@angular/http';
import {AppEnvConfig} from '../../assets/conf/envConfig';
import {BaseTool} from '../../assets/baseTool';
import "rxjs/add/operator/map";
import {log} from "util";

declare const $: any;    // jquery
declare const Cookies;    // cookie

@Component({
    selector: 'app-work-order-unhandleall',
    templateUrl: './work-order-unhandleall.component.html',
    styleUrls: ['./work-order-unhandleall.component.css']
})
export class WorkOrderUnhandleallComponent implements OnInit {

    private baseTool: any;    // 工具函数
    public orderInfo: any;    // 我的工单数据
    constructor(private route: ActivatedRoute, private router: Router, private http: Http, private cdr: ChangeDetectorRef) {
        this.baseTool = BaseTool.sharedBaseTool();    // 工具函数
        this.baseTool.handleAuth(this, 3);    // 处理权限
        this.workOrderUnHandledInfo();    // 获取未处理工单数据
    }

    ngOnInit() {
        this.handledOrderDetail(this);    // 处理工单数据
        this.pageation(this);    // 分页
        this.acceptOrderDetail(this);    // 工单详情
        this.disagreeQueryOrder(this);    // 回据受理工单
        this.agreeQueryOrder(this);    // 通过受理工单
    }


    // 工单数据处理
    workOrderUnHandledInfo(index = 0) {
        $('.conver').show();
        let options = this.baseTool.Header();
        this.http.get(AppEnvConfig.env + "/work/workOrderUnHandleInfoAll?index=" + index, options)
            .map(res => res.json())
            .subscribe(data => handleInfo(this, data));
    }

    // 个人未处理工单详情
    handledOrderDetail(self) {
        $(function () {
            $('.hostTab').delegate('.detailBtn', 'click', function () {
                let idIndex = $(this).parent().parent().children().eq(0).find("span").text();
                self.orderInfo.forEach((item, i) => {
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

                        if (item.change_instance_name) {
                            let str = "";
                            if (item.change_instance_name.indexOf(",") !== -1) {
                                let straArr = item.change_instance_name.split(",");
                                straArr.forEach(data => {
                                    str += `${$.trim(data)}:;\n`;
                                })
                            } else {
                                str = `${$.trim(item.change_instance_name)}:;`;
                            }
                            $('#change_content_detail').val(str);

                        }
                        return;
                    }
                });
            });

            // 关闭按钮
            $('.modal.fade.detailView .closeBtn').on('click', function () {
                $('.modal.fade.detailView.in').click();
            })
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

                self.workOrderUnHandledInfo(index);
            })
        });
    }

    // 获取本地数据数量
    infoTotalCount(self, cb) {
        let options = self.baseTool.Header();
        let user = Cookies.get("ty_cmdb_user") + ":" + Cookies.get("ty_cmdb");
        self.http.get(AppEnvConfig.env + "/work/unHandleOrderInfoAllCount", options)
            .map(res => res.json())
            .subscribe(data => {
                if (data.status == 200) {
                    cb(data.result.content);
                }
            });
    }

    // 工单详情
    acceptOrderDetail(self) {
        $(function () {

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

    // 回据受理工单
    disagreeQueryOrder(self) {
        $(function () {
            $('.hostTab').delegate('.deleteBtn', 'click', function () {
                let idIndex = $(this).parent().parent().children().eq(0).find("span").text();
                handleMyAcceptOrder(self, "未通过，待确认", idIndex)
            });
        });
    }

    // 通过受理工单
    agreeQueryOrder(self) {
        $(function () {
            $('.hostTab').delegate('.consentBtn', 'click', function () {
                let idIndex = $(this).parent().parent().children().eq(0).find("span").text();
                handleMyAcceptOrder(self, "已通过，待确认", idIndex)
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
            if (item.type === "已通过") {
                $(".hostItem").eq(i).children().eq(1).css("color", "green").find("i")
                    .addClass("fa-check-circle-o").show();
            } else if (item.type === "未通过") {
                $(".hostItem").eq(i).children().eq(1).css("color", "red").find("i")
                    .addClass("fa-ban").show();
            }

            if ($(".hostItem").eq(i).children().eq(1).text() === "再次提交") {
                $(".hostItem").eq(i).children().eq(1).css("color", "#673ab7");
            }

            if (parseInt(item.priority) === 0) {
                $(".hostItem").eq(i).children().eq(2).text("一般");
            } else if (parseInt(item.priority) === 1) {
                $(".hostItem").eq(i).children().eq(2).text("高").css("color", "orange");
            } else if (parseInt(item.priority) === 2) {
                $(".hostItem").eq(i).children().eq(2).text("非常高").css("color", "red");
            }

        });
        $('.hostTab .hostItem:even').css('backgroundColor', '#F7F9FC');
    }

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


