import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import{ActivatedRoute, Router, Params}from'@angular/router';
import {Http, Headers, RequestOptions} from '@angular/http';
import {AppEnvConfig} from '../../assets/conf/envConfig';
import {BaseTool} from '../../assets/baseTool';
import "rxjs/add/operator/map";

const d = "6b545381b02a66bef6a9681c9411d31121453056dth";    // 签名校验key

declare const $: any;    // jquery
declare const Cookies;    // cookie


@Component({
    selector: 'app-uhost-recove',
    templateUrl: './uhost-recove.component.html',
    styleUrls: ['./uhost-recove.component.css']
})
export class UhostRecoveComponent implements OnInit {

    public loadInfoObj: any;    // 负载均衡信息
    private createLoadInfo: any;    // 创建负载均衡信息
    private hostDropInfo: any;
    private baseTool: any;    // 工具函数

    constructor(private route: ActivatedRoute, private http: Http, private cdr: ChangeDetectorRef) {
        this.baseTool = BaseTool.sharedBaseTool();    // 工具函数
        this.baseTool.handleAuth(this, '2');
        this.loadInfo();    // 负载均衡信息
        this.pageation(this);    // 分页
        this.getHostDropInfo();    // 获取删除的数据
    }

    ngOnInit() {
        this.addLoadInfoBtn(this);    // 批量添加负载均衡信息
        this.searchLoadInfo(this);    // 模糊搜索
        this.selectBox(this);    // 选项切换
        this.handleCreateLoad(this);    // 添加负载均衡信息
        this.handleUpdateLoad(this);    // 更新负载均衡信息
        this.handleDeleteLoad(this);    // 删除负载均衡信息
        this.updateAll(this);    // 一键更新
        this.historySelect(this);    // 报表年份选择
    }

    // 批量添加信息
    addLoadInfoBtn(self) {
        $(function () {
            $('#createAllBtn').on('click', function () {
                if (confirm("导入前请确认对应存储表无数据！")) {
                    $('.conver').show();
                    self.loadTotalCount(self, function (data) {
                        if (data.status != 500) {
                            $('.conver').hide();
                            alertView("导入失败！对应存储表不为空", '#D8534F');
                        } else {
                            self.addLoadInfo(function (data) {
                                if (data.status == 200) {
                                    $('.conver').hide();
                                    alertView("导入成功！", '#38AF57');
                                    refView();
                                } else {
                                    $('.conver').hide();
                                    alertView("导入失败！获取ucloud数据失败", '#D8534F');
                                }
                            }, self);
                        }
                    });
                }
            });
        });
    }

    // 批量添加信息network
    addLoadInfo(cb, self) {
        let options = self.baseTool.Header();
        let body = JSON.stringify({action: "getAll"});
        self.http.post(AppEnvConfig.env + "/host/load/loadInfoCopy", body, options)
            .map(res => res.json())
            .subscribe(data => {
                timeOut(data);    // 超时
                if (data.status == 200) {
                    if (cb) cb(data);
                } else {
                    $('.conver').hide();
                    alertView('获取数据失败，请稍后尝试...', '#D8534F');
                }

            });
    }

    // 获取本地数据数量
    loadTotalCount(self, cb) {
        let body = JSON.stringify({index: 0});
        let options = self.baseTool.Header();
        self.http.post(AppEnvConfig.env + "/host/load/loadInfoCount", body, options)
            .map(res => res.json())
            .subscribe(data => {
                if (data.status == 200) {
                    cb(data.result.content);
                }
            });
    }

    // 获取本地负载均衡数据
    loadInfo(index = 0) {
        $('.conver').show();
        let body = JSON.stringify({index: index});
        let options = this.baseTool.Header();
        this.http.post(AppEnvConfig.env + "/host/load/loadInfo", body, options)
            .map(res => res.json())
            .subscribe(data => {
                if (data.result.hasOwnProperty('content')) {
                    $('.conver').hide();
                    handleInfo(data, this);
                    // 隔行变色
                    $('.hostTab .hostItem:even').css('backgroundColor', '#F7F9FC');
                } else {
                    alertView('获取数据失败，请稍后尝试...', '#D8534F');
                }
            });
    }

    // 添加负载均衡主方法
    handleCreateLoad(self) {
        $(function () {
            let idStr = '';
            let regionStr = '';
            // 搜索按钮
            $('.btn.btn-default.checkHostBtn').on('click', function () {
                idStr = $('.hostId .checkHostText').val();    // hostId
                regionStr = $('.hostId .checkHostRegion option:selected').val();    // 所属区域
                $('.hostCheckConver').hide();
                $('.hostInfoContent').html('');

                if (idStr && regionStr) {
                    $('.hostCheckConver').show();
                    let body = JSON.stringify({id: idStr, reg: regionStr});
                    let options = self.baseTool.Header();

                    self.http.post(AppEnvConfig.env + "/host/load/loadInfoUCloud/", body, options)
                        .map(res => res.json())
                        .subscribe(data => {
                            if (data.status == 200) {
                                if (data.result.hasOwnProperty('content')) {
                                    $('.hostCheckConver').hide();
                                    if ((data) && (data.result.content.TotalCount != 0)) {
                                        let LoadInfo = data.result.content.DataSet[0];
                                        let time = new Date(LoadInfo['CreateTime'] * 1000).toLocaleString();
                                        self.createLoadInfo = LoadInfo;
                                        self.createLoadInfo['Zone'] = $('.checkHostRegion option:selected').val();
                                        let ipStr = LoadInfo['IPSet'].length > 0 ? LoadInfo['IPSet'][0]['EIP'] : "";
                                        $('.hostInfoContent').html('<ul>' +
                                            '<li><span>资源ID</span><span>' + LoadInfo['ULBId'] + '</span></li>' +
                                            '<li><span>创建时间</span><span>' + time + '</span></li>' +
                                            '<li><span>IP</span><span>' + ipStr + '</span></li>' +
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
                                $('.hostInfoContent').html('<div><span>获取ucloud数据失败！</span></div>').children()
                                    .css({fontSize: '20px', textAlign: 'center', lineHeight: '370px'});
                            }
                        });
                }
            });

            // 确认按钮
            $('#createSure').on('click', function () {
                $('.createhostresult').text("");
                if (idStr && self.createLoadInfo) {
                    $('.createSureconver').show();

                    // 创建主机
                    self.createLoad(self);
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

    // 更新主机信息主方法
    handleUpdateLoad(self) {
        $(function () {
            $('.hostTab').delegate('.updateBtn', 'click', function () {
                let ULBId = $(this).parent().parent().children().eq(1).text();   // hostId
                let reg = $(this).parent().parent().children().eq(0).find('span').text();    // 区域
                reg = reg.substring(0, 6);
                $(this).text("更新中...").attr("disabled", "disabled");
                let then = $(this);
                self.updateLoad(self, {reg: reg, ULBId: ULBId}, function () {
                    then.text("更新").removeAttr("disabled");
                });
            });
        });
    }

    // 创建主机网络请求
    createLoad(self) {
        let body = JSON.stringify(self.createLoadInfo);
        let options = self.baseTool.Header();
        self.http.post(AppEnvConfig.env + "/host/load/loadCreate", body, options)
            .map(res => res.json())
            .subscribe(data => {
                timeOut(data);     // 超时
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

    // 更新主机网络请求
    updateLoad(self, hostInfo, cb) {
        let body = JSON.stringify({reg: hostInfo.reg, ULBId: hostInfo.ULBId});
        let options = self.baseTool.Header();
        self.http.post(AppEnvConfig.env + "/host/load/loadInfoUpdate", body, options)
            .map(res => res.json())
            .subscribe(data => {
                timeOut(data);     // 超时
                cb();
                if (data) {
                    if (data.status == 500 && data.reason == "network error") {
                        alertView('获取ucloud数据失败，请稍后尝试...', '#D8534F');
                    }
                    if (data.status == 500 && data.reason == "data not changed") {

                        alertView("更新失败，配置信息未改变", "#D8CD3B");
                    }
                }
                if (data.status == 200) {
                    alertView("更新成功", "#38AF57");
                    refView();
                }
            });
    }

    // 模糊搜索
    searchLoadInfo(self) {
        $('.searchText').keydown(function (e) {
            if (e.keyCode == 13) {
                $('.conver').show();
                let searchId = $.trim($(this).val());
                let body = JSON.stringify({searchId: searchId});
                let options = self.baseTool.Header();
                if (searchId) {
                    self.http.post(AppEnvConfig.env + "/host/load/loadInfo", body, options)
                        .map(res => res.json())
                        .subscribe(data => {
                            if (data.status == 200) {
                                $('.conver').hide();
                                handleInfo(data, self);
                                $('.pagination').hide();
                            }
                        });
                } else {
                    let body = JSON.stringify({index: 0});
                    self.http.post(AppEnvConfig.env + "/host/load/loadInfo", body, options)
                        .map(res => res.json())
                        .subscribe(data => {
                            if (data.status == 200) {
                                $('.conver').hide();
                                handleInfo(data, self);
                                $('.pagination').show();
                            }
                        });
                }
            }
        });
    }

    // 分页
    pageation(self) {
        // 分页
        self.loadTotalCount(self, function (dataCount) {
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
                        self.loadInfo(index);
                    }
                        break;
                    case '上页': {
                        index -= 10;
                        self.loadInfo(index);
                    }
                        break;
                    case '末页': {
                        index = (Math.floor(dataCount / 10) - 1) * 10;
                        self.loadInfo(index);
                    }
                        break;
                    case '首页': {
                        index = 0;
                        self.loadInfo(index);
                    }
                        break;
                    case '跳转': {
                        index = ($('.M-box3').find('.active').text() - 1) * 10;
                        self.loadInfo(index);
                    }
                        break;
                    default: {
                        index = ($(this).text() - 1) * 10;
                        self.loadInfo(index);
                    }
                        break;
                }
            })
        });
    }

    // 选项卡
    selectBox(self) {
        $(function () {
            $('.hostBanner .hostSelectBox div').on('click', function () {
                $(this).addClass('selectType').siblings().removeClass('selectType');
                if ($(this).find('span').text() == "负载均衡") {
                    $('.mainPage .hostContainer').fadeIn(300);
                    $('.mainPage .hostRecover').hide();
                    $('.mainPage .hostRecover1').hide();
                    $('.histoyView').hide();
                } else if ($(this).find('span').text() == "回收站") {
                    $('.mainPage .hostRecover').fadeIn(300);
                    $('.mainPage .hostContainer').hide();
                    $('.mainPage .hostRecover1').hide();
                    $('.histoyView').hide();
                } else if($(this).find('span').text() == "变更记录统计") {
                    $('.histoyView').fadeIn(300);
                    $('.hostContainer').hide();
                    $('.hostRecover').hide();
                    $('.conver').show();
                    self.baseTool.historyViewSelect();
                    self.baseTool.getHistory(self.baseTool.resultView, self, "/host/load/history?begDate=");
                } else {
                    $('.mainPage .hostRecover1').fadeIn(300);
                    $('.mainPage .hostContainer').hide();
                    $('.mainPage .hostRecover').hide();
                    $('.histoyView').hide();
                }
            });

            // 撤销删除主机
            $('.hostRecover .hostTab').delegate('.cancelDelBtn', 'click', function () {
                $(this).text("还原中...").attr("disabled", "disabled");
                let hostId = $(this).parent().parent().children().eq(1).text();
                let then = $(this);

                self.cancelDropHost(hostId, function () {
                    then.text("还原").removeAttr("disabled");
                });
            });
        });
    }

    // 获取ssl信息数量
    getSSLInfoCount(self, cb) {
        let body = JSON.stringify({index: 0});
        let options = self.baseTool.Header();
        self.http.post(AppEnvConfig.env + "/host/load/loadInfoCount", body, options)
            .map(res => res.json())
            .subscribe(data => {
                if (data.status == 200) {
                    cb(data.result.content);
                }
            });
    }

    addSSLInfoBtn(self) {
        $(function () {
            $('#createAllBtn').on('click', function () {
                if (confirm("导入前请确认对应存储表无数据！")) {
                    $('.conver').show();
                    self.getSSLInfoCount(self, function (data) {
                        if (data.status != 500) {
                            alertView("导入失败！对应存储表不为空", '#D8534F');
                        } else {
                            self.addLoadInfo(function (data) {
                                if (data.status == 200) {
                                    $('.conver').hide();
                                    alertView("导入成功！", '#38AF57');
                                    refView();
                                } else {
                                    $('.conver').hide();
                                    alertView("导入失败！获取ucloud数据失败", '#D8534F');
                                }
                            }, self);
                        }
                    });
                }
            });
        });
    }

    // 删除负载均衡主方法
    handleDeleteLoad(self) {
        $(function () {
            $('.hostTab').delegate('.deleteBtn', 'click', function () {
                if (confirm("确认删除该主机吗？")) {
                    let hostId = $(this).parent().parent().children().eq(1).text();   // hostId
                    self.deleteLoad(self, hostId);
                }
            });
        });
    }

    // 删除负载均衡请求
    deleteLoad(self, hostId) {
        let body = JSON.stringify({hostId: hostId});
        let options = self.baseTool.Header();
        self.http.post(AppEnvConfig.env + "/host/load/loadInfoDelete", body, options)
            .map(res => res.json())
            .subscribe(data => {
                if (data) {
                    if (data.status == 500) {
                        alertView('删除失败，请稍后尝试...', '#D8534F');
                    }
                }
                if (data.status == 200) {
                    alertView("删除成功", "#38AF57");
                    refView();
                }
            });
    }

    // 获取删除的主机信息
    getHostDropInfo() {
        let body = JSON.stringify({action: 'searchDelete'});
        let options = this.baseTool.Header();

        this.http.post(AppEnvConfig.env + "/host/load/hostDropInfo", body, options)
            .map(res => res.json())
            .subscribe(data => {
                if (data.status == 200) {
                    data['result']['content'].forEach((item) => {
                        Object.keys(item).forEach((da) => {
                            if (da == 'VServerSet' && typeof da['VServerSet'] == 'string') {
                                item['VServerSet'] = JSON.parse(item['VServerSet']);
                            }
                            if (da == 'IPSet' && typeof item['IPSet'] == 'string') {
                                item['IPSet'] = JSON.parse(item['IPSet']);
                            }
                        });
                    });
                    this.hostDropInfo = data['result']['content'];
                    this.reload();
                }
            });
    }

    // 取消删除主机
    cancelDropHost(UHostId, cb) {
        let body = JSON.stringify({UHostId: UHostId});
        let options = this.baseTool.Header();

        this.http.post(AppEnvConfig.env + "/host/load/cancelDropHost", body, options)
            .map(res => res.json())
            .subscribe(data => {
                if (data.status == 200) {
                    alertView("还原成功！", '#38AF57');
                    cb();
                    refView();
                } else {
                    alertView("还原失败！请稍后再试", '#D8534F');
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

                self.http.post(AppEnvConfig.env + "/host/load/updateAll", body, options)
                    .map(res => res.json())
                    .subscribe(data => {
                        $(this).removeAttr("disabled").find('span').text("一键更新").parent().find('i').hide();
                        if (data) {
                            if (data.status == 500 && data.reason == "network error") {
                                alertView('获取ucloud数据失败，请稍后尝试...', '#D8534F');
                            }
                            if (data.status == 500 && data.reason == "data not changed") {

                                alertView("更新失败，配置信息未改变", "#D8CD3B");
                            }
                        }
                        if (data.status == 200) {
                            alertView("更新成功", "#38AF57");
                            refView();
                        }
                    });
            });
        });
    }

    // 报表年份选择
    historySelect(self) {
        $('.histoyView .hostTitle .begDateYear').on('change', function () {
            self.baseTool.getHistory(self.baseTool.resultView, self, "/host/load/history?begDate=");
        });
        $('.histoyView .hostTitle .tagView').on('change', function () {
            self.baseTool.getHistory(self.baseTool.resultView, self, "/host/load/history?begDate=");
        });
    }

    // 重新渲染界面
    reload() {
        this.cdr.detectChanges();    // 禁止自动检测
        this.cdr.markForCheck();    // 手动检测数据变化
    }

}

// base64编码
function base64(str1, str2) {
    return btoa(str1 + '^&' + str2);
}

// 弹出框
function alertView(text, color) {
    $('.hostInfoRequestResView').text(text)
        .css('backgroundColor', color).fadeIn(300);
    setTimeout(function () {
        $('.hostInfoRequestResView').text('')
            .css('backgroundColor', 'none').fadeOut(500);
    }, 2000);
}

// 超时
function timeOut(data) {
    setTimeout(function () {
        if (!data) {
            $('.conver').hide();
            alertView('获取数据失败，请稍后尝试...', '#D8534F');
        }
    }, 3000);
}

// 刷新
function refView() {
    setTimeout(function () {
        location.href = "#/uhost/load";
        location.reload();
    }, 2500);
}

// 处理数据
function handleInfo(data, self) {
    data['result']['content'].forEach((item, i) => {
        Object.keys(item).forEach((da) => {
            if (da == 'VServerSet' && typeof item['VServerSet'] == 'string') {
                item['VServerSet'] = JSON.parse(item['VServerSet']);
            }
            if (da == 'IPSet' && typeof item['IPSet'] == 'string') {
                item['IPSet'] = JSON.parse(item['IPSet']);
            }
        });
    });

    self.loadInfoObj = data['result']['content'];
    self.reload();
}

