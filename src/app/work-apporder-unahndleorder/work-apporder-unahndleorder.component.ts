import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import{ActivatedRoute, Router, Params}from'@angular/router';
import {Http, Headers, RequestOptions} from '@angular/http';
import {AppEnvConfig} from '../../assets/conf/envConfig';
import {BaseTool} from '../../assets/baseTool';
import "rxjs/add/operator/map";
import {log} from "util";

declare const $: any;    // jquery
declare const Cookies;    // cookie

'use strict';

@Component({
    selector: 'app-work-apporder-unahndleorder',
    templateUrl: './work-apporder-unahndleorder.component.html',
    styleUrls: ['./work-apporder-unahndleorder.component.css']
})
export class WorkApporderUnahndleorderComponent implements OnInit {

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
        this.http.get(AppEnvConfig.env + "/work/workProdOrderUnHandleInfo?index=" + index + "&user=" + user, options)
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
                        let update_type = '';
                        let app_file = '';
                        let sql_file = '';
                        app_file = item.app_file;
                        sql_file = item.sql_file;
                        if (item.update_type == 0) {
                            update_type = "修复BUG";
                        } else if (item.priority == 1) {
                            update_type = "产品发布";
                        }
                        if (app_file) app_file = app_file.substring(app_file.lastIndexOf("%^") + 2);
                        if (sql_file) sql_file = sql_file.substring(sql_file.lastIndexOf("%^") + 2);




                        $('.modal.fade.detailView .addContentGroup').eq(0).find("span").text(item.pro_type);
                        $('.modal.fade.detailView .addContentGroup').eq(0).find("i").text(item.id);
                        $('.modal.fade.detailView .addContentGroup').eq(1).find("span").text(item.pro_name);
                        $('.modal.fade.detailView .addContentGroup').eq(1).find("div").children("i").eq(0)
                            .text(item.app_file);
                        $('.modal.fade.detailView .addContentGroup').eq(1).find("div").children("i").eq(1)
                            .text(item.sql_file);
                        $('.modal.fade.detailView .addContentGroup').eq(2).find("span").text(update_type);
                        $('.modal.fade.detailView .addContentGroup').eq(3).find("span").text(item.update_verson);
                        $('.modal.fade.detailView .addContentGroup').eq(4).find("span").text(item.jenkins_name);
                        $('.modal.fade.detailView .addContentGroup').eq(5).find("span").text(item.build_num);
                        $('.modal.fade.detailView .addContentGroup').eq(6).find("span").text(item.order_type);
                        $('.modal.fade.detailView .addContentGroup').eq(7).find("span").text(item.accept_user);
                        $('.modal.fade.detailView .addContentGroup').eq(8).find("textarea").val(item.change_content);
                        $('.modal.fade.detailView .addContentGroup').eq(9).find("textarea").val(item.conf_update);
                        $('.modal.fade.detailView .addContentGroup').eq(10).find("textarea").val(item.update_depend);
                        $('.modal.fade.detailView .addContentGroup').eq(11).find("span").text(app_file);
                        $('.modal.fade.detailView .addContentGroup').eq(12).find("span").text(sql_file);
                        $('.modal.fade.detailView .addContentGroup').eq(13).find("textarea").val(item.work_order_timeline);
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
        self.http.get(AppEnvConfig.env + "/work/unHandleProdOrderInfoCount?user=" + user, options)
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
            let appFile = $(".modal.fade.detailView .addContentGroup:eq(1) div").children("i").eq(0).text();
            let sqlFile = $(".modal.fade.detailView .addContentGroup:eq(1) div").children("i").eq(1).text();
            self.deleteFun(self, idIndex, appFile, sqlFile)
        });

        $('.hostTab').delegate('.deleteBtn', 'click', function () {
            let idfiley = $(this).parent().parent().children().eq(0).find("span").text();
            let appFile = $(this).parent().parent().children().eq(1).find("div").children("i").eq(0).text();
            let sqlFile = $(this).parent().parent().children().eq(1).find("div").children("i").eq(1).text();
            self.deleteFun(self, idfiley, appFile, sqlFile);
        });
    }

    // 删除工单网络请求
    deleteFun(self, idIndex, appFile, sqlFile) {
        if (confirm("撤回的工单会被自动删除，确定撤回工单信息吗？")) {
            let url = `${AppEnvConfig.env}/work/dropUnHandleProdOrderInfo?id=${idIndex}`;
            if (appFile) {
                appFile = encodeURIComponent(appFile);
                url += `&appFile=${appFile}`;
            }

            if (sqlFile) {
                sqlFile = encodeURIComponent(sqlFile);
                url += `&sqlFile=${sqlFile}`;
            }
            let options = self.baseTool.Header();
            self.http.delete(url, options)
                .map(res => res.json())
                .subscribe(data => {
                    if (data.status == 200) {
                        self.baseTool.alertView("撤回成功！", self.baseTool.success);
                        $('.modal.fade.detailView.in').click();
                        self.baseTool.refView("workOrder/unHandleProdOrder");
                    } else if (data.status == 500) {
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
                $(".hostItem").eq(i).children().eq(3).css("color", "green").find("i")
                    .addClass("fa-check-circle-o").show();
            } else if (item.type === "未通过") {
                $(".hostItem").eq(i).children().eq(3).css("color", "red").find("i")
                    .addClass("fa-ban").show();
            }

            if ($(".hostItem").eq(i).children().eq(3).text() === "再次提交") {
                $(".hostItem").eq(i).children().eq(3).css("color", "#673ab7");
            }

            if (parseInt(item.update_type) === 0) {
                $(".hostItem").eq(i).children().eq(2).text("修复BUG");
            } else if (parseInt(item.priority) === 1) {
                $(".hostItem").eq(i).children().eq(2).text("产品发布");
            }

        });
        $('.hostTab .hostItem:even').css('backgroundColor', '#F7F9FC');
    }

}
