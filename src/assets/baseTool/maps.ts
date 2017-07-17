/**
 * Created by renminghe on 2017/6/9.
 */
import {Http, Headers, RequestOptions} from '@angular/http';
import {AppEnvConfig} from '../conf/envConfig';
import {BaseTool} from './index';


'use strict';
// 应用工单二级联动
let pordercts = "";
let selectArr = {
    uCloud: [{text: "云虚机", val: "uhost"}, {text: "云物理机", val: "uphost"}, {text: "云Redis", val: "uredis"},
        {text: "云Memcached", val: "umemcached"}, {text: "uhadoop", val: "uhadoop"}, {text: "公网弹性IP", val: "eip"},
        {text: "云数据库", val: "udb"}, {text: "ulb", val: "ulb"}, {text: "ukafka", val: "ukafka"}],
    aliCloud: [{text: "云虚机", val: "alHost"}, {text: "公网弹性IP", val: "alEip"}, {text: "云数据库", val: "alRds"},
        {text: "云负载均衡", val: "alSlb"}, {text: "阿里VPC", val: "alVpc"}, {text: "云Redis", val: "alRedis"}]
};
let zoneMap = {
    uCloud: [{text: "北京一", val: "cn-bj1"}, {text: "北京二", val: "cn-bj2"}, {text: "香港", val: "hk"},],
    aliCloud: [{text: "华北一", val: "cn-qingdao"}, {text: "华北二", val: "cn-beijing"}, {
        text: "华东一",
        val: "cn-hangzhou"
    }, {text: "华东二", val: "cn-shanghai"},]
};

export class Maps {
    public static selectArr : any = selectArr;
    public static zoneMap : any = zoneMap;
    private baseTool : any;
    constructor(private http: Http) {}
    public static porderctMap: any = function (self, cb) {
        if (!pordercts) {
            self.baseTool = BaseTool.sharedBaseTool();    // 工具函数
            let options = self.baseTool.Header();
            self.http.get(`${AppEnvConfig.env}/apm/all`, options)
                .map(res => res.json())
                .subscribe(data => {
                    if (data.status === 200) {
                        if (!pordercts) pordercts = data.result.content;
                        cb(pordercts);
                    }
                });
        } else {
            cb(pordercts);
        }

    }
}