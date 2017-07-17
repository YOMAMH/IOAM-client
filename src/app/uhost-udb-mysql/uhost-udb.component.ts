import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import{ActivatedRoute, Router, Params}from'@angular/router';
import {Http, Headers, RequestOptions} from '@angular/http';
import {AppEnvConfig} from '../../assets/conf/envConfig';
import {BaseTool} from '../../assets/baseTool';
import "rxjs/add/operator/map";


declare const $: any;    // jquery
declare const Cookies;    // cookie


@Component({
    selector: 'app-uhost-udb',
    templateUrl: './uhost-udb.component.html',
    styleUrls: ['./uhost-udb.component.css']
})
export class UhostUdbMysqlComponent implements OnInit {

    private baseTool: any;    // 工具函数
    public mysqlInfoObj: any;    // mysql信息
    public createMysqlInfo: any;    // mysql信息
    public hostDropInfo: any;
    constructor(private route: ActivatedRoute, private http: Http, private cdr: ChangeDetectorRef) {
        this.baseTool = BaseTool.sharedBaseTool();   // 工具函数
        this.baseTool.handleAuth(this, '2');
        this.mysqlInfo();    // 获取本地mysql数据
        this.getHostDropInfo();    // 获取已删除的本地mysql数据

    }

    ngOnInit() {
        this.handleUpdateMysql(this);    // 更新mysql信息
        this.addMysqlInfoBtn(this);    // 批量添加安全证书信息
        this.handleCreateMysql(this);    // 添加mysql数据
        this.searchMysqlInfo(this);    // 模糊搜索
        this.pageation(this);    // 分页
        this.toggleView();    // 点击显示子类数据库
        this.selectBox(this);    // 选项切换
        this.handleDeleteMysql(this);    // 删除主机
        this.updateAll(this);    // 一键更新
        this.historySelect(this);    // 报表年份选择
    }

    // 批量添加mysql主方法
    addMysqlInfoBtn(self) {
        $(function () {
            $('#createAllBtn').on('click', function () {
                if (confirm("导入前请确认对应存储表无数据！")) {
                    $('.conver').show();
                    self.getMysqlInfoCount(self, function (data) {
                        if (data.status != 500) {
                            $('.conver').hide();
                            self.baseTool.alertView("导入失败！对应存储表不为空", '#D8534F');
                        } else {
                            self.addMysqlInfo(function (data) {
                                $('.conver').hide();
                                if (data.status == 200) {
                                    $('.conver').hide();
                                    self.baseTool.alertView("导入成功！", '#38AF57');
                                    self.baseTool.refView("uhost/uDb");
                                } else {
                                    $('.conver').hide();
                                    self.baseTool.alertView("导入失败！获取ucloud数据失败", '#D8534F');
                                }
                            }, self);
                        }
                    });
                }
            });
        });
    }


    // 获取mysql数据量
    getMysqlInfoCount(self, cb) {
        let body = JSON.stringify({index: 0});
        let options = self.baseTool.Header();
        self.http.post(AppEnvConfig.env + "/host/udb/mysqlInfoCount", body, options)
            .map(res => res.json())
            .subscribe(data => {
                self.baseTool.timeOut(data);    // 超时
                if (data.status == 200) {
                    cb(data.result.content);
                } else {
                    $('.conver').hide();
                    self.baseTool.alertView('获取数据失败，请稍后尝试...', '#D8534F');
                }
            });
    }

    // 获取ucloud数据
    addMysqlInfo(cb, self) {
        let options = self.baseTool.Header();
        let body = JSON.stringify({action: "getAll"});
        self.http.post(AppEnvConfig.env + "/host/udb/mysqlInfoCopy", body, options)
            .map(res => res.json())
            .subscribe(data => {
                self.baseTool.timeOut(data);    // 超时
                if (data.status == 200) {
                    if (cb) cb(data);
                } else {
                    $('.conver').hide();
                    self.baseTool.alertView('获取数据失败，请稍后尝试...', '#D8534F');
                }

            });
    }

    // 获取本地mysql数据
    mysqlInfo(index = 0) {
        $('.conver').show();
        let body = JSON.stringify({index: index});
        let options = this.baseTool.Header();
        this.http.post(AppEnvConfig.env + "/host/udb/mysqlInfo", body, options)
            .map(res => res.json())
            .subscribe(data => {
                if (data.result.hasOwnProperty('content')) {
                    $('.conver').hide();
                    handleInfo(data, this);
                    // 隔行变色
                    $('.hostTab .hostItem:even').css('backgroundColor', '#F7F9FC');
                } else {
                    this.baseTool.alertView('获取数据失败，请稍后尝试...', '#D8534F');
                }
            });
    }

    // 点击显示子类数据库
    toggleView() {
        $('.hostTab').delegate('li span.showDetail', 'click', function () {
            $(this).toggleClass('hiddenIcon');
            $(this).parent().parent().find('div').slideToggle();
        });
    }

    // 添加mysql数据
    handleCreateMysql(self) {
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

                    self.http.post(AppEnvConfig.env + "/host/udb/mysqlInfoUCloud/", body, options)
                        .map(res => res.json())
                        .subscribe(data => {
                            if (data.status == 200) {
                                if (data.result.hasOwnProperty('content')) {
                                    $('.hostCheckConver').hide();
                                    if ((data) && (data.result.content.hasOwnProperty('DataSet'))) {
                                        let LoadInfo = data.result.content.DataSet[0];
                                        let time = new Date(LoadInfo['CreateTime'] * 1000).toLocaleString();
                                        self.createMysqlInfo = LoadInfo;
                                        $('.hostInfoContent').html('<ul>' +
                                            '<li><span>资源ID</span><span>' + LoadInfo['DBId'] + '</span></li>' +
                                            '<li><span>创建时间</span><span>' + time + '</span></li>' +
                                            '<li><span>IP</span><span>' + LoadInfo['VirtualIP'] + '</span></li>' +
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
                                }} else {
                                $('.hostCheckConver').hide();
                                $('.hostInfoContent').html('<div><span> 获取ucloud数据失败！</span></div>').children()
                                    .css({fontSize: '20px', textAlign: 'center', lineHeight: '370px'});
                            }
                        });
                }
            });

            // 确认按钮
            $('#createSure').on('click', function () {
                $('.createhostresult').text("");
                if (idStr && self.createMysqlInfo) {
                    $('.createSureconver').show();

                    // 创建主机
                    self.createMysql(self);
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

    // 创建Mysql网络请求
    createMysql(self) {
        let body = JSON.stringify(self.createMysqlInfo);
        let options =self.baseTool.Header();
        self.http.post(AppEnvConfig.env + "/host/udb/mysqlCreate", body, options)
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

    // 分页
    pageation(self) {
        // 分页
        self.mysqlTotalCount(self, function (dataCount) {
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
                        self.mysqlInfo(index);
                    }
                        break;
                    case '上页': {
                        index -= 10;
                        self.mysqlInfo(index);
                    }
                        break;
                    case '末页': {
                        index = (Math.floor(dataCount / 10) - 1) * 10;
                        self.mysqlInfo(index);
                    }
                        break;
                    case '首页': {
                        index = 0;
                        self.mysqlInfo(index);
                    }
                        break;
                    case '跳转': {
                        index = ($('.M-box3').find('.active').text() - 1) * 10;
                        self.mysqlInfo(index);
                    }
                        break;
                    default: {
                        index = ($(this).text() - 1) * 10;
                        self.mysqlInfo(index);
                    }
                        break;
                }
            })
        });
    }

    // 获取本地数据数量
    mysqlTotalCount(self, cb) {
        let body = JSON.stringify({index: 0});
        let options = self.baseTool.Header();
        self.http.post(AppEnvConfig.env + "/host/udb/mysqlInfoCount", body, options)
            .map(res => res.json())
            .subscribe(data => {
                if (data.status == 200) {
                    cb(data.result.content);
                }
            });
    }

    // 更新主机信息主方法
    handleUpdateMysql(self) {
        $(function () {
            $('.hostTab').delegate('.updateBtn', 'click', function () {
                let DBId = $(this).parent().parent().children().eq(0).find('span').text();   // hostId
                let reg = $(this).parent().parent().children().eq(1).text();    // 区域
                reg = reg.substring(0, 6);
                $(this).text("更新中...").attr("disabled", "disabled");
                let then = $(this);
                self.updateMysql(self, {reg: reg, DBId: DBId}, function () {
                    then.text("更新").removeAttr("disabled");
                });
            });
        });
    }

    // 更新主机网络请求
    updateMysql(self, hostInfo, cb) {
        let body = JSON.stringify({reg: hostInfo.reg, DBId: hostInfo.DBId});
        let options = self.baseTool.Header();
        self.http.post(AppEnvConfig.env + "/host/udb/mysqlInfoUpdate", body, options)
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
                    self.baseTool.refView("uhost/uDb");
                }
            });
    }

    // 模糊搜索
    searchMysqlInfo(self) {
        $('.searchText').keydown(function (e) {
            if (e.keyCode == 13) {
                $('.conver').show();
                let searchId = $.trim($(this).val());
                let body = JSON.stringify({searchId: searchId});
                let options = self.baseTool.Header();
                if (searchId) {
                    self.http.post(AppEnvConfig.env + "/host/udb/mysqlInfo", body, options)
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
                    self.http.post(AppEnvConfig.env + "/host/udb/mysqlInfo", body, options)
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

    // 选项卡
    selectBox(self) {
        $(function () {
            $('.hostBanner .hostSelectBox div').on('click', function () {
                $(this).addClass('selectType').siblings().removeClass('selectType');
                if ($(this).find('span').text() == "MySQL") {
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
                    self.baseTool.getHistory(self.baseTool.resultView, self, "/host/udb/history?begDate=", "mysql");
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
                let hostId = $(this).parent().parent().children().eq(0).children().text();
                let then = $(this);

                self.cancelDropHost(hostId, function () {
                    then.text("还原").removeAttr("disabled");
                });
            });
        });
    }

    // 删除mysql方法
    handleDeleteMysql(self) {
        $(function () {
            $('.hostTab').delegate('.deleteBtn', 'click', function () {
                if (confirm("确认删除该主机吗？")) {
                    let hostId = $(this).parent().parent().children().eq(0).children().text();   // hostId
                    self.deleteMysql(self, hostId);
                }
            });
        });
    }


    // 删除mysql请求
    deleteMysql(self, hostId) {
        let body = JSON.stringify({hostId: hostId});
        let options = self.baseTool.Header();
        self.http.post(AppEnvConfig.env + "/host/udb/mysqlInfoDelete", body, options)
            .map(res => res.json())
            .subscribe(data => {
                if (data) {
                    if (data.status == 500) {
                        self.baseTool.alertView('删除失败，请稍后尝试...', '#D8534F');
                    }
                }
                if (data.status == 200) {
                    self.baseTool.alertView("删除成功", "#38AF57");
                    self.baseTool.refView("uhost/uDb");
                }
            });
    }

    // 获取删除的主机信息
    getHostDropInfo() {
        let body = JSON.stringify({action: 'searchDelete'});
        let options = this.baseTool.Header();

        this.http.post(AppEnvConfig.env + "/host/udb/hostDropInfo", body, options)
            .map(res => res.json())
            .subscribe(data => {
                if (data.status == 200) {
                    data['result']['content'].forEach((item) => {
                        Object.keys(item).forEach((da) => {
                            if (da == 'DataSet' && typeof da['DataSet'] == 'string') {
                                item['DataSet'] = JSON.parse(item['DataSet']);
                            }
                        });
                    });
                    this.hostDropInfo = data['result']['content'];
                    this.baseTool.reload(this);
                }
            });
    }

    // 取消删除主机
    cancelDropHost(UHostId, cb) {
        let body = JSON.stringify({UHostId: UHostId});
        let options = this.baseTool.Header();

        this.http.post(AppEnvConfig.env + "/host/udb/cancelDropHost", body, options)
            .map(res => res.json())
            .subscribe(data => {
                if (data.status == 200) {
                    this.baseTool.alertView("还原成功！", '#38AF57');
                    cb();
                    this.baseTool.refView("uhost/uDb");
                } else {
                    this.baseTool.alertView("还原失败！请稍后再试", '#D8534F');
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

                self.http.post(AppEnvConfig.env + "/host/udb/updateAll", body, options)
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
                            self.baseTool.refView("uhost/uDb");
                        }
                    });
            });
        });
    }

    // 报表年份选择
    historySelect(self) {
        $('.histoyView .hostTitle .begDateYear').on('change', function () {
            self.baseTool.getHistory(self.baseTool.resultView, self, "/host/udb/history?begDate=", "mysql");
        });
        $('.histoyView .hostTitle .tagView').on('change', function () {
            self.baseTool.getHistory(self.baseTool.resultView, self, "/host/udb/history?begDate=", "mysql");
        });
    }


}


// 处理数据
function handleInfo(data, self) {
    data['result']['content'].forEach((item) => {
        Object.keys(item).forEach((da) => {
            if (da == 'DataSet' && typeof item['DataSet'] == 'string') {
                item['DataSet'] = JSON.parse(item['DataSet']);
            }
        });
    });

    self.mysqlInfoObj = data['result']['content'];
    self.baseTool.reload(self);
}