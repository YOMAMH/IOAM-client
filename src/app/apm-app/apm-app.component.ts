import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {Http, Headers, RequestOptions} from '@angular/http';
import "rxjs/add/operator/map";
import * as http from "selenium-webdriver/http";
import {ActivatedRoute, Router} from '@angular/router';
import {BaseTool} from '../../assets/baseTool';
import {ApmBase} from '../../assets/baseTool/apm-base';
import {AppEnvConfig} from '../../assets/conf/envConfig';

declare const $: any;
declare const Cookies: any;

@Component({
    selector: 'app-apm-app',
    templateUrl: './apm-app.component.html',
    styleUrls: ['./apm-app.component.css']
})


export class ApmAppComponent {

    public hostInfo: any;  // 服务器列表信息
    public hostDropInfo: any;  // 服务器删除列表信息
    public createHostInfo: any;    // 获取创建服务器的信息
    public ApmBase: any;    // 工具函数
    private baseTool: any;    // 工具函数
    public infoSet = [];    // 数据单集合
    public appHostInfo: any;    // 应用部署虚机
    public appUpHostInfo: any;    // 应用部署物理机
    public orderProdMaxTop: any;    // 应用变更频率top5
    public changeHistoryInfo: any;    // 应用变更工单记录
    public actionUrl: string = "#/apm/app";
    public instanceName: string;
    constructor(private route: ActivatedRoute, private router: Router, private http: Http, private cdr: ChangeDetectorRef) {
        this.baseTool = BaseTool.sharedBaseTool();    // 工具函数
        this.ApmBase = new ApmBase();    // 工具函数
        let userAuth = Cookies.get("ty_cmdb_auth");
        if (userAuth) {
            let arr = userAuth.split(',');
            let authStr = '0';
            arr.forEach(data => {
                if (authStr < data) authStr = data;
            });
            if (userAuth && authStr < '2') {
                this.router.navigate(['/workOrder/handedleOrder']);
            }
        }
        if (this.route.snapshot.queryParams.hasOwnProperty('instance_name')) {
            this.instanceName = this.route.snapshot.queryParams['instance_name'];
        }
        this.ApmBase.getHostInfo(this, "/apm/app");    // 获取产品线数据
        this.ApmBase.getOrderProdMaxRound(this,"tingyun_app");    // 应用变更频率top5

    }

    ngOnInit() {
        this.ApmBase.pagetion(this, "/apm/app");    // 分页
        this.ApmBase.handleCreateHost(this, "听云App", "/apm/creatApp");    // 创建主机
        this.ApmBase.handleDeleteHost(this, "/apm/dropApp");    // 删除主机
        this.ApmBase.searchHost(this, "/apm/app");    // 模糊搜索
        this.ApmBase.updateProducts(this, "/apm/updateApp");    // 更新数据
        this.ApmBase.infoDetailView(this);    // 应用对应主机列表
    }

}





