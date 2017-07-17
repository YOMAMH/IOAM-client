import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import{ActivatedRoute, Router, Params}from'@angular/router';
import {Http, Headers, RequestOptions} from '@angular/http';
import {AppEnvConfig} from '../../assets/conf/envConfig';
import {BaseTool} from '../../assets/baseTool';
import "rxjs/add/operator/map";

declare const $: any;    // jquery
declare const Cookies;    // cookie

@Component({
    selector: 'app-work-order-handledall',
    templateUrl: './work-order-handledall.component.html',
    styleUrls: ['./work-order-handledall.component.css']
})
export class WorkOrderHandledallComponent implements OnInit {

    private baseTool: any;    // 工具函数
    public orderInfo: any;    // 我的工单数据
    constructor(private route: ActivatedRoute, private router: Router, private http: Http, private cdr: ChangeDetectorRef) {
        this.baseTool = BaseTool.sharedBaseTool();    // 工具函数
        this.baseTool.handleAuth(this, '3');    // 处理权限
        this.workOrderHandledInfo();    // 获取已解决工单数据
    }

    ngOnInit() {
        this.handledOrderDetail(this);    // 处理已解决工单数据
        this.pageation(this);    // 分页
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
        this.http.get(AppEnvConfig.env + "/work/workOrderHandledInfoAll?index=" + index, options)
            .map(res => res.json())
            .subscribe(data => handleInfo(this, data));
    }

    // 已处理工单详情
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
                        $('.modal.fade.detailView .addContentGroup').eq(0).find("span").text(item.title);
                        $('.modal.fade.detailView .addContentGroup').eq(1).find("span").text(item.query_type);
                        $('.modal.fade.detailView .addContentGroup').eq(2).find("span").text(item.change_instance_name ? item.change_instance_name : "");
                        $('.modal.fade.detailView .addContentGroup').eq(3).find("span").text(item.tag);
                        $('.modal.fade.detailView .addContentGroup').eq(4).find("span").text(zone);
                        $('.modal.fade.detailView .addContentGroup').eq(5).find("span").text(item.accept_user_last);
                        $('.modal.fade.detailView .addContentGroup').eq(6).find("span").text(item.handle_time);
                        $('.modal.fade.detailView .addContentGroup').eq(7).find("span").text(priority);
                        $('.modal.fade.detailView .addContentGroup').eq(8).find("textarea").val(item.note);
                        $('.modal.fade.detailView .addContentGroup').eq(9).find("span").text(item.type);
                        $('.modal.fade.detailView .addContentGroup').eq(10).find("textarea").val(item.reason);
                        $('.modal.fade.detailView .addContentGroup').eq(11).find("textarea").val(item.work_order_timeline);
                        $('.modal.fade.detailView .addContentGroup').eq(12).find("textarea").val(item.change_content);
                        $('.modal.fade.detailView .addContentGroup').eq(12).find("#changeInstanceName").val(item.change_instance_name);
                        $('.modal.fade.detailView .addContentGroup').eq(12).find("#changeTitle").val(item.change_title);
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

                self.workOrderHandledInfo(index);
            })
        });
    }

    // 获取本地数据数量
    infoTotalCount(self, cb) {
        let options = self.baseTool.Header();
        self.http.get(AppEnvConfig.env + "/work/handledOrderInfoAllCount", options)
            .map(res => res.json())
            .subscribe(data => {
                if (data.status == 200) {
                    cb(data.result.content);
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
            if (item.type === "已通过，已确认") {
                $(".hostItem").eq(i).children().eq(1).css("color", "green").find("i")
                    .addClass("fa-check-circle-o").show();
            } else if (item.type === "未通过，已确认") {
                $(".hostItem").eq(i).children().eq(1).css("color", "red").find("i")
                    .addClass("fa-ban").show();
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
    } else {
        self.orderInfo = [];
    }
}
