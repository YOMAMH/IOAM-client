import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Http, Headers, RequestOptions} from '@angular/http';
import {AppEnvConfig} from '../../assets/conf/envConfig';
import {BaseTool} from '../../assets/baseTool';
import "rxjs/add/operator/map";

declare const $;
declare const Cookies;



@Component({
    selector: 'app-uhost-host-manage',
    templateUrl: './uhost-host-manage.component.html',
    styleUrls: ['./uhost-host-manage.component.css']
})
export class UhostHostManageComponent implements OnInit {

    public hostInfo: any;  // 服务器列表信息
    public hostDropInfo: any;  // 服务器删除列表信息
    public createHostInfo: any;    // 获取创建服务器的信息
    private page: string;    // 当前页数
    private baseTool: any;    // 工具函数
    constructor(private route: ActivatedRoute, private router: Router, private http: Http, private cdr: ChangeDetectorRef) {
        this.baseTool = BaseTool.sharedBaseTool();    // 工具函数
        this.baseTool.handleAuth(this, '2');
        this.page = this.route.snapshot.queryParams['page'] ? this.route.snapshot.queryParams['page'] : "0";
        this.getHostInfo(parseInt(this.page));
        this.getHostDropInfo();    // 获取已删除的主机信息
    }

    ngOnInit() {
        this.nav(this);    // 详情页
        this.handleCreateHost(this);    // 创建主机
        this.handleUpdateHost(this);    // 更新主机
        this.handleDeleteHost(this);    // 删除主机
        this.createAllHost(this);    // 批量添加主机
        this.searchHost(this);    // 模糊搜索
        this.selectBox(this);    // 选项卡
        this.updateAll(this);    // 一键更新
        this.historySelect(this);    // 报表年份选择
    }

    // 页面跳转与分页逻辑
    nav(self) {
        $(function () {

            // 页面跳转
            $('.hostTab').delegate('.detailBtn', 'click', function () {
                let instance_name = $(this).parent().parent().find('.instanceName').find('i').text();
                self.router.navigate(['/uhost/manageDetail'], {queryParams: {instance_name: instance_name}});
            });

            // 撤销删除主机
            $('.hostRecover .hostTab').delegate('.cancelDelBtn', 'click', function () {
                $(this).text("还原中...").attr("disabled", "disabled");
                let hostId = $(this).parent().parent().find('.hostId').text();
                let then = $(this);
                self.cancelDropHost(hostId, function () {
                    then.text("还原").removeAttr("disabled");
                });
            });
            // 分页
            self.hostTotalCount(self, function (dataCount) {

                $('.M-box3').pagination({
                    totalData: dataCount ? dataCount - 10 : 50,
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
                            self.getHostInfo(index);
                        }
                            break;
                        case '上页': {
                            index -= 10;
                            self.getHostInfo(index);
                        }
                            break;
                        case '末页': {
                            index = Math.floor(dataCount / 10 - 1) * 10;
                            self.getHostInfo(index);
                        }
                            break;
                        case '首页': {
                            index = 0;
                            self.getHostInfo(index);
                        }
                            break;
                        case '跳转': {
                            index = ($('.M-box3').find('.active').text() - 1) * 10;
                            self.getHostInfo(index);
                        }
                            break;
                        default: {
                            index = ($(this).text() - 1) * 10;
                            self.getHostInfo(index);
                        }
                            break;
                    }
                })
            });

        });
    }

    // 获取服务器状态数据
    getHostInfo(index = 0) {
        $('.conver').show();
        let body = JSON.stringify({index: index});
        let options = this.baseTool.Header();
        this.http.post(AppEnvConfig.env + "/host/uhost/hostInfo", body, options)
            .map(res => res.json())
            .subscribe(data => {
                timeOut(data);     // 超时
                let info = handleInfo(data);
                this.hostInfo = info;
                $('.conver').hide();
                this.reload();
                // 隔行变色
                $('.hostTab .hostItem:even').css('backgroundColor', '#F7F9FC');
            });
    }


    // 添加主机主方法
    handleCreateHost(self) {
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

                    self.http.post(AppEnvConfig.env + "/host/uhost/hostInfoUCloud/", body, options)
                        .map(res => res.json())
                        .subscribe(data => {
                            if (data.status == 200) {
                                if (data.result.hasOwnProperty('content')) {
                                    $('.hostCheckConver').hide();

                                    if (data.result.hasOwnProperty('content') && (data.result.content.TotalCount != 0)) {
                                        let hostSet = data.result.content.UHostSet[0];
                                        let time = new Date(hostSet['CreateTime'] * 1000).toLocaleString();
                                        self.createHostInfo = hostSet;
                                        $('.hostInfoContent').html('<ul>' +
                                            '<li><span>资源ID</span><span>' + hostSet['UHostId'] + '</span></li>' +
                                            '<li><span>创建时间</span><span>' + time + '</span></li>' +
                                            '<li><span>内网IP</span><span>' + hostSet['IPSet'][0]['IP'] + '</span></li>' +
                                            '<li><span>镜像</span><span>' + hostSet['OsName'] + '</span></li>' +
                                            '<li><span>CPU</span><span>' + hostSet['CPU'] + '</span></li>' +
                                            '<li><span>内存</span><span>' + hostSet['Memory'] + '</span></li>' +
                                            '<li><span>系统盘总容量</span>' + hostSet['DiskSet'][0]['Size'] + '<span></span></li>' +
                                            '<li><span>数据盘总容量</span>' + hostSet['TotalDiskSpace'] + '<span></span></li>' +
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

    // 更新主机信息主方法
    handleUpdateHost(self) {
        $(function () {
            $('.hostTab').delegate('.updateBtn', 'click', function () {
                let hostId = $.trim($(this).parent().parent().children().eq(1).text());   // hostId
                let reg = $.trim($(this).parent().parent().children().eq(0).find('span').text());    // 区域
                reg = reg.substring(0, 6);
                $(this).text("更新中...").attr("disabled", "disabled");
                let then = $(this);
                self.updateHost(self, {reg: reg, UHostId: hostId}, function () {
                    then.text("更新").removeAttr("disabled");
                });
            });
        });
    }

    // 创建主机网络请求
    createHost(self) {
        let body = JSON.stringify(self.createHostInfo);
        let options = self.baseTool.Header();
        self.http.post(AppEnvConfig.env + "/host/uhost/hostCreate", body, options)
            .map(res => res.json())
            .subscribe(data => {
                timeOut(data);     // 超时
                $('.createSureconver').hide();
                if (data.status == 200) {
                    $('.createhostResult').text("创建成功!").css('color', 'green');
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
    updateHost(self, hostInfo, cb) {
        let body = JSON.stringify({reg: hostInfo.reg, UHostId: hostInfo.UHostId});
        let options = self.baseTool.Header();
        self.http.post(AppEnvConfig.env + "/host/uhost/hostInfoUpdate", body, options)
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
                    setTimeout(function () {
                        location.href = "#/uhost/manage"
                        ;
                        location.reload()
                    }, 3000);
                }
            });
    }

    // 删除主机主方法
    handleDeleteHost(self) {
        $(function () {
            $('.hostTab').delegate('.deleteBtn', 'click', function () {
                if (confirm("确认删除该主机吗？")) {
                    let hostId = $(this).parent().parent().children().eq(1).text();   // hostId
                    self.deleteHost(self, hostId);
                }
            });
        });
    }


    // 删除主机请求
    deleteHost(self, hostId) {
        let body = JSON.stringify({hostId: hostId});
        let options = self.baseTool.Header();
        self.http.post(AppEnvConfig.env + "/host/uhost/hostInfoDelete", body, options)
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

    // 重新渲染界面
    reload() {
        this.cdr.detectChanges();    // 禁止自动检测
        this.cdr.markForCheck();    // 手动检测数据变化
    }

    // 获取服务器数据总量
    hostTotalCount(self, cb) {
        let body = JSON.stringify({type: "count"});
        let options = self.baseTool.Header();
        self.http.post(AppEnvConfig.env + "/host/uhost/hostInfoCount", body, options)
            .map(res => res.json())
            .subscribe(data => {
                if (data.status == 200) {
                    cb(data.result.content);
                }
            });
    }

    // 批量添加主机
    createAllHost(self) {
        $(function () {
            $('#createAllBtn').on('click', function () {
                if (confirm("导入前请确认对应存储表无数据！")) {
                    $('.conver').show();
                    self.hostTotalCount(self, function (data) {
                        if (data.status != 500) {
                            $('.conver').hide();
                            alertView("导入失败！对应存储表不为空", '#D8534F');
                        } else {
                            let body = JSON.stringify({action: "add"});
                            let options = self.baseTool.Header();
                            self.http.post(AppEnvConfig.env + "/host/uhost/hostInfoCopy", body, options)
                                .map(res => res.json())
                                .subscribe(data => {
                                    if (data.status == 200) {
                                        $('.conver').hide();
                                        alertView("导入成功！", '#38AF57');
                                        refView();
                                    } else {
                                        $('.conver').hide();
                                        alertView("导入失败！获取ucloud数据失败", '#D8534F');
                                    }
                                });
                        }
                    });
                }
            });
        });
    }

    // 主机模糊搜索
    searchHost(self) {
        $('.searchText').keydown(function (e) {
            if (e.keyCode == 13) {
                $('.conver').show();
                let searchId = $.trim($(this).val());
                let body = JSON.stringify({searchId: searchId});
                let options = self.baseTool.Header();
                if (searchId) {
                    self.http.post(AppEnvConfig.env + "/host/uhost/hostInfo", body, options)
                        .map(res => res.json())
                        .subscribe(data => {
                            if (data.status == 200) {
                                $('.conver').hide();
                                let info = handleInfo(data);
                                self.hostInfo = info;
                                $('.pagination').hide();
                                self.reload();
                            }
                        });
                } else {
                    let body = JSON.stringify({index: 0});
                    self.http.post(AppEnvConfig.env + "/host/uhost/hostInfo", body, options)
                        .map(res => res.json())
                        .subscribe(data => {
                            if (data.status == 200) {
                                $('.conver').hide();
                                let info = handleInfo(data);
                                self.hostInfo = info;
                                $('.pagination').show();
                                self.reload();
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
                    self.baseTool.getHistory(self.baseTool.resultView, self, "/host/uhost/history?begDate=");
                } else {
                    $('.hostRecover').fadeIn(300);
                    $('.hostContainer').hide();
                    $('.histoyView').hide();
                }
            });
        });
    }

    // 获取删除的主机信息
    getHostDropInfo() {
        let body = JSON.stringify({action: 'searchDelete'});
        let options = this.baseTool.Header();

        this.http.post(AppEnvConfig.env + "/host/uhost/hostDropInfo", body, options)
            .map(res => res.json())
            .subscribe(data => {
                if (data.status == 200) {
                    this.hostDropInfo = handleInfo(data);
                    this.reload();
                }
            });
    }

    // 取消删除主机
    cancelDropHost(UHostId, cb) {
        let body = JSON.stringify({UHostId: UHostId});
        let options = this.baseTool.Header();

        this.http.post(AppEnvConfig.env + "/host/uhost/cancelDropHost", body, options)
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

               self.http.post(AppEnvConfig.env + "/host/uhost/updateAll", body, options)
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

    // 报表年份与业务组选择
    historySelect(self) {
        $('.histoyView .hostTitle .begDateYear').on('change', function () {
            self.baseTool.getHistory(self.baseTool.resultView, self, "/host/uhost/history?begDate=");
        });
        $('.histoyView .hostTitle .tagView').on('change', function () {
            self.baseTool.getHistory(self.baseTool.resultView, self, "/host/uhost/history?begDate=");
        });
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
            alertView('获取ucloud数据失败，请稍后尝试...', '#D8534F');
        }
    }, 3000);
}


// 刷新
function refView() {
    setTimeout(function () {
        location.href = "#/uhost/uHost";
        location.reload();
    }, 2500);
}

// 处理info数据
function handleInfo(data) {
    data['result']['content'].forEach((item) => {
        Object.keys(item).forEach((da) => {
            if (da == 'DiskSet' && typeof item['DiskSet'] == 'string') {
                item['DiskSet'] = JSON.parse(item['DiskSet']);
            }
            if (da == 'IPSet' && typeof item['IPSet'] == 'string') {
                item['IPSet'] = JSON.parse(item['IPSet']);
            }
            if (da == 'Memory') {
                item['Memory'] = (item['Memory'] / 1000).toFixed();
            }
        });
    });
    return data['result']['content'];
}