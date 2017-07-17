import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {Http, Headers, RequestOptions} from '@angular/http';
import "rxjs/add/operator/map";
import * as http from "selenium-webdriver/http";
import {AppEnvConfig} from '../../assets/conf/envConfig';
import {ActivatedRoute, Router} from '@angular/router';
import {BaseTool} from '../../assets/baseTool';

declare const $: any;
declare const Cookies: any;

@Component({
  selector: 'app-al-vpc',
  templateUrl: './al-vpc.component.html',
  styleUrls: ['./al-vpc.component.css']
})
export class AlVpcComponent implements OnInit {

  public localInstanceInfoObj: any;    // 本地实例信息
  public localInstanceDropInfoObj: any;    // 已删除的云数据库信息
  private createLocalInstanceInfo: any;    // 创建云数据库信息
  private baseTool: any;    // 工具函数
  constructor(private route: ActivatedRoute, private router: Router, private http: Http, private cdr: ChangeDetectorRef) {
    this.baseTool = BaseTool.sharedBaseTool();    // 工具函数
    this.baseTool.handleAuth(this, '2');
    this.localInstanceInfo();    // 本地信息
    this.getLocalInstanceDropInfo();    // 获取已删除的本地实例信息
  }

  ngOnInit() {
    this.addLocalInstanceInfoBtn(this);    // 批量添加实例信息
    this.searchLocalInstanceInfo(this);    // 模糊搜索
    this.selectBox(this);    // 选项卡
    this.localInstanceupdateAll(this);    // 一键更新
    this.handleCreateLocalInstance(this);    // 添加本地实例信息
    this.handleUpdateLocalInstance(this);    // 更新本地实例信息
    this.handleDeleteLocalInstanceInfo(this);    // 删除云数据库
    this.pageation(this);    // 分页
    this.historySelect(this);    // 报表年份选择
  }

  //批量添加云数据库信息
  addLocalInstanceInfoBtn(self) {
    $(function () {
      $('#createAllBtn').on('click', function () {
        if (confirm("导入前请确认对应存储表无数据！")) {
          $('.conver').show();
          self.localInstanceInfoTotalCount(self, function (data) {
            if (data.status != 500) {
              $('.conver').hide();
              self.baseTool.alertView("导入失败！对应存储表不为空", self.baseTool.failure);
            } else {
              self.addLocalInstanceInfoAll(function (data) {
                if (data.status == 200) {
                  $('.conver').hide();
                  self.baseTool.alertView("导入成功！", self.baseTool.success);
                  self.baseTool.refView("alUHost/alvpc");
                } else {
                  $('.conver').hide();
                  self.baseTool.alertView("导入失败！获取aLiCloud数据失败", self.baseTool.failure);
                }
              }, self);
            }
          });
        }
      });
    });
  }

  // 批量添加实例信息network
  addLocalInstanceInfoAll(cb, self) {
    let options = self.baseTool.Header();
    self.http.get(`${AppEnvConfig.env}/alCloud/vpc/cloudInstanceInfoCopy`, options)
        .map(res => res.json())
        .subscribe(data => {
          if (data.status == 200) {
            if (cb) cb(data);
          } else {
            $('.conver').hide();
            self.baseTool.alertView('获取数据失败，请稍后尝试...', self.baseTool.failure);
          }

        });
  }

  // 获取本地数据数量
  localInstanceInfoTotalCount(self, cb) {
    let options = self.baseTool.Header();
    self.http.get(`${AppEnvConfig.env}/alCloud/vpc/localInstanceInfoCount`, options)
        .map(res => res.json())
        .subscribe(data => {
          if (data.status == 200) {
            cb(data.result.content);
          }
        });
  }

  // 获取本地数据
  localInstanceInfo(index = 0) {
    let options = this.baseTool.Header();
    this.http.get(`${AppEnvConfig.env }/alCloud/vpc/localInstanceInfo?index=${index}`, options)
        .map(res => res.json()).subscribe(data => showInfoView(data, this));
  }

  // 添加本地数据主方法
  handleCreateLocalInstance(self) {
    $(function () {

      let idStr = '';
      let regionStr = '';
      // 搜索按钮
      $('.btn.btn-default.checkHostBtn').on('click', function () {
        idStr = $.trim($('.hostId .checkHostText').val());    // hostId
        regionStr = $('.hostId .checkHostRegion option:selected').val();    // 所属区域
        $('.hostCheckConver').hide();
        $('.hostInfoContent').html('');

        if (idStr && regionStr) {
          $('.hostCheckConver').show();
          let options = self.baseTool.Header();

          self.http.get(`${AppEnvConfig.env}/alCloud/vpc/instanceInfoALiCloud/?VpcId=${idStr}&RegionId=${regionStr}`
              , options).map(res => res.json()).subscribe(data => handleCloudData(data, self));
        }
      });

      // 确认按钮
      $('#createSure').on('click', function () {
        $('.createhostresult').text("");
        if (idStr && self.createLocalInstanceInfo) {
          $('.createSureconver').show();

          // 创建本地数据
          self.createLocalInstance(self);
        }

      });

      // 取消按钮
      $('#createCancel').on('click', function () {
        $('.modal.fade.bs-example-modal-lg.in').click();
        $('.hostInfoContent').children().remove();    // 移除本地数据信息的子元素
        $('.hostId .checkHostText').val("");    // 清空输入文字
        $('.createhostResult').text("");    // 清空状态信息
      });
    });
  }

  // 更新本地数据信息主方法
  handleUpdateLocalInstance(self) {
    $(function () {
      $('.hostTab').delegate('.updateBtn', 'click', function () {
        let instanceId = $(this).parent().parent().children().eq(0).text();   // instanceId
        let reg = $(this).parent().parent().children().eq(2).find('i').text();    // 区域
        $(this).text("更新中...").attr("disabled", "disabled");
        let then = $(this);
        self.updateLocalInstance(self, {reg: reg, instanceId: instanceId}, function () {
          then.text("更新").removeAttr("disabled");
        });
      });
    });
  }

  // 删除本地数据主方法
  handleDeleteLocalInstanceInfo(self) {
    $(function () {
      $('.hostTab').delegate('.deleteBtn', 'click', function () {
        if (confirm("确认删除该数据吗？")) {
          let instanceId = $(this).parent().parent().children().eq(0).text();   // instanceId
          self.deleteLocalInstance(self, instanceId);
        }
      });
    });
  }

  // 删除本地数据请求
  deleteLocalInstance(self, instanceId) {
    let options = self.baseTool.Header();
    self.http.delete(`${AppEnvConfig.env}/alCloud/vpc/localInstanceInfoDelete?VpcId=${instanceId}`, options)
        .map(res => res.json())
        .subscribe(data => {
          if (data) {
            if (data.status == 500) {
              self.baseTool.alertView('删除失败，请稍后尝试...', '#D8534F');
            }
          }
          if (data.status == 200) {
            self.baseTool.alertView("删除成功", "#38AF57");
            self.baseTool.refView("alUHost/alvpc");
          }
        });
  }

  // 创建本地数据网络请求
  createLocalInstance(self) {
    let body = JSON.stringify(self.createLocalInstanceInfo);
    let options = self.baseTool.Header();
    self.http.post(`${AppEnvConfig.env}/alCloud/vpc/localInstanceCreate`, body, options)
        .map(res => res.json())
        .subscribe(data => {
          $('.createSureconver').hide();
          if (data.status == 200) {
            $('.createhostResult').text("创建成功!").css('color', 'green');
            setTimeout(function () {
              $('#createCancel').click();
            }, 1000);
            self.baseTool.refView("alUHost/alvpc");
          } else {
            if (data.reason == "HostId existed") {
              $('.createhostResult').text("创建失败，HostId已存在!").css('color', 'red');
            } else {
              $('.createhostResult').text("创建失败").css('color', 'red');
            }
          }
        });
  }


  // 更新本地数据网络请求
  updateLocalInstance(self, hostInfo, cb) {
    let body = JSON.stringify({RegionId: hostInfo.reg, VpcId: hostInfo.instanceId});
    let options = self.baseTool.Header();
    self.http.put(`${AppEnvConfig.env}/alCloud/vpc/localInstanceUpdate`, body, options)
        .map(res => res.json())
        .subscribe(data => {
          cb();
          if (data) {
            if (data.status == 500 && data.reason == "network error") {
              self.baseTool.alertView('获取aLiCloud数据失败，请稍后尝试...', '#D8534F');
            }
            if (data.status == 500 && data.reason == "data not changed") {

              self.baseTool.alertView("更新失败，配置信息未改变", "#D8CD3B");
            }
          }
          if (data.status == 200) {
            self.baseTool.alertView("更新成功", "#38AF57");
            self.baseTool.refView("alUHost/alvpc");
          }
        });
  }

  // 本地数据模糊搜索
  searchLocalInstanceInfo(self) {
    $('.searchText').keydown(function (e) {
      if (e.keyCode == 13) {
        $('.conver').show();
        let instanceName = $.trim($(this).val());
        let options = self.baseTool.Header();
        if (instanceName) {
          self.http.get(`${AppEnvConfig.env}/alCloud/vpc/localInstanceInfo?instanceName=${instanceName}`, options)
              .map(res => res.json())
              .subscribe(data => {
                $('.conver').hide();
                if (data.status == 200) {
                  showInfoView(data, self);
                  $('.pagination').hide();
                }
              });
        } else {
          self.http.get(`${AppEnvConfig.env}/alCloud/vpc/localInstanceInfo?index=0`, options)
              .map(res => res.json())
              .subscribe(data => {
                $('.conver').hide();
                if (data.status == 200) {
                  showInfoView(data, self);
                  $('.pagination').show();
                }
              });
        }
      }
    });
  }

  // 分页
  pageation(self) {
    // 分页
    self.localInstanceInfoTotalCount(self, function (dataCount) {
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
          }
            break;
          case '上页': {
            index -= 10;
          }
            break;
          case '末页': {
            index = Math.floor(dataCount / 10) * 10;
          }
            break;
          case '首页': {
            index = 0;
          }
            break;
          case '跳转': {
            index = ($('.M-box3').find('.active').text() - 1) * 10;
          }
            break;
          default: {
            index = ($(this).text() - 1) * 10;
          }
            break;
        }
        self.localInstanceInfo(index);
      })
    });
  }

  // 选项卡
  selectBox(self) {
    $(function () {
      $('.hostBanner .hostSelectBox div').on('click', function () {
        $(this).addClass('selectType').siblings().removeClass('selectType');
        if ($(this).find('span').text() == "专属VPC管理") {
          $('.hostContainer').fadeIn(300);
          $('.hostRecover').hide();
          $('.histoyView').hide();
        } else if ($(this).find('span').text() == "变更记录统计") {
          $('.histoyView').fadeIn(300);
          $('.hostContainer').hide();
          $('.hostRecover').hide();
          $('.conver').show();
          self.baseTool.historyViewSelect();
          self.baseTool.getHistory(self.baseTool.resultView, self, "/alCloud/vpc/localInstance?begDate=");
        } else {
          $('.hostRecover').fadeIn(300);
          $('.hostContainer').hide();
          $('.histoyView').hide();
        }
      });

      // 撤销删除本地数据
      $('.hostRecover .hostTab').delegate('.cancelDelBtn', 'click', function () {
        $(this).text("还原中...").attr("disabled", "disabled");
        let instanceId = $(this).parent().parent().children().eq(0).text();
        let then = $(this);

        self.cancelDropLocalInstancet(instanceId, function () {
          then.text("还原").removeAttr("disabled");
        });
      });
    });
  }

  // 获取删除的本地数据信息
  getLocalInstanceDropInfo() {
    let options = this.baseTool.Header();

    this.http.get(`${AppEnvConfig.env}/alCloud/vpc/localInstanceDropInfo`, options)
        .map(res => res.json())
        .subscribe(data => {
          if (data.status == 200) {
            this.localInstanceDropInfoObj = data['result']['content'];
            this.baseTool.reload(this);
          }
        });
  }

  // 取消删除本地数据
  cancelDropLocalInstancet(instanceId, cb) {
    let body = JSON.stringify({AllocationId: instanceId});
    let options = this.baseTool.Header();

    this.http.put(`${AppEnvConfig.env}/alCloud/vpc/cancelDropLocalInstance`, body, options)
        .map(res => res.json())
        .subscribe(data => {
          if (data.status == 200) {
            this.baseTool.alertView("还原成功！", '#38AF57');
            cb();
            this.baseTool.refView("alUHost/alvpc");
          } else {
            this.baseTool.alertView("还原失败！请稍后再试", '#D8534F');
          }
        });
  }

  // 一键更新
  localInstanceupdateAll(self) {
    $(function () {
      $('#updateAllBtn').on('click', function () {
        $(this).attr("disabled", "disabled").find('span').text("正在更新").parent().find('i').fadeIn();
        let options = self.baseTool.Header();

        self.http.get(`${AppEnvConfig.env}/alCloud/vpc/localInstanceUpdateAll`, options)
            .map(res => res.json())
            .subscribe(data => {
              $(this).removeAttr("disabled").find('span').text("一键更新").parent().find('i').hide();
              if (data) {
                if (data.status == 500 && data.reason == "network error") {
                  self.baseTool.alertView('获取aLiCloud数据失败，请稍后尝试...', self.baseTool.failure);
                }
                if (data.status == 500 && data.reason == "data not changed") {

                  self.baseTool.alertView("更新失败，配置信息未改变", "#D8CD3B");
                }
              }
              if (data.status == 200) {
                self.baseTool.alertView("更新成功", self.baseTool.success);
                self.baseTool.refView("alUHost/alvpc");
              }
            });
      });
    });
  }

  // 报表年份选择
  historySelect(self) {
    $('.histoyView .hostTitle .begDateYear').on('change', function () {
      self.baseTool.getHistory(self.baseTool.resultView, self, "/alCloud/vpc/localInstance?begDate=");
    });
    $('.histoyView .hostTitle .tagView').on('change', function () {
      self.baseTool.getHistory(self.baseTool.resultView, self, "/alCloud/vpc/localInstance?begDate=");
    });
  }

}

// 处理数据
function handleData(data){
  if (data.status === 200 && data.result.hasOwnProperty('content')) {
    data.result.content.forEach(data => {
      if (typeof data.VSwitchIds === "string") data.VSwitchIds = JSON.parse(data.VSwitchIds);
      if (typeof data.UserCidrs === "string") data.UserCidrs = JSON.parse(data.UserCidrs);

    });
    return data.result.content;
  }

}

// 处理页面显示
function handleView(data) {

  if (data) {
    data.forEach((item, i) => {

      if (item.IsDefault === "0") {
        $('.hostTab .hostItem').eq(i).children().eq(6).text("否");

      }

      if (item.Status === "Available") {
        $('.hostTab .hostItem').eq(i).children().eq(3).find('span').text("可用").css('color', '#2fd62f');
        $('.hostTab .hostItem').eq(i).children().eq(3).find('i').css('color', '#2fd62f').addClass("fa fa-circle");
      }

    });
  }

}

// 抽取处理显示方法
function showInfoView(data, self) {
  self.localInstanceInfoObj = handleData(data);
  self.baseTool.reload(self);
  $('.conver').hide();
  // 隔行变色
  $('.hostTab .hostItem:even').css('backgroundColor', '#F7F9FC');
  handleView(self.localInstanceInfoObj);
}

// 处理获取的阿里云数据
function handleCloudData(data, self) {
  if (data.status == 200) {
    if (data.result.hasOwnProperty('content')) {
      $('.hostCheckConver').hide();
      let hostSet = data.result.content[0];
      let time = new Date(hostSet['CreationTime']).toLocaleString();
      self.createLocalInstanceInfo = hostSet;
      $('.hostInfoContent').html('<ul>' +
          '<li><span>资源ID</span><span>' + hostSet['VpcId'] + '</span></li>' +
          '<li><span>资源名称</span><span>' + hostSet['VpcName'] + '</span></li>' +
          '<li><span>网段</span><span>' + hostSet['CidrBlock'] + '</span></li>' +
          '<li><span>创建时间</span><span>' + time + '</span></li>' +
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
}

