/**
 * Created by renminghe on 2017/3/22.
 */
import {Http, Headers, RequestOptions} from '@angular/http';
import {AppEnvConfig} from '../conf/envConfig';

declare const $: any;    // jquery
declare const Cookies;    // cookie
declare const Highcharts;

export class BaseTool {
    public success:string = "#38AF57";
    public failure:string = "#D8534F";
    public warn:string = "#d86b15";
    private static BaseTool: any;
    constructor() {

    }

    // 单例
    public static sharedBaseTool() {
        if (!this.BaseTool) {
            this.BaseTool = new BaseTool();
        }
        return this.BaseTool;
    }

    // 重新渲染界面
    private reload(self) {
        self.cdr.detectChanges();    // 禁止自动检测
        self.cdr.markForCheck();    // 手动检测数据变化
    }

    // 弹出框
    private alertView(text, color) {
        $('.hostInfoRequestResView').text(text)
            .css('backgroundColor', color).fadeIn(300);
        setTimeout(function () {
            $('.hostInfoRequestResView').text('')
                .css('backgroundColor', 'none').fadeOut(500);
        }, 2000);
    }

    // 成功
    private successView(text) {
        $('.hostInfoRequestResView').text(text)
            .css('backgroundColor', this.success).fadeIn(300);
        setTimeout(function () {
            $('.hostInfoRequestResView').text('')
                .css('backgroundColor', 'none').fadeOut(500);
        }, 2000);
    }

    // 失败
    private failureView(text) {
        $('.hostInfoRequestResView').text(text)
            .css('backgroundColor', this.failure).fadeIn(300);
        setTimeout(function () {
            $('.hostInfoRequestResView').text('')
                .css('backgroundColor', 'none').fadeOut(500);
        }, 2000);
    }

    // 超时
    private timeOut(data) {
        setTimeout(function () {
            if (!data) {
                $('.conver').hide();
                this.alertView('获取数据失败，请稍后尝试...', '#D8534F');
            }
        }, 3000);
    }

    // 刷新
    private refView(rotate) {
        setTimeout(function () {
            location.href = rotate;
            location.reload();
        }, 1500);
    }

    private Header() {
        let headers = new Headers({
            'content-type': 'application/json',
            Authorization : base64(Cookies.get("ty_cmdb"), Cookies.get("ty_cmdb_auth"))
        });
        return new RequestOptions({headers: headers});
    }

    private formHeader() {
        let headers = new Headers({
            'enctype' : "multipart/form-data",
            Authorization : base64(Cookies.get("ty_cmdb"), Cookies.get("ty_cmdb_auth"))
        });
        return new RequestOptions({headers: headers});
    }

    // 获取变更记录
    getHistory(cb, self, urlStr) {
        let yearView = $('.begDateYear option:selected').val();
        let tagView = $('.tagView option:selected').val();
        let options = this.Header();
        self.http.get(`${AppEnvConfig.env}${urlStr}${yearView}"01-01 00:00:00&endDate=${yearView}12-31 00:00:00&tag=${tagView}`, options)
            .map(res => res.json())
            .subscribe(data => {
                $('.conver').hide();
                if (data.status == 200) {
                    cb(data.result.content);
                } else {
                    this.alertView("获取数据失败！请稍后再试", '#D8534F');
                }
            });
    }

    // 报表视图
    resultView(data) {
        let upArr = [];    // 更新数据
        let deArr = [];    // 删除数据
        let crArr = [];    // 创建数据
        let totalUp = [];    // 更新统计
        let totalDe = [];    // 删除统计
        let totalCr = [];    // 创建统计
        let totalAl = [];    // 存在统计
        let mouth = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
        let currentMouth = new Date().getMonth();
        data.forEach((d) => {
            if (d.Action === "update" || d.Action === "createSalve") {
                upArr.push(d);
            } else if (d.Action === "delete") {
                deArr.push(d);
            } else if (d.Action === "create") {
                crArr.push(d);
            }
        });
        mouth.forEach((obj, index) => {     // 给每一项赋初值
            totalUp[index] = 0;
            totalDe[index] = 0;
            totalCr[index] = 0;
            totalAl[index] = 0;
        });
        upArr.forEach((obj) => {    // 统计每月更新总数
            let index = parseInt(obj['ChangeTime'].substring(5, 7));
            totalUp[index - 1] += 1;
        });
        deArr.forEach((obj) => {    // 统计每月删除总数
            let index = parseInt(obj['ChangeTime'].substring(5, 7));
            totalDe[index - 1] += 1;
        });
        crArr.forEach((obj, i) => {    // 统计每月创建总数
            let index = parseInt(obj['ChangeTime'].substring(5, 7));
            totalCr[index - 1] += 1;

            let selveObj = JSON.parse(obj.ChangeInfo);
            if (selveObj.hasOwnProperty("DataSet") && selveObj.hasOwnProperty("Role")) {
                let dataInfo = JSON.parse(selveObj.DataSet);
                if (dataInfo instanceof Array) {
                    totalCr[index - 1] += dataInfo.length;
                }
            }

        });

        totalCr.forEach((count, i) => {
            if (i === 0) {
                totalAl[i] = count - totalDe[i];
            } else {
                totalAl[i] = totalAl[i - 1] + totalCr[i] - totalDe[i];
            }
        });

        new Highcharts.setOptions({
            colors: ['#058DC7', '#50B432', '#ED561B', '#DDDF00', '#24CBE5', '#64E572', '#FF9655', '#FFF263', '#6AF9C4']
        });
        new Highcharts.Chart('container', {
            title: {
                text: '变更记录统计表',
                x: -20
            },
            subtitle: {
                text: '数据来源: CMDB-TY',
                x: -20
            },
            xAxis: {
                categories: mouth
            },
            yAxis: {
                title: {
                    text: '变更数量 (台)'
                },
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
            },
            tooltip: {
                valueSuffix: '台'
            },
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'middle',
                borderWidth: 0
            },
            series: [{
                name: '更新数量',
                data: totalUp
            }, {
                name: '创建数量',
                data: totalCr
            }, {
                name: '删除数量',
                data: totalDe
            }, {
                name: '存在数量',
                data: totalAl
            }]
        });
        $('.highcharts-credits').remove();
    }

    // 处理报表视图初始化显示
    historyViewSelect() {
        let nowYear = new Date().getFullYear();
        let nowMonth = new Date().getMonth() + 1;
        let yearView = $('.begDateYear');
        let endYearView = $('.endDateYear');
        let monthView = $('.begDateMonth');
        let endMonthView = $('.endDateMonth');
        yearView.children().eq(0).text(nowYear - 1).val(nowYear - 1 + "-");
        yearView.children().eq(1).text(nowYear).val(nowYear + "-").attr('selected', 'selected');
        yearView.children().eq(2).text(nowYear + 1).val(nowYear + 1 + "-");
        endYearView.children().eq(0).text(nowYear - 1).val(nowYear - 1 + "-");
        endYearView.children().eq(1).text(nowYear).val(nowYear + "-").attr('selected', 'selected');
        endYearView.children().eq(2).text(nowYear + 1).val(nowYear + 1 + "-");
        monthView.children().eq(nowMonth <= 1 ? 0 : nowMonth - 1).attr('selected', 'selected');
        endMonthView.children().eq(nowMonth <= 1 ? 0 : nowMonth).attr('selected', 'selected');
    }

    // 处理权限
    handleAuth(self,authLive) {
        let userAuth = Cookies.get("ty_cmdb_auth");
        let arr = userAuth.split(',');
        let authStr = '0';
        arr.forEach(data => {
            if (authStr < data) authStr = data;
        });
        if (userAuth && authStr < authLive) {
            self.router.navigate(['/error/routeBad']);
        }
    }

    // 检查工单变更内容格式
    formatStr(str) {
        let rangeStr = str.split("\n");
        let result = 1;
        let dataItem = "";
        rangeStr.forEach(data => {
            if (data) {
                data = data.substring(0, data.indexOf(";") + 1);
                let dataItem = $.trim(data.substring(data.indexOf(":") + 1, data.indexOf(";")));
                if (!dataItem || data.indexOf(":") === -1 || data.indexOf(";") === -1) {
                    result = 0;
                    return false;
                }
            }

        });
        return result;
    }

}

//base64 coding
function base64(str1, str2) {
    return str1 + ':' + str2;
}