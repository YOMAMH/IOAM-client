import {BrowserModule} from "@angular/platform-browser";
import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {HttpModule} from '@angular/http';
import {PathLocationStrategy, HashLocationStrategy, LocationStrategy} from '@angular/common';

//表单 双向数据绑定
import {FormsModule} from "@angular/forms";


import {AppComponent} from "./app.component";
import {ApmAppComponent} from './apm-app/apm-app.component';
import {ApmBrowserComponent} from './apm-browser/apm-browser.component';
import {ApmCommonComponent} from './apm-common/apm-common.component';
import {ApmNetworkComponent} from './apm-network/apm-network.component';
import {ApmSaasComponent} from './apm-saas/apm-saas.component';
import {ApmServerComponent} from './apm-server/apm-server.component';
import {UserSetUpComponent} from './user-set-up/user-set-up.component';
import {UhostHostManageComponent} from './uhost-host-manage/uhost-host-manage.component';
import {UhostMirrorComponent} from './uhost-mirror/uhost-mirror.component';
import {UhostRecoveComponent} from './uhost-recove/uhost-recove.component';
import {UhostManageDetailComponent} from './uhost-manage-detail/uhost-manage-detail.component';
import {UhostUdbMysqlComponent} from './uhost-udb-mysql/uhost-udb.component';
import {UhostUmemComponent} from './uhost-umem/uhost-umem.component';
import {UhostUnetIpComponent} from './uhost-unet-ip/uhost-unet-ip.component';
import {UhostUnetSharebandComponent} from './uhost-unet-shareband/uhost-unet-shareband.component';
import {WorkOrderManageComponent} from './work-order-manage/work-order-manage.component';
import { AuthManageComponent } from './auth-manage/auth-manage.component';
import { WorkUnhandleorderManageComponent } from './work-unhandleorder-manage/work-unhandleorder-manage.component';
import { WorkOrderMyacceptorderComponent } from './work-order-myacceptorder/work-order-myacceptorder.component';
import { WorkOrderPublicorderComponent } from './work-order-publicorder/work-order-publicorder.component';
import { WorkOrderUnhandleallComponent } from './work-order-unhandleall/work-order-unhandleall.component';
import { WorkOrderHandledallComponent } from './work-order-handledall/work-order-handledall.component';
import { RouteBadpageComponent } from './route-badpage/route-badpage.component';
import { AlHostComponent } from './al-host/al-host.component';
import { AlRdsComponent } from './al-rds/al-rds.component';
import { AlSlbComponent } from './al-slb/al-slb.component';
import { AlEipComponent } from './al-eip/al-eip.component';
import { AlVpcComponent } from './al-vpc/al-vpc.component';
import { WorkApporderManageComponent } from './work-apporder-manage/work-apporder-manage.component';
import { WorkApporderHandledallComponent } from './work-apporder-handledall/work-apporder-handledall.component';
import { WorkApporderMyacceptorderComponent } from './work-apporder-myacceptorder/work-apporder-myacceptorder.component';
import { WorkApporderPublicorderComponent } from './work-apporder-publicorder/work-apporder-publicorder.component';
import { WorkApporderUnhandleallComponent } from './work-apporder-unhandleall/work-apporder-unhandleall.component';
import { WorkApporderUnahndleorderComponent } from './work-apporder-unahndleorder/work-apporder-unahndleorder.component';
import { UhostPhostdetailComponent } from './uhost-phostdetail/uhost-phostdetail.component';
import { ApmNetopComponent } from './apm-netop/apm-netop.component';
import { ApmControllerComponent } from './apm-controller/apm-controller.component';
import { ApmAlarmComponent } from './apm-alarm/apm-alarm.component';
import { ApmBaseComponent } from './apm-base/apm-base.component';
import { WorkDbManageComponent } from './work-db-manage/work-db-manage.component';
import { WorkDbOrderMyacceptorderComponent } from './work-db-order-myacceptorder/work-db-order-myacceptorder.component';

// apm
const apmRoutes: Routes = [
    {path: "app", component: ApmAppComponent},   // 听云产品线-app
    {path: "browser", component: ApmBrowserComponent},   // 听云产品线-browser
    {path: "common", component: ApmCommonComponent},   // 听云产品线-common
    {path: "network", component: ApmNetworkComponent},   // 听云产品线-network
    {path: "saas", component: ApmSaasComponent},   // 听云产品线-saas
    {path: "server", component: ApmServerComponent},   // 听云产品线-server
    {path: "netop", component: ApmNetopComponent},   // 听云产品线-netop
    {path: "controller", component: ApmControllerComponent},   // 听云产品线-controller
    {path: "alarm", component: ApmAlarmComponent},   // 听云产品线-alarm
    {path: "base", component: ApmBaseComponent},   // 听云产品线-base
    //其他路由重定向到apmApp
    {
        path: '**', redirectTo: "app", pathMatch: 'full'
    }
];

// user
const userRoutes: Routes = [
    {path: "setUp", component: UserSetUpComponent},   // 听云产品线-app
    //其他路由重定向到apmApp
    {
        path: '**', redirectTo: "setUp", pathMatch: 'full'
    }
];

// uhost
const uhostRoutes: Routes = [
    {path: "uHost", component: UhostHostManageComponent},   // 云主机管理
    {path: "upHost", component: UhostMirrorComponent},   // 镜像管理
    {path: "load", component: UhostRecoveComponent},   // 回收站
    {path: "manageDetail", component: UhostManageDetailComponent},   // 云主机管理详情
    {path: "uDb", component: UhostUdbMysqlComponent},   // 云数据库
    {path: "uMem", component: UhostUmemComponent},   // 云内存数据库
    {path: "uNet/ip", component: UhostUnetIpComponent},   // 基础网络/弹性IP
    {path: "uNet/shareband", component: UhostUnetSharebandComponent},   // 基础网络/共享网络
    {path: "upHostmanageDetail", component: UhostPhostdetailComponent},   // 物理机详情
    //其他路由重定向到manage
    {
        path: '**', redirectTo: "manage", pathMatch: 'full'
    }
];

// workOrderManage
const workerOrderRoutes: Routes = [
    {path: "handedleOrder", component: WorkOrderManageComponent},    // 个人已解决工单
    {path: "handledProdOrder", component: WorkApporderManageComponent},    // 个人已解决应用工单
    {path: "myAcceptProdOrder", component: WorkApporderMyacceptorderComponent},    // 我的受理应用工单
    {path: "myAcceptOrder", component: WorkOrderMyacceptorderComponent},    // 个人受理的工单
    {path: "prodOrderAll", component: WorkApporderHandledallComponent},    // 所有应用工单
    {path: "workDbOrder", component: WorkDbManageComponent},    // 数据库工单
    {path: "myAcceptDBOrder", component: WorkDbOrderMyacceptorderComponent},    // 管理数据库工单
];

// userAuthRoutes
const userAuthRoutes: Routes = [
    {path: "authManage", component: AuthManageComponent}    // 已解决工单
];

// error page
const errorRoutes: Routes = [
    {path: "routeBad", component: RouteBadpageComponent},    // 页面不存在
];

// aliCloud
const aliManageRoutes: Routes = [
    {path: "alUHost", component: AlHostComponent},   // 云主机管理
    {path: "alRDS", component: AlRdsComponent},   // 云数据库
    {path: "alSLB", component: AlSlbComponent},   // 云负载均衡
    {path: "alEIP", component: AlEipComponent},   // 弹性公网IP
    {path: "alVPC", component: AlVpcComponent},   // vpc
];

// routes
const navRoutes: Routes = [
    //其他路由重定向到apmApp
    {
        path: '', redirectTo: "apm", pathMatch: 'full'
    },
    // 听云产品线配置信息
    {
        path: "apm",
        children: apmRoutes,
    },
    // 个人中心
    {
        path: "user",
        children: userRoutes,
    },
    // 云主机管理
    {
        path: "uhost",
        children: uhostRoutes,
    },
    // 阿里云管理
    {
        path: "alUHost",
        children: aliManageRoutes,
    },
    // 工单管理
    {
        path: "workOrder",
        children: workerOrderRoutes,
    },
    // 用户权限控制
    {
        path: "userAuth",
        children: userAuthRoutes,
    },

    // error page
    {
        path: "error",
        children: errorRoutes,
    },
    //其他路由重定向到apmApp
    {
        path: '**', redirectTo: "error/routeBad", pathMatch: 'full',
    }
];


// 引用依赖
@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        RouterModule.forRoot(navRoutes),
        HttpModule,
    ],
    declarations: [
        AppComponent,
        ApmAppComponent,
        ApmBrowserComponent,
        ApmBrowserComponent,
        ApmCommonComponent,
        ApmNetworkComponent,
        ApmSaasComponent,
        ApmServerComponent,
        UserSetUpComponent,
        UhostHostManageComponent,
        UhostMirrorComponent,
        UhostRecoveComponent,
        UhostManageDetailComponent,
        UhostUdbMysqlComponent,
        UhostUmemComponent,
        UhostUnetIpComponent,
        UhostUnetSharebandComponent,
        WorkOrderManageComponent,
        AuthManageComponent,
        WorkUnhandleorderManageComponent,
        WorkOrderMyacceptorderComponent,
        WorkOrderPublicorderComponent,
        WorkOrderUnhandleallComponent,
        WorkOrderHandledallComponent,
        RouteBadpageComponent,
        AlHostComponent,
        AlRdsComponent,
        AlSlbComponent,
        AlEipComponent,
        AlVpcComponent,
        WorkApporderManageComponent,
        WorkApporderHandledallComponent,
        WorkApporderMyacceptorderComponent,
        WorkApporderPublicorderComponent,
        WorkApporderUnhandleallComponent,
        WorkApporderUnahndleorderComponent,
        UhostPhostdetailComponent,
        ApmNetopComponent,
        ApmControllerComponent,
        ApmAlarmComponent,
        ApmBaseComponent,
        WorkDbManageComponent,
        WorkDbOrderMyacceptorderComponent,
    ],
    bootstrap: [AppComponent],
    /*TODO********必须加上这行！否则刷新报404*************/
    providers: [{provide: LocationStrategy, useClass: HashLocationStrategy}]
})
export class AppModule {

}
