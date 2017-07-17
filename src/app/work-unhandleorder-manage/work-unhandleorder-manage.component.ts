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
    selector: 'app-work-unhandleorder-manage',
    templateUrl: './work-unhandleorder-manage.component.html',
    styleUrls: ['./work-unhandleorder-manage.component.css']
})
export class WorkUnhandleorderManageComponent implements OnInit {

    private baseTool: any;    // 工具函数
    public orderInfo: any;    // 我的工单数据
    constructor(private route: ActivatedRoute, private http: Http, private cdr: ChangeDetectorRef) {
        this.baseTool = BaseTool.sharedBaseTool();    // 工具函数
        this.workOrderUnHandledInfo();    // 获取我的未处理工单数据
    }

    ngOnInit() {
        this.handledOrderDetail(this);    // 处理我的已解决工单数据
        this.pageation(this);    // 分页
        this.deleteOrder(this);    // 撤回工单
    }


    // 工单数据处理
    workOrderUnHandledInfo(index = 0) {
        $('.conver').show();
        let options = this.baseTool.Header();
        let user = Cookies.get("ty_cmdb_user") + ":" + Cookies.get("ty_cmdb");
        this.http.get(AppEnvConfig.env + "/work/workOrderUnHandleInfo?index=" + index + "&user=" + user, options)
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
                        $('.modal.fade.detailView .addContentGroup').eq(0).find("span").text(item.title);
                        $('.modal.fade.detailView .addContentGroup').eq(0).find("i").text(item.id);
                        $('.modal.fade.detailView .addContentGroup').eq(1).find("span").text(item.query_type);
                        $('.modal.fade.detailView .addContentGroup').eq(2).find("span").text(item.change_instance_name?item.change_instance_name:"");
                        $('.modal.fade.detailView .addContentGroup').eq(3).find("span").text(item.tag);
                        $('.modal.fade.detailView .addContentGroup').eq(4).find("span").text(zone);
                        $('.modal.fade.detailView .addContentGroup').eq(5).find("span").text(item.accept_user);
                        $('.modal.fade.detailView .addContentGroup').eq(6).find("span").text(priority);
                        $('.modal.fade.detailView .addContentGroup').eq(7).find("textarea").val(item.note);
                        $('.modal.fade.detailView .addContentGroup').eq(8).find("span").text(item.type);
                        $('.modal.fade.detailView .addContentGroup').eq(9).find("textarea").val(item.work_order_timeline);
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
        self.http.get(AppEnvConfig.env + "/work/unHandleOrderInfoCount?user=" + user, options)
            .map(res => res.json())
            .subscribe(data => {
                if (data.status == 200) {
                    cb(data.result.content);
                }
            });
    }

    // 撤回工单
    deleteOrder(self) {
        $("#deleteBtn").on('click', function () {
            let idIndex = $(".modal.fade.detailView .addContentGroup:eq(0) i").text();
            self.deleteFun(self, idIndex)
        });

        $('.hostTab').delegate('.deleteBtn', 'click', function () {
            let idfiley = $(this).parent().parent().children().eq(0).find("span").text();
            self.deleteFun(self, idfiley);
        });
    }

    // 删除工单网络请求
    deleteFun(self, idIndex) {
        if (confirm("撤回的工单会被自动删除，确定撤回工单信息吗？")) {

            let obj = {id: idIndex};
            let options = self.baseTool.Header();
            let body = JSON.stringify(obj);
            self.http.post(AppEnvConfig.env + "/work/dropUnHandleOrderInfo", body, options)
                .map(res => res.json())
                .subscribe(data => {
                    if (data.status == 200) {
                        self.baseTool.alertView("撤回成功！", self.baseTool.success);
                        $('.modal.fade.detailView.in').click();
                        self.baseTool.refView("workOrder/unHandedleOrder");
                    } else {
                        self.baseTool.alertView("撤回失败", self.baseTool.failure);
                    }
                });
        }
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
                $(".hostItem").eq(i).children().eq(2).css("color", "green").find("i")
                    .addClass("fa-check-circle-o").show();
            } else if (item.type === "未通过") {
                $(".hostItem").eq(i).children().eq(2).css("color", "red").find("i")
                    .addClass("fa-ban").show();
            }

            if ($(".hostItem").eq(i).children().eq(2).text() === "再次提交") {
                $(".hostItem").eq(i).children().eq(2).css("color","#673ab7");
            }

            if (parseInt(item.priority) === 0) {
                $(".hostItem").eq(i).children().eq(3).text("一般");
            } else if (parseInt(item.priority) === 1) {
                $(".hostItem").eq(i).children().eq(3).text("高").css("color", "orange");
            } else if (parseInt(item.priority) === 2) {
                $(".hostItem").eq(i).children().eq(3).text("非常高").css("color", "red");
            }

        });
        $('.hostTab .hostItem:even').css('backgroundColor', '#F7F9FC');
    }

}
