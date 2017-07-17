/**
 * Created by renminghe on 2017/6/19.
 */
import {AppEnvConfig} from '../conf/envConfig';
import any = jasmine.any;
import Any = jasmine.Any;

declare const $: any;
declare const Cookies: any;

export class ApmBase {

    // 分页逻辑
    pagetion(self, url) {
        $(function () {

            // 分页
            hostTotalCount(self, function (dataCount) {
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
                            index = Math.floor(dataCount / 10 - 1) * 10;
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
                    self.ApmBase.getHostInfo(self, url, index);
                })
            });

        });
    }

    // 获取服务器状态数据
    getHostInfo(self, urlStr, index = 0) {
        let options = self.baseTool.Header();
        if (self.instanceName) {
            let objArr = [];
            urlStr = `${urlStr}?appName=${self.instanceName}`;
            self.http.get(`${AppEnvConfig.env}${urlStr}`, options)
                .map(res => res.json())
                .subscribe(data => {
                    $(".conver").hide();
                    if (data.status == 200) {
                        getHostList(self, data.result.name, data.result.node_name);
                    }
                });
        } else {
            urlStr = `${urlStr}?index=${index}`;
            self.http.get(`${AppEnvConfig.env}${urlStr}`, options)
                .map(res => res.json())
                .subscribe(data => {
                    $('.conver').hide();
                    if (data.status == 200) {
                        self.hostInfo = data.content;
                        self.baseTool.reload(self);
                        // 隔行变色
                        $('.hostTab .hostItem:even').css('backgroundColor', '#F7F9FC');
                    }
                });
        }

    }


    // 添加数据方法
    handleCreateHost(self, product_line, url) {
        $(function () {

            // 确认
            $("#createSure").on("click", () => {

                let name = $('.modal.createView .infoItem:eq(1)').find('input').val();
                let node_name = $('.modal.createView .infoItem:eq(2)').find('input').val();
                let port = $('.modal.createView .infoItem:eq(3)').find('input').val();
                let use_path = $('.modal.createView .infoItem:eq(4)').find('input').val();
                let config_path = $('.modal.createView .infoItem:eq(5)').find('input').val();
                let admin = $('.modal.createView .infoItem:eq(6)').find('input').val();
                let depend_env = $('.modal.createView .infoItem:eq(7)').find('input').val();

                if (name && port && use_path && config_path && admin && depend_env) {
                    $("#createSure").attr('disabled', 'disabled');
                    let reqBody = {
                        product_line: product_line,
                        name: name,
                        node_name: node_name,
                        port: port,
                        use_path: use_path,
                        config_path: config_path,
                        admin: admin,
                        depend_env: depend_env,
                    };

                    let reqBodyStr = JSON.stringify(reqBody);
                    let options = self.baseTool.Header();
                    self.http.post(`${AppEnvConfig.env}${url}`, reqBodyStr, options)
                        .map(res => res.json())
                        .subscribe(data => {
                            $("#createSure").removeAttr('disabled');
                            if (data.status === 200) {
                                $('.modal.fade.bs-example-modal-lg.in').click();
                                self.baseTool.alertView("添加应用成功！", self.baseTool.success);
                                self.baseTool.refView(self.actionUrl)
                            } else {
                                self.baseTool.alertView("添加应用失败，请稍后再试", self.baseTool.failure);
                            }
                        });
                } else {
                    self.baseTool.alertView("请填写完整信息", self.baseTool.failure);
                }
            });


            // 取消
            $("#createCancel").on("click", () => {
                // 清空
                $('.modal.createView .infoItem:eq(1)').find('input').val("");
                $('.modal.createView .infoItem:eq(2)').find('input').val("");
                $('.modal.createView .infoItem:eq(3)').find('input').val("");
                $('.modal.createView .infoItem:eq(4)').find('input').val("");
                $('.modal.createView .infoItem:eq(5)').find('input').val("");
                $('.modal.createView .infoItem:eq(6)').find('input').val("");
                $('.modal.createView .infoItem:eq(7)').find('input').val("");
                $('.modal.fade.bs-example-modal-lg.createView.in').click();
            });
        });

    }


    // 删除主机主方法
    handleDeleteHost(self, url) {
        $(function () {
            $('.hostTab').delegate('.deleteBtn', 'click', function () {
                if (confirm("确认删除该主机吗？")) {
                    let hostId = $(this).parent().parent().children().eq(0).find('i').text();   // hostId
                    deleteHost(self, hostId, url);
                }
            });
        });
    }

    // 模糊搜索
    searchHost(self, url) {
        $('.searchText').keydown(function (e) {
            if (e.keyCode == 13) {
                $('.conver').show();
                let searchId = $.trim($(this).val());
                let options = self.baseTool.Header();
                if (searchId) {
                    self.http.get(`${AppEnvConfig.env}${url}?proName=${searchId}`, options)
                        .map(res => res.json())
                        .subscribe(data => {
                            $('.conver').hide();
                            if (data.status == 200) {
                                $('.pagination').hide();
                                self.hostInfo = data.content;
                                self.baseTool.reload(self);
                            }
                        });
                } else {
                    self.http.get(`${AppEnvConfig.env}${url}?index=0`, options)
                        .map(res => res.json())
                        .subscribe(data => {
                            if (data.status == 200) {
                                $('.conver').hide();
                                $('.pagination').show();
                                self.hostInfo = data.content;
                                self.baseTool.reload(self);
                            }
                        });
                }
            }
        });
    }

    // 更新数据
    updateProducts(self, url) {
        $('.hostTab').delegate('.updateBtn', 'click', function () {
            let id = $(this).parent().parent().children().eq(0).find('i').text();
            let product_line = $(this).parent().parent().children().eq(0).find('span').text();
            let name = $(this).parent().parent().children().eq(1).find('span').text();
            let node_name = $(this).parent().parent().children().eq(1).find('i').text();
            let port = $(this).parent().parent().children().eq(2).text();
            let use_path = $(this).parent().parent().children().eq(3).text();
            let config_path = $(this).parent().parent().children().eq(4).find('span').text();
            let admin = $(this).parent().parent().children().eq(5).text();
            let depend_env = $(this).parent().parent().children().eq(6).text();
            let objTem = {
                product_line: product_line,
                name: name,
                node_name: node_name,
                port: port,
                use_path: use_path,
                config_path: config_path,
                admin: admin,
                depend_env: depend_env,
            };

            self.infoSet[0] = objTem;
            self.baseTool.reload(self);

            // 确认
            $("#updateSure").on("click", () => {
                name = $('.modal.updateView .infoItem:eq(1)').find('input').val();
                node_name = $('.modal.updateView .infoItem:eq(2)').find('input').val();
                port = $('.modal.updateView .infoItem:eq(3)').find('input').val();
                use_path = $('.modal.updateView .infoItem:eq(4)').find('input').val();
                config_path = $('.modal.updateView .infoItem:eq(5)').find('input').val();
                admin = $('.modal.updateView .infoItem:eq(6)').find('input').val();
                depend_env = $('.modal.updateView .infoItem:eq(7)').find('input').val();

                if (name && port && use_path && config_path && admin && depend_env) {
                    let reqBody = {
                        id: id,
                        product_line: product_line,
                        name: name,
                        node_name: node_name,
                        port: port,
                        use_path: use_path,
                        config_path: config_path,
                        admin: admin,
                        depend_env: depend_env,
                    };

                    let reqBodyStr = JSON.stringify(reqBody);
                    let options = self.baseTool.Header();
                    self.http.post(`${AppEnvConfig.env}${url}`, reqBodyStr, options)
                        .map(res => res.json())
                        .subscribe(data => {
                            if (data.status === 200) {
                                $(".modal.fade.bs-example-modal-lg.updateView.in").click();
                                self.baseTool.alertView("修改应用成功！", self.baseTool.success);
                                self.baseTool.refView(self.actionUrl)
                            } else {
                                self.baseTool.alertView("修改应用失败，请稍后再试", self.baseTool.failure);
                            }
                        });
                } else {
                    self.baseTool.alertView("请填写完整信息", self.baseTool.failure);
                }
            });

            // 取消
            $("#updateCancel").on("click", () => $(".modal.fade.bs-example-modal-lg.updateView.in").click());


        });
    }

    // 应用变更频率top5
    getOrderProdMaxRound(self, type) {
        let options = self.baseTool.Header();
        let dateObj = new Date();
        let dateYear = dateObj.getFullYear();
        let dateMouth = dateObj.getMonth();
        let date = `${dateYear}-${dateMouth}-01 00:00:00`;
        self.http.get(`${AppEnvConfig.env}/work/orderProdMaxRound?type=${type}&date=${date}`, options)
            .map(res => res.json())
            .subscribe(data => {
                if (data.status === 200) reportView(data.result.content);
            });
    }

    // 应用对应主机列表
    infoDetailView(self) {

        $(function () {
            $('.hostContainer .hostTab').delegate('.detailBtn', 'click', function () {

                let appName = $(this).parent().parent().children().eq(1).find("i").text();
                let appName1 = $(this).parent().parent().children().eq(1).find("span").text();
                $('.orderContainer .title span').text(`${appName1}部署主机列表及变更记录`);

                // 获取应用对应虚机数据
                getHostList(self, appName1, appName);

            });

            // 返回应用列表
            $('.orderContainer .title .backBtn').on('click', function () {
                $('.mainPage .orderContainer').animate({left: "100%"}, function () {
                    $('.mainPage .hostContainer').show();
                    $('.mainPage .hostRecover').show();
                    $('.mainPage .orderContainer').hide();
                    $('.orderContainer .hostTab').css("visibility", "hidden");
                    $('.orderContainer .historyContainer').css("visibility", "hidden");
                });
            });

            // 跳转主机详情页
            $('.orderContainer .hostTab').delegate('.hostDetailBtn', 'click', function () {
                let hostType = $(this).attr("custom");
                let hostId = "";
                let instance_name = "";
                if (hostType === "uphost") {
                    hostId = $(this).parent().parent().children('td').eq(1).text();
                    instance_name = $(this).parent().parent().children('td').eq(0).text();
                    self.router.navigate(['/uhost/upHostmanageDetail'], {
                        queryParams: {
                            id: hostId,
                            instance_name: instance_name
                        }
                    });
                } else if (hostType === "uhost") {
                    hostId = $(this).parent().parent().children('td').eq(1).text();
                    instance_name = $(this).parent().parent().children('td').eq(0).text();
                    self.router.navigate(['/uhost/manageDetail'], {
                        queryParams: {
                            id: hostId,
                            instance_name: instance_name
                        }
                    });
                }

            });

            // 应用工单详情页
            $('.orderContainer .historyContainer').delegate('.orderInfoBtn', 'click', function () {
                $('.hostInfoDetail').show().animate({"right": "0"});
                let index = $(this).parent().parent().index() - 1;
                let appOrderItem = self.changeHistoryInfo[index];
                let update_type = appOrderItem["update_type"] === 0 ? "修复bug" : "产品发布";

                $('.hostInfoDetail .hostInfoBase li:eq(0) span').text(appOrderItem.pro_type);
                $('.hostInfoDetail .hostInfoBase li:eq(1) span').text(appOrderItem.pro_name);
                $('.hostInfoDetail .hostInfoBase li:eq(2) span').text(update_type);
                $('.hostInfoDetail .hostInfoBase li:eq(3) span').text(appOrderItem.update_verson);
                $('.hostInfoDetail .hostInfoBase li:eq(4) span').text(appOrderItem.jenkins_name);
                $('.hostInfoDetail .hostInfoBase li:eq(5) span').text(appOrderItem.build_num);
                $('.hostInfoDetail .hostInfoBase li:eq(6) textarea').val(appOrderItem.change_content);
                $('.hostInfoDetail .hostInfoBase li:eq(7) textarea').val(appOrderItem.conf_update);
                $('.hostInfoDetail .hostInfoBase li:eq(8) textarea').val(appOrderItem.update_depend);
                $('.hostInfoDetail .hostInfoBase li:eq(9) textarea').val(appOrderItem.work_order_timeline);
            });

            // 关闭
            $('.hostInfoDetail .closeBtn').on('click', function () {
                $('.hostInfoDetail').animate({"right": "-400px"}, function () {
                    $(this).hide();
                });
            });
        });

    }

    // 时间轴
    systole(self) {
        setTimeout(function () {
            if (!$(".history").length) {
                return;
            }
            let $warpEle = $(".history-date"),
                $targetA = $warpEle.find("h2 a,ul li dl dt a"),
                parentH,
                eleTop = [];

            parentH = $(".history-date").height();


            $warpEle.parent().css({"height": 59});

            setTimeout(function () {
                $('.orderContainer .historyContainer').css("visibility", "visible");

                $warpEle.find("ul").children(":not('h2:first')").each(function (idx) {
                    eleTop.push($(this).position().top);
                    $(this).css({"margin-top": -eleTop[idx]}).children().hide();
                }).animate({"margin-top": 0}, 1600).children().fadeIn();

                $warpEle.parent().animate({"height": parentH, "opacity": "1"}, "slow");

                $warpEle.find("ul").children(":not('h2:first')").addClass("bounceInDown").css({
                    "-webkit-animation-duration": "2s",
                    "-webkit-animation-delay": "0",
                    "-webkit-animation-timing-function": "ease",
                    "-webkit-animation-fill-mode": "both"
                }).end().children("h2").css({"position": "relative"});

            }, 600);

        }, 1000);

        // $targetA.click(function () {
        //     $(this).parent().css({"position": "relative"});
        //     $(this).parent().siblings().slideToggle();
        //     $warpEle.parent().removeAttr("style");
        //     return false;
        // });

    };


}

// 删除主机请求
function deleteHost(self, hostId, url) {
    let body = JSON.stringify({id: hostId});
    let options = self.baseTool.Header();
    self.http.post(`${AppEnvConfig.env}${url}`, body, options)
        .map(res => res.json())
        .subscribe(data => {
            if (data) {
                if (data.status == 500) {
                    self.baseTool.alertView('删除失败，请稍后尝试...', '#D8534F');
                }
            }
            if (data.status == 200) {
                self.baseTool.alertView("删除成功", "#38AF57");
                self.baseTool.refView(self.actionUrl);
            }
        });
}

// 获取服务器数据总量
function hostTotalCount(self, cb) {
    let options = self.baseTool.Header();
    self.http.get(AppEnvConfig.env + "/apm/appCount?type=apm_app", options)
        .map(res => res.json())
        .subscribe(data => {
            if (data.status == 200) {
                cb(data.result.content);
            }
        });
}

// 报表
function reportView(data) {
    let totalCount = 0;    // 数据总量
    let pieArr = [];    // 饼状图总数据
    let arrItem = [];    // 组数每一项
    let currentIndex = 0;    // 上一个数据
    let currentNum = 0;    // 当前数据
    let nameArr = [];    // 应用名数组
    let numberArr = [];    // 应用变更次数组
    data.forEach((item, index) => {
        totalCount += item.t_counts;
        if (item.t_counts > currentNum) {
            currentNum = item.t_counts;
            currentIndex = index;
        }
        arrItem[0] = item.pro_name;
        arrItem[1] = item.t_counts;
        pieArr[index] = arrItem;
        nameArr[index] = item.pro_name;
        numberArr[index] = item.t_counts;
        arrItem = [];
    });
    pieArr[currentIndex] = {
        name: data[currentIndex]["pro_name"],
        y: data[currentIndex]["t_counts"],
        sliced: true,
        selected: true
    };
    $(function () {

        // 饼状图
        $('#container1').highcharts({
            colors: ['#058DC7', '#50B432', '#ED561B', '#DDDF00', '#282828'],
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false
            },
            title: {
                text: '听云应用当月变更频次占比-TOP5'
            },
            tooltip: {
                headerFormat: '{series.name}<br>',
                pointFormat: '{point.name}: <b>{point.percentage:.1f}%</b>'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: false
                    },
                    showInLegend: true
                }
            },
            series: [{
                type: 'pie',
                name: '听云应用变更频次占比',
                data: pieArr,
            }]
        });

        // 柱状图
        $('#container2').highcharts({
            colors: ['#50B432'],
            chart: {
                type: 'column'
            },
            title: {
                text: '听云应用当月变更频次-TOP5'
            },
            subtitle: {
                text: '数据来源: TY-CMDB'
            },
            xAxis: {
                categories: nameArr,
                crosshair: true
            },
            yAxis: {
                min: 0,
                title: {
                    text: '变更频率 (次)'
                }
            },
            tooltip: {
                headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y} 次</b></td></tr>',
                footerFormat: '</table>',
                shared: true,
                useHTML: true
            },
            plotOptions: {
                column: {
                    pointPadding: 0.2,
                    borderWidth: 1
                }
            },
            series: [{
                name: '变更次数',
                data: numberArr
            }]
        });

        $('.highcharts-credits').remove();

    });
}

// 获取主机列表数据
function getHostList(self, appName1, appName) {
    $('.mainPage .orderContainer').show();
    $('.mainPage .hostContainer').hide();
    $('.mainPage .hostRecover').hide();
    $('.mainPage .orderContainer').animate({left: "40px"});

    let options = self.baseTool.Header();
    self.http.get(`${AppEnvConfig.env}/work/orderProdsByName/${appName1}`, options)
        .map(res => res.json())
        .subscribe(datas => {
            $(".appLodingView").show();
            setTimeout(function () {
                $(".appLodingView").hide();
            }, 1500);
            if (datas.status === 200) {
                self.changeHistoryInfo = datas.result.content;
                self.baseTool.reload(self);
                self.ApmBase.systole(self);
                $(".appLodingView").hide();
            }
            self.http.get(`${AppEnvConfig.env}/host/uhost/group?appName=${appName}`, options)
                .map(res => res.json())
                .subscribe(data => {
                    if (data.status == 200) {
                        if (data.result.content[0].hasOwnProperty("UHostId")) {
                            self.appHostInfo = data.result.content;
                            self.appUpHostInfo = [];
                        } else if (data.result.content[0].hasOwnProperty("PHostId")) {
                            self.appUpHostInfo = data.result.content;
                            self.appHostInfo = [];
                        }
                        self.baseTool.reload(self);
                        $('.orderContainer .hostTab').css("visibility", "visible");
                        // 隔行变色
                        $('.orderContainer .hostTab .hostItem:even').css('backgroundColor', '#F7F9FC');

                    } else {
                        self.baseTool.alertView("主机数据拉取失败，请稍后再试...", self.baseTool.failure);
                    }
                });

        });

}