import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import{ActivatedRoute, Router, Params}from'@angular/router';
import {Http, Headers, RequestOptions} from '@angular/http';
import {AppEnvConfig} from '../../assets/conf/envConfig';
import {BaseTool} from '../../assets/baseTool';
import "rxjs/add/operator/map";
import {log} from "util";
import {Maps} from "../../assets/baseTool/maps";

declare const $: any;    // jquery
declare const Cookies;    // cookie

const role = ["研发", "测试", "产品", "运维", "系统管理员"];


@Component({
    selector: 'app-auth-manage',
    templateUrl: './auth-manage.component.html',
    styleUrls: ['./auth-manage.component.css']
})
export class AuthManageComponent implements OnInit {

    public userAuthInfo: any;    // 用户列表
    private baseTool: any;    // 工具函数
    private groupArray = [];    // 业务组
    constructor(private route: ActivatedRoute, private router: Router, private http: Http, private cdr: ChangeDetectorRef) {
        this.baseTool = BaseTool.sharedBaseTool();    // 工具函数
        this.baseTool.handleAuth(this, '3');    // 处理权限
        this.productInfo();    // 获取产品线数据

    }

    ngOnInit() {
        this.updateUserAuth(this);    // 修改用户权限
        this.pageation(this);    // 分页
    }

    userInfo(self, index=0) {
        let options = self.baseTool.Header();
        self.http.get(AppEnvConfig.env + "/user/auth/userInfoPage?index=" + index, options)
            .map(res => res.json())
            .subscribe(data => handleData(this, data));
    }

    productInfo() {
        // 获取
        Maps.porderctMap(this, (data) => {
            if (data) {
                Object.keys(data).forEach(item => {
                    this.groupArray.push(item);
                });
                this.userInfo(this, 0);
            }

        });

    }

    // 修改、删除用户权限
    updateUserAuth(self) {

        let auth = '';
        let group = '';
        let user = '';
        let user_id = '';
        // 更改用户权限
        $('.hostTab').delegate('.updateBtn', 'click', function () {
            auth = $(this).parent().parent().children().eq(3).text();
            group = $(this).parent().parent().children().eq(2).text();
            user = $(this).parent().parent().children().eq(0).text();
            user_id = $(this).parent().parent().children().eq(1).text();

            $("div.btn-group.bootstrap-select.show-tick.bla.bli button span.filter-option.pull-left").eq(1).text(auth);
            $("button.btn.dropdown-toggle.selectpicker.btn-default").eq(1).attr("title", auth);
            $("div.btn-group.bootstrap-select.show-tick.bla.bli button span.filter-option.pull-left").eq(0).text(group);
            $("button.btn.dropdown-toggle.selectpicker.btn-default").eq(0).attr("title", group);
            let authArr = auth.split(",");
            let groupArr = group.split(",");
            authArr.forEach((data) => {
                $('.dropdown-menu.open:eq(1) ul li').eq(role.indexOf(data)).addClass("selected");
                $('#id_select').children().eq(role.indexOf(data)).attr("selected", "selected");
            });
            groupArr.forEach((data) => {
                $('.dropdown-menu.open:eq(0) ul li').eq(self.groupArray.indexOf(data)).addClass("selected");
                $('#id_select1').children().eq(self.groupArray.indexOf(data)).attr("selected", "selected");
            });
        });

        // 取消变更
        $("#createCancel").on("click", function () {
            $('.modal.fade.bs-example-modal-lg.in').click();
            $('.dropdown-menu.open ul li').removeClass("selected");
            $('#id_select').children().removeAttr("selected");
        });

        // 确认
        $("#createSure").on("click", function () {
            let options = self.baseTool.Header();
            let authChange = $("#id_select").val();
            let groupChange = $("#id_select1").val();
            let authChangeStr = "";
            let groupChangeStr = "";

            authChange.forEach(data => {
                if (data) {
                    authChangeStr += data + ",";
                }
            });
            authChangeStr = authChangeStr.substring(0, authChangeStr.lastIndexOf(","));
            groupChange.forEach(data => {
                if (data) {
                    groupChangeStr += data + ",";
                }
            });
            groupChangeStr = groupChangeStr.substring(0, groupChangeStr.lastIndexOf(","));
            let body = JSON.stringify({name: user, auth: authChangeStr, uidNumber: user_id, group: groupChangeStr});
            $("#createSure").attr("disabled", "disabled");
            self.http.post(AppEnvConfig.env + "/user/auth/userInfoUpdate", body, options)
                .map(res => res.json())
                .subscribe(data => {
                    $("#createSure").removeAttr("disabled");
                    if (data) {
                        if (data.status === 200) {
                            self.baseTool.alertView("更改成功", self.baseTool.success);
                            $('.modal.fade.bs-example-modal-lg.in').click();
                            $('.dropdown-menu.open ul li').removeClass("selected");
                            $('#id_select').children().removeAttr("selected");
                            self.baseTool.refView("/userAuth/authManage");
                        } else {
                            self.baseTool.alertView("更改失败,请稍后再试...", self.baseTool.failure);
                        }
                    }
                });


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
                        self.userInfo(self, index);
                    }
                        break;
                    case '上页': {
                        index -= 10;
                        self.userInfo(self, index);
                    }
                        break;
                    case '末页': {
                        index = (Math.floor(dataCount / 10) - 1) * 10;
                        self.userInfo(self, index);
                    }
                        break;
                    case '首页': {
                        index = 0;
                        self.userInfo(self, index);
                    }
                        break;
                    case '跳转': {
                        index = ($('.M-box3').find('.active').text() - 1) * 10;
                        self.userInfo(self, index);
                    }
                        break;
                    default: {
                        index = ($(this).text() - 1) * 10;
                        self.userInfo(self, index);
                    }
                        break;
                }
            })
        });
    }

    // 获取本地数据数量
    infoTotalCount(self, cb) {
        let options = self.baseTool.Header();
        self.http.get(AppEnvConfig.env + "/user/auth/userInfoCount", options)
            .map(res => res.json())
            .subscribe(data => {
                if (data.status == 200) {
                    cb(data.result.content);
                }
            });
    }

}

// 处理数据
function handleData(self, data) {
    let auth = "";
    let authText = '';
    if (data) {
        if (data.status == 500) {
            self.baseTool.alertView('获取失败，请稍后尝试...', self.baseTool.failure);
        }
    }
    if (data.status == 200) {
        data.result.content.forEach((item) => {
            auth = item.auth;
            let authArr = auth.split(",");
            if (authArr.length > 0) {
                if (authArr.length === 1) {
                    if (authArr[0] === "1.1") {
                        authText = "研发";
                    } else if (authArr[0] === "1.2") {
                        authText = "测试";
                    } else if (authArr[0] === "1.3") {
                        authText = "产品";
                    } else if (authArr[0] === "2") {
                        authText = "运维";
                    } else if (authArr[0] === "3") {
                        authText = "系统管理员";
                    }
                } else {
                    authArr.forEach(data => {
                        if (data === "1.1") {
                            authText += "研发,";
                        } else if (data === "1.2") {
                            authText += "测试,";
                        } else if (data === "1.3") {
                            authText += "产品,";
                        } else if (data === "2") {
                            authText += "运维,";
                        } else if (data === "3") {
                            authText += "系统管理员,";
                        }
                    });
                    authText = authText.substring(0, authText.lastIndexOf(","));
                }
            }

            item['authText'] = authText;
            authText = "";
            authArr = [];
        });
        self.userAuthInfo = data.result.content;
        self.baseTool.reload(self);

        $(function () {
            let dataSet = [{val: "1.1", name: "研发"}, {val: "1.2", name: "测试"}, {val: "1.3", name: "产品"}, {
                val: "2",
                name: "运维"
            }, {val: "3", name: "系统管理员"}];
            let childenStr1 = "";
            let childenStr = "";
            $('.selectpicker').selectpicker({
                'selectedText': 'cat'
            });
            dataSet.forEach((data, i) => {
                childenStr += `<li rel="${i}"><a tabindex="0" class="" style=""><span class="text">${data.name}</span><i class="glyphicon glyphicon-ok icon-ok check-mark"></i></a></li>`;
                childenStr1 += `<option value="${data.val}">${data.name}</option>`;
            });
            $('#id_select').html(childenStr1);
            $('.dropdown-menu.open ul').eq(1).html(childenStr);
            childenStr = '';
            childenStr1 = '';

            self.groupArray.forEach((data, i) => {
                childenStr += `<li rel="${i}"><a tabindex="0" class="" style=""><span class="text">${data}</span><i class="glyphicon glyphicon-ok icon-ok check-mark"></i></a></li>`;
                childenStr1 += `<option value="${data}">${data}</option>`;
            });
            $('#id_select1').html(childenStr1);
            $('.dropdown-menu.open ul').eq(0).html(childenStr);
        });


    }
}
