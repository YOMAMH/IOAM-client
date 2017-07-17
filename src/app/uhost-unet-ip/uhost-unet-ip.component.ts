import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Http, Headers, RequestOptions} from '@angular/http';
import {AppEnvConfig} from '../../assets/conf/envConfig';
import {BaseTool} from '../../assets/baseTool';
import "rxjs/add/operator/map";
import {nextTick} from "q";

declare const $;
declare const Cookies;

@Component({
    selector: 'app-uhost-unet-ip',
    templateUrl: './uhost-unet-ip.component.html',
    styleUrls: ['./uhost-unet-ip.component.css']
})
export class UhostUnetIpComponent implements OnInit {

    public ipInfo: any;  // ip列表信息
    public DropInfo: any;  // ip删除列表信息
    public createIpInfo: any;    // 获取创建ip的信息
    private baseTool: any;    // 工具函数
    constructor(private route: ActivatedRoute, private router: Router, private http: Http, private cdr: ChangeDetectorRef) {
        this.baseTool = BaseTool.sharedBaseTool();    // 工具函数
        this.baseTool.handleAuth(this, '2');
        this.getIpInfo();    // 获取本地ip数据
        this.getDropInfo();    // 获取已删除的主机信息
    }

    ngOnInit() {
        this.createAll(this);    // 批量添加主机
        this.selectBox(this);    // 选项卡
        this.pageation(this);    // 分页
        this.handleCreate(this);    // 添加信息
        this.searchInfo(this);    // 模糊搜索
        this.updateAll(this);    // 一键更新
        this.handleUpdate(this);    // 更新信息
        this.handleDelete(this);    // 删除信息
        this.cancelDropBtn(this);    // 撤销删除信息
        this.historySelect(this);    // 报表年份选择
    }

    // 本地数据
    getIpInfo(index = 0) {
        $('.conver').show();
        let options = this.baseTool.Header();
        this.http.get(AppEnvConfig.env + "/host/uNet/ip/Info?index=" + index, options)
            .map(res => res.json())
            .subscribe(data => {
                let info = handleInfo(data);
                this.ipInfo = info;
                $('.conver').hide();
                this.baseTool.reload(this);
                // 隔行变色
                $('.hostTab .hostItem:even').css('backgroundColor', '#F7F9FC');
            });
    }

    // 批量添加
    createAll(self) {
        $(function () {
            $('#createAllBtn').on('click', function () {
                if (confirm("导入前请确认对应存储表无数据！")) {
                    $('.conver').show();
                    self.TotalCount(self, function (data) {
                        if (data.status != 500) {
                            $('.conver').hide();
                            self.baseTool.alertView("导入失败！对应存储表不为空", '#D8534F');
                        } else {
                            let options = self.baseTool.Header();
                            self.http.get(AppEnvConfig.env + "/host/uNet/ip/InfoCopy", options)
                                .map(res => res.json())
                                .subscribe(data => {
                                    if (data.status == 200) {
                                        $('.conver').hide();
                                        self.baseTool.alertView("导入成功！", '#38AF57');
                                        self.baseTool.refView("uhost/uNet");
                                    } else {
                                        $('.conver').hide();
                                        self.baseTool.alertView("导入失败！获取ucloud数据失败", '#D8534F');
                                    }
                                });
                        }
                    });
                }
            });
        });
    }

    // 导入数据前验证本地数据量
    TotalCount(self, cb) {
        let options = self.baseTool.Header();
        self.http.get(AppEnvConfig.env + "/host/uNet/ip/InfoCount", options)
            .map(res => res.json())
            .subscribe(data => {
                if (data.status == 200) {
                    cb(data.result.content);
                }
            });
    }

    // 选项卡
    selectBox(self) {
        $(function () {

            // 路由切换
            $('.hostBanner .hostSelectBox div').on('click', function () {
                $(this).addClass('selectType').siblings().removeClass('selectType');
                if ($(this).find('span').text() == "弹性IP") {
                    self.router.navigate(['/uhost/uNet/ip']);
                } else if ($(this).find('span').text() == "共享带宽") {
                    self.router.navigate(['/uhost/uNet/shareband']);
                }
            });

            // 选项切换
            $('.hostBanner .hostSelectBox1 div').on('click', function () {
                $(this).addClass('selectType').siblings().removeClass('selectType');
                if ($(this).find('span').text() == "信息列表") {
                    $('.mainPage .hostContainer').fadeIn(300);
                    $('.mainPage .hostRecover').hide();
                    $('.mainPage .hostRecover1').hide();
                    $('.histoyView').hide();
                } else if ($(this).find('span').text() == "回收站") {
                    $('.mainPage .hostRecover').fadeIn(300);
                    $('.mainPage .hostContainer').hide();
                    $('.mainPage .hostRecover1').hide();
                    $('.histoyView').hide();
                } else if ($(this).find('span').text() == "变更记录统计") {
                    $('.histoyView').fadeIn(300);
                    $('.hostContainer').hide();
                    $('.hostRecover').hide();
                    $('.conver').show();
                    self.baseTool.historyViewSelect();
                    self.baseTool.getHistory(self.baseTool.resultView, self, "/host/uNet/ip/history?begDate=");
                } else {
                    $('.mainPage .hostRecover1').fadeIn(300);
                    $('.mainPage .hostContainer').hide();
                    $('.mainPage .hostRecover').hide();
                    $('.histoyView').hide();
                }
            });
        });
    }

    // 分页
    pageation(self) {
        // 分页
        self.TotalCount(self, function (dataCount) {
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
                        self.getIpInfo(index);
                    }
                        break;
                    case '上页': {
                        index -= 10;
                        self.getIpInfo(index);
                    }
                        break;
                    case '末页': {
                        index = (Math.floor(dataCount / 10) - 1) * 10;
                        self.getIpInfo(index);
                    }
                        break;
                    case '首页': {
                        index = 0;
                        self.getIpInfo(index);
                    }
                        break;
                    case '跳转': {
                        index = ($('.M-box3').find('.active').text() - 1) * 10;
                        self.getIpInfo(index);
                    }
                        break;
                    default: {
                        index = ($(this).text() - 1) * 10;
                        self.getIpInfo(index);
                    }
                        break;
                }
            })
        });
    }

    // 添加数据
    handleCreate(self) {
        $(function () {

            let idStr = '';
            let regionStr = '';
            // 搜索按钮
            $('.btn.btn-default.checkHostBtn').on('click', function () {
                idStr = $.trim($('.hostId .checkHostText').val());    // hostId
                regionStr = $('.hostId .checkHostRegion option:selected').val();    // 所属区域
                $('.hostCheckConver').hide();
                $('.hostInfoContent').html('');

                if (idStr && regionStr) {
                    $('.hostCheckConver').show();
                    let options = self.baseTool.Header();

                    self.http.get(AppEnvConfig.env + "/host/uNet/ip/InfoUCloud/?id=" + idStr + "&reg=" + regionStr, options)
                        .map(res => res.json())
                        .subscribe(data => handleUcloudData(data, self));
                }
            });

            // 确认按钮
            $('#createSure').on('click', function () {
                $('.createhostresult').text("");
                if (idStr && self.createIpInfo) {
                    $('.createSureconver').show();

                    // 创建主机
                    self.createInfo(self);
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

    // 创建弹性IP
    createInfo(self) {
        let body = JSON.stringify(self.createIpInfo);
        let options = self.baseTool.Header();
        self.http.post(AppEnvConfig.env + "/host/uNet/ip/createInfo", body, options)
            .map(res => res.json())
            .subscribe(data => {
                self.baseTool.timeOut(data);     // 超时
                $('.createSureconver').hide();
                if (data.status == 200) {
                    $('.createhostResult').text("创建成功!").css('color', 'green');
                    setTimeout(function () {
                        $('#createCancel').click();
                    }, 1000);
                } else {
                    if (data.reason == "HostId existed") {
                        $('.createhostResult').text("创建失败，HostId已存在!").css('color', 'red');
                    } else {
                        $('.createhostResult').text("创建失败").css('color', 'red');
                    }
                }
            });
    }

    // 模糊搜索
    searchInfo(self) {
        $('.searchText').keydown(function (e) {
            if (e.keyCode == 13) {
                $('.conver').show();
                let searchId = $.trim($(this).val());
                let body = '';
                let options = self.baseTool.Header();
                if (searchId) {
                    body = JSON.stringify({searchId: searchId});
                    $('.pagination').hide();
                } else {
                    body = JSON.stringify({index: 0});
                    $('.pagination').show();
                }
                self.http.post(AppEnvConfig.env + "/host/uNet/ip/Info", body, options)
                    .map(res => res.json())
                    .subscribe(data => {
                        if (data.status == 200) {
                            self.ipInfo = handleInfo(data);
                            $('.conver').hide();
                            self.baseTool.reload(self);

                        }
                    });
            }
        });
    }

    // 一键更新
    updateAll(self) {
        $(function () {
            $('#updateAllBtn').on('click', function () {
                $(this).attr("disabled", "disabled").find('span').text("正在更新").parent().find('i').fadeIn();
                let body = JSON.stringify({type: "update"});
                let options = self.baseTool.Header();

                self.http.post(AppEnvConfig.env + "/host/uNet/ip/updateAll", body, options)
                    .map(res => res.json())
                    .subscribe(data => {
                        $(this).removeAttr("disabled").find('span').text("一键更新").parent().find('i').hide();
                        if (data) {
                            if (data.status == 500 && data.reason == "network error") {
                                self.baseTool.alertView('获取ucloud数据失败，请稍后尝试...', '#D8534F');
                            }
                            if (data.status == 500 && data.reason == "data not changed") {

                                self.baseTool.alertView("更新失败，配置信息未改变", "#D8CD3B");
                            }
                        }
                        if (data.status == 200) {
                            self.baseTool.alertView("更新成功", "#38AF57");
                            self.baseTool.refView("uhost/uNet");
                        }
                    });
            });
        });
    }

    // 更新
    handleUpdate(self) {
        $(function () {
            $('.hostTab').delegate('.updateBtn', 'click', function () {
                let EIPId = $(this).parent().parent().children().eq(0).find('span').text();   // hostId
                let reg = $(this).parent().parent().children().eq(2).find('span').text();    // 区域
                $(this).text("更新中...").attr("disabled", "disabled");
                let then = $(this);
                self.update(self, {reg: reg, EIPId: EIPId}, function () {
                    then.text("更新").removeAttr("disabled");
                });
            });
        });
    }

    // 更新主机网络请求
    update(self, hostInfo, cb) {
        let body = JSON.stringify({reg: hostInfo.reg, EIPId: hostInfo.EIPId});
        let options = self.baseTool.Header();
        self.http.post(AppEnvConfig.env + "/host/uNet/ip/InfoUpdate", body, options)
            .map(res => res.json())
            .subscribe(data => {
                self.baseTool.timeOut(data);     // 超时
                cb();
                if (data) {
                    if (data.status == 500 && data.reason == "network error") {
                        self.baseTool.alertView('获取ucloud数据失败，请稍后尝试...', '#D8534F');
                    }
                    if (data.status == 500 && data.reason == "data not changed") {

                        self.baseTool.alertView("更新失败，配置信息未改变", "#D8CD3B");
                    }
                }
                if (data.status == 200) {
                    self.baseTool.alertView("更新成功", "#38AF57");
                    self.baseTool.refView("uhost/uNet");
                }
            });
    }

    // 删除数据方法
    handleDelete(self) {
        $(function () {
            $('.hostTab').delegate('.deleteBtn', 'click', function () {
                if (confirm("确认删除该主机吗？")) {
                    let hostId = $(this).parent().parent().children().eq(0).children().text();   // hostId
                    self.deleteInfo(self, hostId);
                }
            });
        });
    }

    // 删除数据请求
    deleteInfo(self, hostId) {
        let body = JSON.stringify({hostId: hostId});
        let options = self.baseTool.Header();
        self.http.post(AppEnvConfig.env + "/host/uNet/ip/InfoDelete", body, options)
            .map(res => res.json())
            .subscribe(data => {
                if (data) {
                    if (data.status == 500) {
                        self.baseTool.alertView('删除失败，请稍后尝试...', '#D8534F');
                    }
                }
                if (data.status == 200) {
                    self.baseTool.alertView("删除成功", "#38AF57");
                    self.baseTool.refView("uhost/uNet");
                }
            });
    }

    // 获取删除的数据
    getDropInfo() {
        let options = this.baseTool.Header();
        this.http.get(AppEnvConfig.env + "/host/uNet/ip/dropInfo", options)
            .map(res => res.json())
            .subscribe(data => {
                if (data.status == 200) {
                    this.DropInfo = handleInfo(data);
                    this.baseTool.reload(this);
                }
            });
    }

    // 取消删除按钮
    cancelDropBtn(self) {
        // 撤销删除主机
        $('.hostRecover .hostTab').delegate('.cancelDelBtn', 'click', function () {
            $(this).text("还原中...").attr("disabled", "disabled");
            let hostId = $(this).parent().parent().children().eq(0).children().text();
            let then = $(this);

            self.cancelDrop(hostId, function () {
                then.text("还原").removeAttr("disabled");
            });
        });
    }

    // 取消删除主机
    cancelDrop(UHostId, cb) {
        let body = JSON.stringify({UHostId: UHostId});
        let options = this.baseTool.Header();

        this.http.post(AppEnvConfig.env + "/host/uNet/ip/cancelDrop", body, options)
            .map(res => res.json())
            .subscribe(data => {
                if (data.status == 200) {
                    this.baseTool.alertView("还原成功！", '#38AF57');
                    cb();
                    this.baseTool.refView("uhost/uNet");
                } else {
                    this.baseTool.alertView("还原失败！请稍后再试", '#D8534F');
                }
            });
    }

    // 报表年份选择
    historySelect(self) {
        $('.histoyView .hostTitle .begDateYear').on('change', function () {
            self.baseTool.getHistory(self.baseTool.resultView, self, "/host/uNet/ip/history?begDate=");
        });
        $('.histoyView .hostTitle .tagView').on('change', function () {
            self.baseTool.getHistory(self.baseTool.resultView, self, "/host/uNet/ip/history?begDate=");
        });
    }
}


// 处理数据
function handleInfo(data) {
    data['result']['content'].forEach((item) => {
        Object.keys(item).forEach((da) => {
            if (da === 'EIPAddr' && typeof item['EIPAddr'] === 'string') {
                item['EIPAddr'] = JSON.parse(item['EIPAddr']);
                return;
            }
            if (da === 'Resource' && typeof item['Resource'] === 'string') {
                item['Resource'] = JSON.parse(item['Resource']);
                return;
            }
            if (da === 'ShareBandwidthSet' && typeof item['ShareBandwidthSet'] === 'string') {
                item['ShareBandwidthSet'] = JSON.parse(item['ShareBandwidthSet']);
                return;
            }
            if (da === 'PayMode') {
                if (item['PayMode'] === 'ShareBandwidth') {
                    item['PayMode'] = "共享带宽";
                } else if (item['PayMode'] === 'Bandwidth') {
                    item['PayMode'] = "独享带宽";
                }
                return;
            }
            if (da === 'Status') {
                if (item['Status'] === 'used') {
                    item['Status'] = "已绑定";
                }
                return;
            }
        });
    });
    return data['result']['content'];
}

// 处理获取的ucloud数据
function handleUcloudData(data, self) {
    if (data.status == 200) {
        if (data.result.hasOwnProperty('content')) {
            $('.hostCheckConver').hide();
            if ((data) && (data.result.content.TotalCount != 0)) {
                let hostSet = data.result.content[0];
                let time = new Date(hostSet['CreateTime'] * 1000).toLocaleString();
                self.createIpInfo = hostSet;
                self.createIpInfo['Zone'] = $('.checkHostRegion option:selected').val();
                $('.hostInfoContent').html('<ul>' +
                    '<li><span>资源ID</span><span>' + hostSet['EIPId'] + '</span></li>' +
                    '<li><span>创建时间</span><span>' + time + '</span></li>' +
                    '<li><span>IP</span><span>' + hostSet['EIPAddr'][0]['IP'] + '</span></li>' +
                    '<li><span>带宽</span><span>' + hostSet['Bandwidth'] + 'M' + '</span></li>' +
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
        $('.hostInfoContent').html('<div><span> 获取ucloud数据失败！</span></div>').children()
            .css({fontSize: '20px', textAlign: 'center', lineHeight: '370px'});
    }
}
