import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {Http, Headers, RequestOptions} from '@angular/http';
import "rxjs/add/operator/map";
import * as http from "selenium-webdriver/http";
import {AppEnvConfig} from '../../assets/conf/envConfig';
import {ActivatedRoute, Router} from '@angular/router';
import {BaseTool} from '../../assets/baseTool';

declare const $: any;
declare const Cookies: any;

// 需要处理的json属性
let jsonArr = [
    "InnerIpAddress",
    "EipAddress",
    "VpcAttributes",
    "SecurityGroupIds",
    "PublicIpAddress",
    "OperationLocks",
];

// 区域Map
let RegionMap = {"cn-beijing": "华北2", "cn-qingdao": "华北1", "cn-hangzhou": "华东1", "cn-shanghai": "华东2"};

@Component({
    selector: 'app-al-host',
    templateUrl: './al-host.component.html',
    styleUrls: ['./al-host.component.css']
})
export class AlHostComponent implements OnInit {

    private baseTool: any;    // 工具函数
    public alHostInfoObj: any;    // 云主机数据
    private createHostInfo: any;    // 创建的云主机数据
    private hostDropInfo: any;    // 删除的云主机数据
    constructor(private route: ActivatedRoute, private router: Router, private http: Http, private cdr: ChangeDetectorRef) {
        this.baseTool = BaseTool.sharedBaseTool();    // 初始化单例工具
        this.baseTool.handleAuth(this, '2');
        this.alHostInfo();    // 云虚机信息
        this.getHostDropInfo();    // 获取已删除的云虚机信息
    }

    ngOnInit() {
        this.createAllHost(this);    // 批量添加主机
        this.showInfoDetail(this);    // 显示详情页
        this.pageation(this);    // 分页
        this.searchHost(this);    // 模糊搜索
        this.handleCreateHost(this);    // 添加主机信息
        this.handleDeleteHost(this);    // 删除主机信息
        this.handleUpdateHost(this);    // 更新主机信息
        this.updateAll(this);    // 一键更新
        this.selectBox(this);    // 选项卡
        this.historySelect(this);    // 报表年份选择
    }

    // 批量添加主机
    createAllHost(self) {
        $(function () {
            $('#createAllBtn').on('click', function () {
                if (confirm("导入前请确认对应存储表无数据！")) {
                    $('.conver').show();
                    self.hostTotalCount(self, function (data) {
                        if (data.hasOwnProperty('status') && data.status !== 500) {
                            $('.conver').hide();
                            self.baseTool.alertView("导入失败！对应存储表不为空", self.baseTool.failure);
                        } else {
                            let options = self.baseTool.Header();
                            self.http.get(AppEnvConfig.env + "/alCloud/host/hostInfoCopy", options)
                                .map(res => res.json())
                                .subscribe(data => {
                                    if (data.status == 200) {
                                        $('.conver').hide();
                                        self.baseTool.alertView("导入成功！", self.baseTool.success);
                                        self.baseTool.refView("alUHost/alUHost");
                                    } else {
                                        $('.conver').hide();
                                        self.baseTool.alertView("导入失败！获取aliCloud数据失败", self.baseTool.failure);
                                    }
                                });
                        }
                    });
                }
            });
        });
    }

    // 获取本地服务器数据总量
    hostTotalCount(self, cb) {
        let options = self.baseTool.Header();
        self.http.get(AppEnvConfig.env + "/alCloud/host/hostInfoCount", options)
            .map(res => res.json())
            .subscribe(data => {
                if (data.status == 200) {
                    cb(data.result.content);
                }
            });
    }

    // 获取本地云主机数据
    alHostInfo(index = 0) {
        // 请求头部信息
        let options = this.baseTool.Header();
        $('.conver').show();
        this.http.get(AppEnvConfig.env + "/alCloud/host/hostInfo?index=" + index, options)
            .map(res => res.json())
            .subscribe(data => showInfoView(this, data));
    }

    // 详情页
    showInfoDetail(self) {
        $('.hostTab').delegate('.detailBtn', 'click', function () {
            let index = $(this).parent().parent().index() - 1;
            let hostItem = self.alHostInfoObj[index];
            let zoneIdStr = "";
            let RegionIdStr = "";
            let IoOptimizedStr = "";
            let PublicIpAddressStr = "--";
            let InstanceChargeTypeStr = "";
            let ExpiredTimeStr = new Date(hostItem.ExpiredTime).toLocaleString();
            let CreationTimeStr = new Date(hostItem.CreationTime).toLocaleString();
            let ZoneId = hostItem.ZoneId.match(/\w+/g);
            let RegionId = hostItem.RegionId.match(/\w+/g);

            if (ZoneId[1] === "beijing") {
                zoneIdStr = "华北2 可用区域" + ZoneId[2].toLocaleUpperCase();
            } else if (ZoneId[1] === "qingdao") {
                zoneIdStr = "华北1 可用区域" + ZoneId[2].toLocaleUpperCase();
            } else if (ZoneId[1] === "shanghai") {
                zoneIdStr = "华东2 可用区域" + ZoneId[2].toLocaleUpperCase();
            } else if (ZoneId[1] === "hangzhou") {
                zoneIdStr = "华东1 可用区域" + ZoneId[2].toLocaleUpperCase();
            }

            if (RegionId[1] === "beijing") {
                RegionIdStr = "华北2";
            } else if (RegionId[1] === "qingdao") {
                RegionIdStr = "华北1";
            } else if (RegionId[1] === "shanghai") {
                RegionIdStr = "华东2";
            } else if (RegionId[1] === "hangzhou") {
                RegionIdStr = "华东1";
            }

            if (hostItem.IoOptimized === '1') {
                IoOptimizedStr = " I/O优化";
            }

            if (hostItem.PublicIpAddress.IpAddress.length > 0) {
                PublicIpAddressStr = hostItem.PublicIpAddress.IpAddress[0];
            }

            if (hostItem.InstanceChargeType === "PrePaid") {
                InstanceChargeTypeStr = "包年包月";
            } else if (hostItem.InstanceChargeType === "PostPaid") {
                InstanceChargeTypeStr = "按流量收费";
            }

            // 基础信息
            $('.hostInfoDetail .hostInfoBase li:eq(0) span').text(hostItem.InstanceId);
            $('.hostInfoDetail .hostInfoBase li:eq(1) span').text(zoneIdStr);
            $('.hostInfoDetail .hostInfoBase li:eq(2) span').text(hostItem.InstanceName);
            $('.hostInfoDetail .hostInfoBase li:eq(3) span').text(RegionIdStr);
            $('.hostInfoDetail .hostInfoBase li:eq(4) span').text(hostItem.InstanceType);
            $('.hostInfoDetail .hostInfoBase li:eq(5) span').text(hostItem.ImageId);

            // 配置信息
            $('.hostInfoDetail .hostInfoSet li:eq(0) span').text(hostItem.Cpu + "核");
            $('.hostInfoDetail .hostInfoSet li:eq(1) span').text(Math.floor(hostItem.Memory / 1024) + "GB");
            $('.hostInfoDetail .hostInfoSet li:eq(2) span').text(IoOptimizedStr);
            $('.hostInfoDetail .hostInfoSet li:eq(3) span').text(hostItem.OSName);
            $('.hostInfoDetail .hostInfoSet li:eq(4) span').text(PublicIpAddressStr);
            $('.hostInfoDetail .hostInfoSet li:eq(5) span').text(hostItem.VpcAttributes.PrivateIpAddress.IpAddress[0]);

            // 付费信息
            $('.hostInfoDetail .hostInfoPay li:eq(0) span').text(InstanceChargeTypeStr);
            $('.hostInfoDetail .hostInfoPay li:eq(1) span').text(ExpiredTimeStr);
            $('.hostInfoDetail .hostInfoPay li:eq(2) span').text(CreationTimeStr);


            $('.hostInfoDetail').show().animate({"right": "0"});
        });

        // 关闭
        $('.hostInfoDetail .closeBtn').on('click', function () {
            $('.hostInfoDetail').animate({"right": "-400px"}, function () {
                $(this).hide();
            });
        });
    }

    // 分页
    pageation(self) {
        // 分页
        self.hostTotalCount(self, function (dataCount) {
            if (!dataCount) {$('.conver').hide();}
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
                        index = Math.floor(dataCount / 10) * 10;
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

                self.alHostInfo(index);
            })
        });
    }

    // 主机模糊搜索
    searchHost(self) {
        $('.searchText').keydown(function (e) {
            if (e.keyCode == 13) {
                $('.conver').show();
                let searchName = $.trim($(this).val());
                let options = self.baseTool.Header();
                if (searchName) {
                    self.http.get(AppEnvConfig.env + "/alCloud/host/hostInfo?hostName=" + searchName, options)
                        .map(res => res.json())
                        .subscribe(data => {
                            $('.conver').hide();
                            if (data.status == 200) {
                                showInfoView(self, data);
                                $('.pagination').hide();
                            }
                        });
                } else {
                    self.http.get(AppEnvConfig.env + "/alCloud/host/hostInfo?index=0", options)
                        .map(res => res.json())
                        .subscribe(data => {
                            $('.conver').hide();
                            if (data.status == 200) {
                                showInfoView(self, data);
                                $('.pagination').show();
                            }
                        });
                }
            }
        });
    }

    // 添加主机主方法
    handleCreateHost(self) {
        $(function () {

            let idStr = [];
            let regionStr = '';
            // 搜索按钮
            $('.btn.btn-default.checkHostBtn').on('click', function () {
                idStr[0] = ($.trim($('.hostId .checkHostText').val()));    // hostId
                regionStr = $('.hostId .checkHostRegion option:selected').val();    // 所属区域
                $('.hostCheckConver').hide();
                $('.hostInfoContent').html('');

                if (idStr && regionStr) {
                    $('.hostCheckConver').show();
                    let options = self.baseTool.Header();

                    self.http.get(AppEnvConfig.env + "/alCloud/host/alCloudInfo?id=[\"" + idStr + "\"]&region=" + regionStr, options)
                        .map(res => res.json())
                        .subscribe(data => {
                            if (data.status == 200) {
                                if (data.result.hasOwnProperty('content')) {
                                    $('.hostCheckConver').hide();

                                    if (data) {

                                        let hostSet = data.result.content[0];
                                        let time = new Date(hostSet['CreationTime']).toLocaleString();
                                        self.createHostInfo = hostSet;
                                        $('.hostInfoContent').html('<ul>' +
                                            '<li><span>资源ID</span><span>' + hostSet['InstanceId'] + '</span></li>' +
                                            '<li><span>创建时间</span><span>' + time + '</span></li>' +
                                            '<li><span>内网IP</span><span>' + hostSet.VpcAttributes.PrivateIpAddress.IpAddress[0] + '</span></li>' +
                                            '<li><span>镜像</span><span>' + hostSet['OSName'] + '</span></li>' +
                                            '<li><span>CPU</span><span>' + hostSet['Cpu'] + '</span></li>' +
                                            '<li><span>内存</span><span>' + hostSet['Memory'] + '</span></li>' +
                                            '</ul>').children().children().css({
                                            display: 'block',
                                            width: '400px',
                                            height: '40px',
                                            margin: '0 auto',
                                            lineHeight: '40px',
                                            borderBottom: '1px solid #cccccc'
                                        });
                                        $('.hostInfoContent ul li span').css({
                                            display: 'inline-block',
                                            width: '200px',
                                            height: '40px',
                                            lineHeight: '40px'
                                        });

                                    } else {
                                        $('.hostCheckConver').hide();
                                        $('.hostInfoContent').html('<div><span> 无数据！</span></div>').children()
                                            .css({fontSize: '20px', textAlign: 'center', lineHeight: '370px'});
                                    }

                                } else {
                                    $('.hostCheckConver').hide();
                                    $('.hostInfoContent').html('<div><span> 无数据！</span></div>').children()
                                        .css({fontSize: '20px', textAlign: 'center', lineHeight: '370px'});
                                }
                            } else {
                                $('.hostCheckConver').hide();
                                $('.hostInfoContent').html('<div><span> 获取aliCloud数据失败！</span></div>').children()
                                    .css({fontSize: '20px', textAlign: 'center', lineHeight: '370px'});
                            }
                        });
                }
            });

            // 确认按钮
            $('#createSure').on('click', function () {
                $('.createhostresult').text("");
                if (idStr && self.createHostInfo) {
                    $('.createSureconver').show();

                    // 创建主机
                    self.createHost(self);
                }

            });

            // 取消按钮
            $('#createCancel').on('click', function () {
                $('.modal.fade.bs-example-modal-lg.in').click();
                $('.hostInfoContent').children().remove();    // 移除主机信息的子元素
                $('.hostId .checkHostText').val("");    // 清空输入文字
                $('.createhostResult').text("");    // 清空状态信息
            });
        });
    }


    // 创建主机网络请求
    createHost(self) {
        let body = JSON.stringify(self.createHostInfo);
        let options = self.baseTool.Header();
        self.http.post(AppEnvConfig.env + "/alCloud/host/hostCreate", body, options)
            .map(res => res.json())
            .subscribe(data => {
                $('.createSureconver').hide();
                if (data.status == 200) {
                    $('.createhostResult').text("创建成功!").css('color', 'green');
                    setTimeout(function () {
                        $('#createCancel').click();
                    },1000);
                } else {
                    if (data.reason == "HostId existed") {
                        $('.createhostResult').text("创建失败，HostId已存在!").css('color', 'red');
                    } else {
                        $('.createhostResult').text("创建失败").css('color', 'red');
                    }
                }
            });
    }

    // 删除主机主方法
    handleDeleteHost(self) {
        $(function () {
            $('.hostTab').delegate('.deleteBtn', 'click', function () {
                if (confirm("确认删除该主机吗？")) {
                    let hostId = $(this).parent().parent().children().eq(2).text();   // hostId
                    self.deleteAliHost(self, hostId);
                }
            });
        });
    }


    // 删除主机请求
    deleteAliHost(self, hostId) {
        let options = self.baseTool.Header();
        self.http.delete(AppEnvConfig.env + "/alCloud/host/hostInfoDelete?InstanceId=" + hostId, options)
            .map(res => res.json())
            .subscribe(data => {
                if (data) {
                    if (data.status == 500) {
                        self.baseTool.alertView('删除失败，请稍后尝试...', self.baseTool.failure);
                    }
                }
                if (data.status == 200) {
                    self.baseTool.alertView("删除成功", self.baseTool.success);
                    self.baseTool.refView("alUHost/alUHost");
                }
            });
    }

    // 更新主机信息
    handleUpdateHost(self) {
        $(function () {
            $('.hostTab').delegate('.updateBtn', 'click', function () {
                let hostId = "[\"" + $(this).parent().parent().children().eq(2).text() + "\"]";   // hostId
                let reg = $(this).parent().parent().children().eq(3).find('i').text();   // 区域
                $(this).text("更新中...").attr("disabled", "disabled");
                let then = $(this);
                self.updateHost(self, {reg: reg, InstanceId: hostId}, function () {
                    then.text("更新").removeAttr("disabled");
                });
            });
        });
    }

    // 更新主机网络请求
    updateHost(self, hostInfo, cb) {
        let body = JSON.stringify({region: hostInfo.reg, id: hostInfo.InstanceId});
        let options = self.baseTool.Header();
        self.http.put(AppEnvConfig.env + "/alCloud/host/hostInfoUpdate", body, options)
            .map(res => res.json())
            .subscribe(data => {
                cb();
                if (data) {
                    if (data.status == 500 && data.reason == "network error") {
                        self.baseTool.alertView('获取aliCloud数据失败，请稍后尝试...', self.baseTool.failure);
                    } else if (data.status == 500 && data.reason == "data not changed") {

                        self.baseTool.alertView("更新失败，配置信息未改变", "#D8CD3B");
                    } else if (data.status == 500 && data.reason == "data not extend") {

                        self.baseTool.alertView("更新失败，主机信息已删除", self.baseTool.failure);
                    }
                }
                if (data.status == 200) {
                    self.baseTool.alertView("更新成功",  self.baseTool.success);
                    self.baseTool.refView("alUHost/alUHost");
                }
            });
    }

    // 一键更新
    updateAll(self) {
        $(function () {
            $('#updateAllBtn').on('click', function () {
                $(this).attr("disabled", "disabled").find('span').text("正在更新").parent().find('i').fadeIn();
                let options = self.baseTool.Header();

                self.http.get(AppEnvConfig.env + "/alCloud/host/updateAll", options)
                    .map(res => res.json())
                    .subscribe(data => {
                        $(this).removeAttr("disabled").find('span').text("一键更新").parent().find('i').hide();
                        if (data) {
                            if (data.status == 500 && data.reason == "network error") {
                                self.baseTool.alertView('获取aliCloud数据失败，请稍后尝试...', self.baseTool.failure);
                            }
                            if (data.status == 500 && data.reason == "data not changed") {

                                self.baseTool.alertView("更新失败，配置信息未改变", "#D8CD3B");
                            }
                        }
                        if (data.status == 200) {
                            self.baseTool.alertView("更新成功", self.baseTool.success);
                            self.baseTool.refView("alUHost/alUHost");
                        }
                    });
            });
        });
    }

    // 选项卡
    selectBox(self) {
        $(function () {
            $('.hostBanner .hostSelectBox div').on('click', function () {
                $(this).addClass('selectType').siblings().removeClass('selectType');
                if ($(this).find('span').text() == "主机管理") {
                    $('.hostContainer').fadeIn(300);
                    $('.hostRecover').hide();
                    $('.histoyView').hide();
                } else if($(this).find('span').text() == "变更记录统计") {
                    $('.histoyView').fadeIn(300);
                    $('.hostContainer').hide();
                    $('.hostRecover').hide();
                    $('.conver').show();
                    self.baseTool.historyViewSelect();
                    self.baseTool.getHistory(self.baseTool.resultView, self, "/alCloud/host/history?begDate=");
                } else {
                    $('.hostRecover').fadeIn(300);
                    $('.hostContainer').hide();
                    $('.histoyView').hide();
                }
            });

            // 撤销删除主机
            $('.hostRecover .hostTab').delegate('.cancelDelBtn', 'click', function () {
                $(this).text("还原中...").attr("disabled", "disabled");
                let hostId = $(this).parent().parent().children().eq(2).text();
                let then =  $(this);

                self.cancelDropHost(hostId, function () {
                    then.text("还原").removeAttr("disabled");
                });
            });
        });
    }

    // 获取删除的主机信息
    getHostDropInfo() {
        let options = this.baseTool.Header();
        this.http.get(AppEnvConfig.env + "/alCloud/host/hostDropInfo", options)
            .map(res => res.json())
            .subscribe(data => {
                if (data.status == 200) {
                    this.hostDropInfo = data['result']['content'];
                    this.baseTool.reload(this);
                }
            });
    }

    // 取消删除主机
    cancelDropHost(InstanceId, cb) {
        let body = JSON.stringify({InstanceId: InstanceId});
        let options = this.baseTool.Header();
        this.http.post(AppEnvConfig.env + "/alCloud/host/cancelDropHost", body, options)
            .map(res => res.json())
            .subscribe(data => {
                if (data.status == 200) {
                    this.baseTool.alertView("还原成功！", this.baseTool.success);
                    cb();
                    this.baseTool.refView("alUHost/alUHost");
                } else {
                    this.baseTool.alertView("还原失败！请稍后再试", this.baseTool.failure);
                }
            });
    }

    // 报表年份选择
    historySelect(self) {
        $('.histoyView .hostTitle .begDateYear').on('change', function () {
            self.baseTool.getHistory(self.baseTool.resultView, self, "/alCloud/host/history?begDate=");
        });
        $('.histoyView .hostTitle .tagView').on('change', function () {
            self.baseTool.getHistory(self.baseTool.resultView, self, "/alCloud/host/history?begDate=");
        });
    }



}

// 处理本地数据
function handleData(data) {
    if (data.status === 200) {
        data.result.content.forEach(item => {
            jsonArr.forEach(jsonItem => {
                item[jsonItem] = JSON.parse(item[jsonItem]);
            });
        });

        return data.result.content;
    }

}

// 处理页面显示
function handleView(data) {

    if (data) {
        data.forEach((item, i) => {
            $('.hostTab .hostItem').eq(i).children().eq(3).find('span').text(RegionMap[item['RegionId']]);
            if (item.Status === "Running") {
                $('.hostTab .hostItem').eq(i).children().eq(5).find('span').text("运行中").css('color', '#2fd62f');
                $('.hostTab .hostItem').eq(i).children().eq(5).find('i').css('color', '#2fd62f').addClass("fa fa-circle");
            } else if (item.Status === "Stopped") {
                $('.hostTab .hostItem').eq(i).children().eq(5).find('span').text("已停止").css('color', 'red');
                $('.hostTab .hostItem').eq(i).children().eq(5).find('i').css('color', 'red').addClass("fa fa-stop-circle");
            }
            if (item.InstanceNetworkType === "vpc") {
                $('.hostTab .hostItem').eq(i).children().eq(6).text("专有网络");
            } else if (item.InstanceNetworkType === "classic") {
                $('.hostTab .hostItem').eq(i).children().eq(6).text("经典网络");
            }

            if (item.Memory) {
                $('.hostTab .hostItem').eq(i).children().eq(7).find('.memory').text(Math.floor(item.Memory / 1024));
            }

            if (item.IoOptimized === "1") {
                $('.hostTab .hostItem').eq(i).children().eq(7).find('.IOType').text("(I/O优化)");
            }

            if (item.InstanceChargeType === "PrePaid") {
                $('.hostTab .hostItem').eq(i).children().eq(8).find('.payType').text("包年包月");
            } else if (item.InstanceChargeType === "PostPaid") {
                $('.hostTab .hostItem').eq(i).children().eq(8).find('.payType').text("按流量收费");
            }

            if (item.OSName) {
                let str = item.OSName.match(/\w+/);
                if (str[0] === "CentOS") {
                    $('.hostTab .hostItem').eq(i).children().eq(1).find('.osType').addClass("fa fa-linux").css('color', '#1296db');
                } else if (str[0] === "Windows") {
                    $('.hostTab .hostItem').eq(i).children().eq(1).find('.osType').addClass("fa fa-windows").css('color', '#1296db');
                }
                $('.hostTab .hostItem').eq(i).children().eq(1).find('.osType').on('mouseenter', function () {
                    $('.hostTab .hostItem').eq(i).children().eq(1).find('.osInfoView')
                        .css({visibility: "visible", fontSize: "11px"}).text(item.OSName).fadeIn();
                });
                $('.hostTab .hostItem').eq(i).children().eq(1).on('mouseleave', function () {
                    $('.hostTab .hostItem').eq(i).children().eq(1).find('.osInfoView').css('visibility', 'hidden').fadeOut();
                });
            }
        });
    }

}

// 抽取处理显示方法
function showInfoView(self, data) {
    self.alHostInfoObj = handleData(data);
    self.baseTool.reload(self);
    $('.conver').hide();
    // 隔行变色
    $('.hostTab .hostItem:even').css('backgroundColor', '#F7F9FC');
    handleView(self.alHostInfoObj);
}
