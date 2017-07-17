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
  selector: 'app-apm-netop',
  templateUrl: './apm-netop.component.html',
  styleUrls: ['./apm-netop.component.css']
})
export class ApmNetopComponent implements OnInit {
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
  public actionUrl: string = "#/apm/netop";
  public instanceName: string;
  constructor(private route: ActivatedRoute, private router: Router, private http: Http, private cdr: ChangeDetectorRef) {
    this.baseTool = BaseTool.sharedBaseTool();    // 工具函数
    this.ApmBase = new ApmBase();    // 工具函数
    let userAuth = Cookies.get("ty_cmdb_auth");
    this.baseTool.handleAuth(this, '2');
    if (this.route.snapshot.queryParams.hasOwnProperty('instance_name')) {
      this.instanceName = this.route.snapshot.queryParams['instance_name'];
    }
    this.ApmBase.getHostInfo(this, "/apm/netop");    // 获取产品线数据
    this.ApmBase.getOrderProdMaxRound(this,"tingyun_netop");    // 应用变更频率top5
  }

  ngOnInit() {
    this.ApmBase.pagetion(this, "/apm/netop");    // 分页
    this.ApmBase.handleCreateHost(this, "听云Netop", "/apm/creatNetop");    // 创建应用
    this.ApmBase.handleDeleteHost(this, "/apm/dropNetop");    // 删除主应用
    this.ApmBase.searchHost(this, "/apm/netop");    // 模糊搜索
    this.ApmBase.updateProducts(this, "/apm/updateNetop");    // 更新数据
    this.ApmBase.infoDetailView(this);    // 应用对应主机列表
  }

}

