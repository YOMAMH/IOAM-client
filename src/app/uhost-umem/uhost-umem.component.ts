import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import{ActivatedRoute, Router, Params}from'@angular/router';
import {Http, Headers, RequestOptions} from '@angular/http';
import {AppEnvConfig} from '../../assets/conf/envConfig';
import {BaseTool} from '../../assets/baseTool';
import "rxjs/add/operator/map";
import {browser} from "protractor";


declare const $: any;    // jquery
declare const Cookies;    // cookie

@Component({
    selector: 'app-uhost-umem',
    templateUrl: './uhost-umem.component.html',
    styleUrls: ['./uhost-umem.component.css']
})
export class UhostUmemComponent implements OnInit {

    private baseTool: any;    // 工具函数
    public redisBaseInfoObj: any;    // redis分布式版数据
    public redisGroupInfoObj: any;    // redis主备式版数据
    public createRedisInfo: any;    // redis信息
    public RedisType: string;    // redis种类
    public hostDropInfoBase: any;
    public hostDropInfoGroup: any;
    constructor(private http: Http, private cdr: ChangeDetectorRef) {
        this.baseTool = BaseTool.sharedBaseTool();    // 工具函数
        this.baseTool.handleAuth(this, '2');
        this.redisBaseInfo();    // 获取本地redis分布式版数据
        this.redisGroupInfo();    // 获取本地redis主备式版数据
        this.getHostDropInfoBase();    // 获取删除的本地redis主备式版数据
        this.getHostDropInfoGroup();    // 获取删除的本地redis主备式版数据
    }

    ngOnInit() {
        this.selectBox(this);    // 选项切换
        this.addRedisInfoBtn(this);    // 批量添加redis信息
        this.pageation(this);    // 分页
        this.searchRedisInfo(this);    // 模糊搜索
        this.handleCreateRedis(this);    // 添加redis数据
        this.handleUpdateRedis(this);    // 更新redis信息
        this.handleDeleteRedis(this);    // 删除redis信息
        this.updateAll(this);    // 一键更新
        this.historySelect(this);    // 报表年份选择
    }

    // 选项卡
    selectBox(self) {
        $(function () {
            $('.hostBanner .hostSelectBox div').on('click', function () {
                $(this).addClass('selectType').siblings().removeClass('selectType');
                if ($(this).find('span').text() == "Memcache") {
                    $('.hostContainer').fadeOut();
                    $('.mainPage .hostRecover1').show();
                    $('.mainPage .hostRecover').hide();
                    $('.histoyView').hide();
                    $('.hostBox').animate({left: '-100%'});
                } else if ($(this).find('span').text() == "回收站") {
                    $('.hostBox').animate({left: 0});
                    $('.mainPage .hostRecover').fadeIn(300);
                    $('.mainPage .hostContainer').hide();
                    $('.mainPage .hostRecover1').hide();
                    $('.histoyView').hide();
                } else if($(this).find('span').text() == "变更记录统计") {
                    $('.hostBox').animate({left: 0});
                    $('.histoyView').fadeIn(300);
                    $('.hostContainer').hide();
                    $('.hostRecover').hide();
                    $('.conver').show();
                    self.baseTool.historyViewSelect();
                    self.baseTool.getHistory(self.baseTool.resultView, self, "/host/uMem/history?begDate=");
                }  else {
                    $('.hostBox').animate({left: 0});
                    $('.hostContainer').fadeIn();
                    $('.histoyView').hide();
                    $('.mainPage .hostRecover').hide();
                }

                // 撤销删除主机
                $('.hostRecover .hostTab').delegate('.cancelDelBtn', 'click', function () {
                    $(this).text("还原中...").attr("disabled", "disabled");
                    let hostId = $(this).parent().parent().children().eq(0).children().text();
                    let then = $(this);
                    let type = $(this).parent().parent().children().eq(3).text();

                    self.cancelDropHost(hostId, type, function () {
                        then.text("还原").removeAttr("disabled");
                    });
                });
            });
            });
    }

    // 批量添加redis数据按钮
    addRedisInfoBtn(self) {
        $(function () {
            $('#createAllBtn').on('click', function () {
                if (confirm("导入前请确认对应存储表无数据！")) {
                    $('.conver').show();
                    self.getRedisInfoCount(self, function (data) {
                        if (data.status != 500) {
                            $('.conver').hide();
                            self.baseTool.alertView("导入失败！对应存储表不为空", '#D8534F');
                        } else {
                            self.addRedisInfo(function (data) {
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

    // 获取redis数据量
    getRedisInfoCount(self, cb) {
        let body = JSON.stringify({index: 0});
        let options = self.baseTool.Header();
        self.http.post(AppEnvConfig.env + "/host/uMem/redisInfoCount", body, options)
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
    addRedisInfo(cb, self) {
        let options = self.baseTool.Header();
        let body = JSON.stringify({action: "getAll"});
        self.http.post(AppEnvConfig.env + "/host/uMem/redisInfoCopy", body, options)
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

    // 获取本地redis分布式版数据
    redisBaseInfo(index = 0) {
        $('.conver').show();
        let body = JSON.stringify({index: index});
        let options = this.baseTool.Header();
        this.http.post(AppEnvConfig.env + "/host/uMem/redisBaseInfo", body, options)
            .map(res => res.json())
            .subscribe(data => {
                if (data.status == 200) {
                    if (data.result.hasOwnProperty('content')) {
                        $('.conver').hide();
                        handleInfo(data, this, "base");
                        // 隔行变色
                        $('.hostTab .hostItem:even').css('backgroundColor', '#F7F9FC');
                        $('.hostTab').delegate('.sizeTd div', 'mouseenter', function () {
                            $(this).parent().find('.usedSize').show();
                        });
                        $('.hostTab').delegate('.sizeTd div', 'mouseleave', function () {
                            $(this).parent().find('.usedSize').hide();
                        });
                        $('.conver').hide();
                    } else {
                        this.baseTool.alertView('获取数据失败，请稍后尝试...', '#D8534F');
                    }
                }else {
                    this.baseTool.alertView('获取数据失败，请稍后尝试...', '#D8534F');
                }

            });
    }

    // 获取本地redis主备式版数据
    redisGroupInfo(index = 0) {
        let body = JSON.stringify({index: index});
        let options = this.baseTool.Header();
        this.http.post(AppEnvConfig.env + "/host/uMem/redisGroupInfo", body, options)
            .map(res => res.json())
            .subscribe(data => {
                if (data.result.hasOwnProperty('content')) {
                    handleInfo(data, this, "group");
                    // 隔行变色
                    $('.hostTab .hostItem:even').css('backgroundColor', '#F7F9FC');
                    $('.conver').hide();
                } else {
                    this.baseTool.alertView('获取数据失败，请稍后尝试...', '#D8534F');
                }
            });
    }

    // 分页
    pageation(self) {
        // 分页
        self.redisTotalCount(self, function (dataCount) {

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
                        self.redisBaseInfo(index);
                        self.redisGroupInfo(index);
                    }
                        break;
                    case '上页': {
                        index -= 10;
                        self.redisBaseInfo(index);
                        self.redisGroupInfo(index);
                    }
                        break;
                    case '末页': {
                        index = (Math.floor(dataCount / 10) - 1) * 10;
                        self.redisBaseInfo(index);
                        self.redisGroupInfo(index);
                    }
                        break;
                    case '首页': {
                        index = 0;
                        self.redisBaseInfo(index);
                        self.redisGroupInfo(index);
                    }
                        break;
                    case '跳转': {
                        index = ($('.M-box3').find('.active').text() - 1) * 10;
                        self.redisBaseInfo(index);
                        self.redisGroupInfo(index);
                    }
                        break;
                    default: {
                        index = ($(this).text() - 1) * 10;
                        self.redisBaseInfo(index);
                        self.redisGroupInfo(index);
                    }
                        break;
                }
            })
        });
    }


    // 获取本地数据数量
    redisTotalCount(self, cb) {
        let body = JSON.stringify({index: 0});
        let options = self.baseTool.Header();
        self.http.post(AppEnvConfig.env + "/host/uMem/redisTotalCount", body, options)
            .map(res => res.json())
            .subscribe(data => {
                if (data.status == 200) {
                    cb(data.result.content);
                }
            });
    }

    // 模糊搜索
    searchRedisInfo(self) {
        $('.searchText').keydown(function (e) {
            if (e.keyCode == 13) {
                $('.conver').show();
                let searchId = $.trim($(this).val());
                let body = JSON.stringify({searchId: searchId});
                let options = self.baseTool.Header();
                if (searchId) {
                    self.http.post(AppEnvConfig.env + "/host/uMem/redisBaseInfo", body, options)
                        .map(res => res.json())
                        .subscribe(data => {
                            if (data.status == 200) {
                                $('.conver').hide();
                                handleInfo(data, self, "base");
                                $('.pagination').hide();
                            }
                        });

                    self.http.post(AppEnvConfig.env + "/host/uMem/redisGroupInfo", body, options)
                        .map(res => res.json())
                        .subscribe(data => {
                            if (data.status == 200) {
                                $('.conver').hide();
                                handleInfo(data, self, "group");
                                $('.pagination').hide();
                            }
                        });
                } else {
                    self.redisBaseInfo();    // 获取本地redis分布式版数据
                    self.redisGroupInfo();    // 获取本地redis主备式版数据
                }
            }
        });
    }

    // 添加redis数据主方法
    handleCreateRedis(self) {
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

                    /**
                     * 先获取redis分布式数据,如果有，显示，
                     * 如果没有继续获取redis主备式数据，如果有，显示，没有，显示无数据
                     */
                    self.http.post(AppEnvConfig.env + "/host/uMem/redisBaseInfoUCloud/", body, options)
                        .map(res => res.json())
                        .subscribe(data => {
                            if (data.status == 200) {
                                if (data.result.hasOwnProperty('content')) {
                                    $('.hostCheckConver').hide();
                                    if ((data.result.content.hasOwnProperty('DataSet')) &&
                                        (data.result.content.DataSet.length > 0)) {
                                        searchResult(self, data, "base");
                                    } else {
                                        $('.hostCheckConver').show();
                                        self.http.post(AppEnvConfig.env + "/host/uMem/redisGroupInfoUCloud/", body, options)
                                            .map(res => res.json())
                                            .subscribe(data => {
                                                if (data.status == 200) {
                                                    if (data.result.hasOwnProperty('content')) {
                                                        $('.hostCheckConver').hide();
                                                        if ((data.result.content.hasOwnProperty('DataSet')) &&
                                                            (data.result.content.DataSet.length > 0)) {
                                                            searchResult(self, data, "group");
                                                        } else {
                                                            searchResultNull("无数据！");
                                                        }
                                                    }
                                                }
                                            });
                                    }

                                } else {
                                    searchResultNull("无数据！");
                                }
                            } else {
                                searchResultNull("获取ucloud数据失败！");
                            }
                        });
                }
            });

            // 确认按钮
            $('#createSure').on('click', function () {
                $('.createhostresult').text("");
                if (idStr && self.createRedisInfo) {
                    $('.createSureconver').show();

                    // 创建主机
                    self.createRedis(self, self.RedisType);
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

    // 创建Reids network
    createRedis(self, redisType) {
        let body = JSON.stringify({info: self.createRedisInfo, redisType: redisType});
        let options = self.baseTool.Header();
        self.http.post(AppEnvConfig.env + "/host/uMem/redisCreate", body, options)
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

    // 更新主机信息主方法
    handleUpdateRedis(self) {
        $(function () {
            $('.hostTab').delegate('.updateBtn', 'click', function () {
                let Id = $(this).parent().parent().children().eq(0).find('span').text();   // redisId
                let reg = $(this).parent().parent().children().eq(1).text();    // 区域
                let type = $(this).parent().parent().children().eq(3).text();    // 机型
                reg = reg.substring(0, 6);
                $(this).text("更新中...").attr("disabled", "disabled");
                let then = $(this);
                self.updateRedis(self, {reg: reg, Id: Id, type: type}, function () {
                    then.text("更新").removeAttr("disabled");
                });


            });
        });
    }

    // 更新主机网络请求
    updateRedis(self, hostInfo, cb) {
        let body = JSON.stringify({reg: hostInfo.reg, Id: hostInfo.Id, type: hostInfo.type});
        let options = self.baseTool.Header();
        self.http.post(AppEnvConfig.env + "/host/uMem/redisInfoUpdate", body, options)
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

    // 删除redis主方法
    handleDeleteRedis(self) {
        $(function () {
            $('.hostTab').delegate('.deleteBtn', 'click', function () {
                if (confirm("确认删除该主机吗？")) {
                    let hostId = $(this).parent().parent().children().eq(0).find('span').text();   // redisId
                    let type = $(this).parent().parent().children().eq(3).text();    // 机型
                    self.deleteRedis(self, hostId, type);
                }
            });
        });
    }


    // 删除redis请求
    deleteRedis(self, hostId, type) {
        let body = JSON.stringify({hostId: hostId, type: type});
        let options = self.baseTool.Header();
        self.http.post(AppEnvConfig.env + "/host/uMem/redisInfoDelete", body, options)
            .map(res => res.json())
            .subscribe(data => {
                if (data) {
                    if (data.status == 500) {
                        self.baseTool.alertView('删除失败，请稍后尝试...', '#D8534F');
                    }
                }
                if (data.status == 200) {
                    self.baseTool.alertView("删除成功", "#38AF57");
                    self.baseTool.refView("uhost/uMem");
                }
            });
    }

    // 获取删除的主机信息
    getHostDropInfoBase() {
        let body = JSON.stringify({action: 'searchDelete'});
        let options = this.baseTool.Header();

        this.http.post(AppEnvConfig.env + "/host/uMem/hostDropInfoBase", body, options)
            .map(res => res.json())
            .subscribe(data => {
                if (data.status == 200) {
                    data['result']['content'].forEach((item) => {
                        Object.keys(data).forEach((da) => {
                            if (da == "Address") {
                                data[da] = JSON.parse(data[da]);
                            }
                        });
                    });
                    this.hostDropInfoBase = data['result']['content'];
                    this.baseTool.reload(this);
                }
            });
    }

    // 获取删除的主机信息
    getHostDropInfoGroup() {
        let headers = new Headers({
            'content-type': 'application/json', Authorization: Cookies.get("ty_cmdb"),
        });
        let body = JSON.stringify({action: 'searchDelete'});
        let options = new RequestOptions({headers: headers});

        this.http.post(AppEnvConfig.env + "/host/uMem/hostDropInfoGroup", body, options)
            .map(res => res.json())
            .subscribe(data => {
                if (data.status == 200) {
                    this.hostDropInfoGroup = data['result']['content'];
                    this.baseTool.reload(this);
                }
            });
    }

    // 取消删除主机
    cancelDropHost(UHostId, type, cb) {
        let headers = new Headers({
            'content-type': 'application/json', Authorization: Cookies.get("ty_cmdb")
        });
        let body = JSON.stringify({UHostId: UHostId, type: type});
        let options = new RequestOptions({headers: headers});

        this.http.post(AppEnvConfig.env + "/host/uMem/cancelDropHost", body, options)
            .map(res => res.json())
            .subscribe(data => {
                if (data.status == 200) {
                    this.baseTool.alertView("还原成功！", '#38AF57');
                    cb();
                    this.baseTool.refView("uhost/uMem");
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

                self.http.post(AppEnvConfig.env + "/host/uMem/updateAll", body, options)
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
                            self.baseTool.refView("uhost/uMem");
                        }
                    });
            });
        });
    }

    // 报表年份选择
    historySelect(self) {
        $('.histoyView .hostTitle .begDateYear').on('change', function () {
            self.baseTool.getHistory(self.baseTool.resultView, self, "/host/uMem/history?begDate=");
        });
        $('.histoyView .hostTitle .tagView').on('change', function () {
            self.baseTool.getHistory(self.baseTool.resultView, self, "/host/uMem/history?begDate=");
        });
    }

}

// 处理数据
function handleInfo(data, self, type) {
    let size = 0;
    if (type == "base") {
        data['result']['content'].forEach((data) => {
            Object.keys(data).forEach((da) => {
               if (da == "Address") {
                   data[da] = JSON.parse(data[da]);
               }
            });

        });
        self.redisBaseInfoObj = data['result']['content'];
        self.baseTool.reload(self);
        self.redisBaseInfoObj.forEach((obj, item) => {

            // 动画
            memAnmiate($('.hostTab .sizeContainBase .sizeView'), size, obj, item);

            // 是否到期
            isExpire(obj, item);

        });
    } else if (type == "group") {
        self.redisGroupInfoObj = data['result']['content'];
        self.baseTool.reload(self);
        self.redisGroupInfoObj.forEach((obj, item) => {

            // 动画
            memAnmiate($('.hostTab .sizeContainGroup .sizeView'), size, obj, item);

            // 是否到期
            isExpire(obj, item);
        });
    }
}

// 搜索结果显示
function searchResult(sefl, data, type) {
    let LoadInfo = data.result.content.DataSet[0];
    let time = new Date(LoadInfo['CreateTime'] * 1000).toLocaleString();
    let htmlStr = '';
    sefl.createRedisInfo = LoadInfo;
    if (type == "base") {
        sefl.RedisType = "base";
        htmlStr = '<ul>' +
            '<li><span>资源ID</span><span>' + LoadInfo['SpaceId'] + '</span></li>' +
            '<li><span>创建时间</span><span>' + time + '</span></li>' +
            '<li><span>IP</span><span>' + LoadInfo['Address'][0]['IP'] + '&nbsp;&nbsp;' + LoadInfo['Address'][1]['IP'] + '</span></li>' +
            '</ul>';
    } else if (type == "group") {
        sefl.RedisType = "group";
        htmlStr = '<ul>' +
            '<li><span>资源ID</span><span>' + LoadInfo['GroupId'] + '</span></li>' +
            '<li><span>创建时间</span><span>' + time + '</span></li>' +
            '<li><span>IP</span><span>' + LoadInfo['VirtualIP'] + '</span></li>' +
            '</ul>';
    }
    $('.hostInfoContent').html(htmlStr).children().children().css({
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
}

// 处理搜索结果无数据
function searchResultNull(text) {
    $('.hostCheckConver').hide();
    $('.hostInfoContent').html('<div><span>' + text + '</span></div>').children()
        .css({
            fontSize: '20px',
            textAlign: 'center',
            lineHeight: '370px'
        });
}

/**
 * 动画效果
 * @param dom     元素节点
 * @param size    已使用内存大小
 * @param obj     当前遍历到的数据
 * @param item    当前的第几个
 */
function memAnmiate(dom, size, obj, item) {
    size = (obj['UsedSize'] / (obj['Size'] * 1000)) * 100;

    if (size >= 90) {
        dom.eq(item).css('backgroundColor','red');
    }
    if (size >= 60 && size < 90) {
        dom.eq(item).css('backgroundColor','#FDBB44');
    }
    if (size < 60) {
        dom.eq(item).css('backgroundColor','#67cf22');
    }

    dom.eq(item).animate({width: size + "%"}, 1800);
}

// 到期
function isExpire(obj, item) {
    let nowTime = new Date().getTime() / 1000;
    if (obj['ExpireTime'] - nowTime < 864000) {
        $('.hostTab .fa.fa-exclamation-triangle.tips').eq(item).show().text("即将到期");
    }
    if (obj['ExpireTime'] - nowTime <= 0) {
        $('.hostTab .fa.fa-exclamation-triangle.tips').eq(item).show().text("已到期");
    }
}
