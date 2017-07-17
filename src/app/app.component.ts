import {Component} from "@angular/core";
import {AppEnvConfig} from '../assets/conf/envConfig';
import {Snow} from '../assets/snow/Snow'

declare const $: any;  // 引用jquery
declare const Cookies;    // cookie

@Component({
    selector: "tingyun-cmdb",
    templateUrl: "./app.component.html",
    styleUrls: ['./app.component.css']
})

export class AppComponent {
    private url: any;
    private urlArr: any;

    constructor() {
        this.urlArr = [
            {'apm': ["app", "browser", "common", "network", "saas", "server", "netop", "controller", "alarm", "base"]},
            {'uhost': ["uHost", "upHost", "load", "uDb", "uMem", "uNet"]},
            {'alUHost': ["alUHost", "alRDS", "alSLB", "alEIP", "alVPC"]},
            {'workOrder': [
                "handledProdOrder",
                "workDbOrder",
                "handedleOrder",
                "myAcceptProdOrder",
                "myAcceptOrder",
                "myAcceptDBOrder",
                "prodOrderAll",
            ]},
            {'userAuth': ["authManage"]},
        ];
        this.url = location.href.toString();
        this.url = this.url.substring(this.url.indexOf("#/") + 2);    // 截取
        this.url = this.url.split("/");    // 转换

        // 当DOM渲染完毕时调用
        this.showNav(this);
    }

    showNav(self) {
        $(function () {
            // 给左侧导航栏标题出册点击事件,点击展开/隐藏子控件
            $(".navItemTitle").on("click", function () {
                $(this).next().slideToggle().parent().siblings().children().next().slideUp();
            });

            // 子控件点击效果
            $(".navItemTitle").next().children().children().on("click", function () {
                $(".navItemTitle").next().children().children().removeClass("actives");
                $(this).addClass("actives");
            });

            // 默认第一项展开
            $(".navItemTitle").next().hide();
            $(".navItemTitle:eq(0)").next().show();

            // 刷新保持当前选项栏显示
            self.urlArr.forEach((data, index) => {
                Object.keys(data).forEach((result) => {
                    if (result == self.url[0]) {    // 判断一级资源地址
                        $(".navItemTitle").next().hide();
                        $(".navItemTitle:eq(" + index + ")").next().show();
                    }
                    data[result].forEach((res, i) => {
                        if (res == self.url[1]) {     // 判断二级资源地址
                            $(".navItemTitle:eq(" + index + ")").next().children().children('a').eq(i).addClass("actives")
                                .parent().siblings().children().removeClass("actives");
                        }
                    });
                });
            });

            // 动画
            Snow.snowAnmiate($('.banner'));
        });
    }
}



