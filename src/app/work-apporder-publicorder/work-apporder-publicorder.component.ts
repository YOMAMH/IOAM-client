import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import{ActivatedRoute, Router, Params}from'@angular/router';
import {Http, Headers, RequestOptions} from '@angular/http';
import {AppEnvConfig} from '../../assets/conf/envConfig';
import {BaseTool} from '../../assets/baseTool';
import "rxjs/add/operator/map";
import {log} from "util";

declare const $: any;    // jquery
declare const Cookies;    // cookie

// 文件类型枚举
const FILE_TYPE_ENUM = {
  APP_FILE: "app_file",
  SQL_FILE: "sql_file",
};

@Component({
  selector: 'app-work-apporder-publicorder',
  templateUrl: './work-apporder-publicorder.component.html',
  styleUrls: ['./work-apporder-publicorder.component.css']
})
export class WorkApporderPublicorderComponent implements OnInit {

  private baseTool: any;    // 工具函数
  public unHandleOrderInfo: any;    // 未处理受理工单数据
  public handleOrderInfo: any;    // 已处理受理工单数据
  constructor(private route: ActivatedRoute, private router: Router, private http: Http, private cdr: ChangeDetectorRef) {
    this.baseTool = BaseTool.sharedBaseTool();    // 工具函数
    this.baseTool.handleAuth(this, 2);    // 处理权限
    this.myUnHandleAcceptInfo(this);    // 获取受理的未处理工单
    this.myHandledAcceptInfo(this);    // 获取受理的已处理工单
    this.pageation(this);    // 分页
  }

  ngOnInit() {
    this.acceptOrderDetail(this);    // 我的受理工单详情
    this.disagreeQueryOrder(this);    // 回据我的受理工单
    this.agreeQueryOrder(this);    // 通过我的受理工单
  }


  // 获取受理的未处理工单
  myUnHandleAcceptInfo(self, index = 0) {
    $('.conver').show();
    let options = this.baseTool.Header();
    this.http.get(AppEnvConfig.env + "/work/publicAcceptProdOrder?type=unHandle", options)
        .map(res => res.json())
        .subscribe(data => handleOrder(self, data, "unHandle"));
  }

  // 获取受理的已处理工单
  myHandledAcceptInfo(self, index = 0) {
    $('.conver').show();
    let options = this.baseTool.Header();
    this.http.get(AppEnvConfig.env + "/work/publicAcceptProdOrder?type=handled", options)
        .map(res => res.json())
        .subscribe(data => handleOrder(self, data, "handled"));
  }

  // 个人受理工单详情
  acceptOrderDetail(self) {
    $(function () {
      $('.hostTab').delegate('.detailBtn', 'click', function () {
        let orderType = $(this).parent().parent().prop("className");

        if (orderType === "hostItem") {
          $('.handle').show();
          let idIndex = $(this).parent().parent().children().eq(0).find("span").text();
          showDetail(self.unHandleOrderInfo, idIndex, "unHandle");
        } else {
          $('.handle').hide();
          let idIndex = $(this).parent().parent().children().eq(0).find("span").text();
          showDetail(self.handleOrderInfo, idIndex, "handle");
        }

      });


      // 关闭按钮
      $('.modal.fade.detailView .closeBtn').on('click', function () {
        $('.modal.fade.detailView.in').click();
      });

      // 通过
      $('#createSure').on('click', function () {
        let ident = $('.modal.fade.detailView .addContentGroup').eq(0).find("i").text();
        let change_content = $.trim($('#change_content').find("textarea").val());
        let change_title = $('#changeTitle').val();

        if (change_content && change_title) handleMyAcceptOrder(self, {
          text: "已通过，待确认",
          change_content: change_content,
          change_title: change_title,
        }, ident);
        else self.baseTool.alertView("请填写完整变更记录", self.baseTool.failure);
      });

      // 拒绝
      $('#createCancel').on('click', function () {
        let ident = $('.modal.fade.detailView .addContentGroup').eq(0).find("i").text();
        handleMyAcceptOrder(self, {text: "未通过，待确认"}, ident);
      });

      // 下载附件
      $('#downloadAppFile').on('click',downloadFiles.bind(this, FILE_TYPE_ENUM.APP_FILE));
      $('#downloadSqlFile').on('click',downloadFiles.bind(this, FILE_TYPE_ENUM.SQL_FILE));
    });
  }

  // 回据我的受理工单
  disagreeQueryOrder(self) {
    $(function () {
      $('.hostTab').delegate('.deleteBtn', 'click', function () {
        let idIndex = $(this).parent().parent().children().eq(0).find("span").text();
        handleMyAcceptOrder(self, "未通过，待确认", idIndex)
      });
    });
  }

  // 通过我的受理工单
  agreeQueryOrder(self) {
    $(function () {
      $('.hostTab').delegate('.consentBtn', 'click', function () {
        let idIndex = $(this).parent().parent().children().eq(0).find("span").text();
        handleMyAcceptOrder(self, "已通过，待确认", idIndex)
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
          }
            break;
          case '上页': {
            index -= 10;
          }
            break;
          case '末页': {
            index = (Math.floor(dataCount / 10) - 1) * 10;
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

        self.myUnHandleAcceptInfo(self, index);
        self.myHandledAcceptInfo(self, index);
      })
    });
  }

  // 获取本地数据数量
  infoTotalCount(self, cb) {
    let options = self.baseTool.Header();
    self.http.get(AppEnvConfig.env + "/work/publicProdOrderTotalCount", options)
        .map(res => res.json())
        .subscribe(data => {
          if (data.status == 200) {
            cb(data.result.content);
          }
        });
  }

}

// 处理工单数据
function handleOrder(self, data, type) {
  $('.conver').hide();
  if (type === "unHandle") {
    if (data.status === 200) {
      self.unHandleOrderInfo = data.result.content;
      self.baseTool.reload(self);
    } else {
      self.unHandleOrderInfo = [];
      self.baseTool.reload(self);
    }
  } else if (type === "handled") {
    if (data.status === 200) {
      self.handleOrderInfo = data.result.content;
      self.baseTool.reload(self);
    } else {
      self.handleOrderInfo = [];
      self.baseTool.reload(self);
    }
  }
}

// 显示详情
function showDetail(arg, idIndex, type) {
  if (type === "handle") {
    $('#reason').attr('disabled', 'disabled');
    $('#change_content').find("textarea").attr('disabled', 'disabled');
    $('#changeTitle').attr('disabled', 'disabled');
  } else {
    $('#reason').removeAttr('disabled');
    $('#change_content').find("textarea").removeAttr('disabled').val("");
    $('#changeTitle').removeAttr('disabled').val("");

  }
  $('#downloadAppFile').hide();
  $('#downloadSqlFile').hide();
  arg.forEach((item, i) => {
    if (item.id == idIndex) {
      let createTime = new Date(item.create_time).toLocaleString();
      let updateType = item.update_type;
      let app_file = '';
      let sql_file = '';
      app_file = item.app_file;
      sql_file = item.sql_file;
      if (updateType === 0) updateType = "修复bug";
      else if (updateType === 1) updateType = "产品发布";
      if (app_file) {
        app_file = app_file.substring(app_file.lastIndexOf("%^") + 2);
        $('#downloadAppFile').show();
      }
      if (sql_file) {
        sql_file = sql_file.substring(sql_file.lastIndexOf("%^") + 2);
        $('#downloadSqlFile').show();
      }


      $('.modal.fade.detailView .addContentGroup').eq(0).find("span").text(item.pro_type);
      $('.modal.fade.detailView .addContentGroup').eq(0).find("i").text(item.id);
      $('.modal.fade.detailView .addContentGroup').eq(1).find("span").text(item.pro_name);
      $('.modal.fade.detailView .addContentGroup').eq(2).find("span").text(updateType);
      $('.modal.fade.detailView .addContentGroup').eq(3).find("span").text(item.update_verson);
      $('.modal.fade.detailView .addContentGroup').eq(4).find("span").text(item.build_num);
      $('.modal.fade.detailView .addContentGroup').eq(5).find("span").text(item.jenkins_name);
      $('.modal.fade.detailView .addContentGroup').eq(6).find("textarea").val(item.change_content);
      $('.modal.fade.detailView .addContentGroup').eq(7).find("textarea").val(item.conf_update);
      $('.modal.fade.detailView .addContentGroup').eq(8).find("textarea").val(item.update_depend);
      $('.modal.fade.detailView .addContentGroup').eq(9).find("span").text(app_file);
      $('.modal.fade.detailView .addContentGroup').eq(10).find("span").text(sql_file);
      $('.modal.fade.detailView .addContentGroup').eq(11).find("textarea").val(item.work_order_timeline);
      $('.modal.fade.detailView .addContentGroup').eq(12).find("span").text(createTime);
      $('.modal.fade.detailView .addContentGroup').eq(13).find("span").text(item.send_user);
      $('#change_content').find("textarea").val(item.change_content);
      $('#changeTitle').val(item.change_title);
      $('#reason').val(item.reason);

      return;
    }
  });
}

// 处理工单
function handleMyAcceptOrder(self, type, ident) {
  let options = self.baseTool.Header();
  let user = Cookies.get("ty_cmdb_user") + ":" + Cookies.get("ty_cmdb");
  let reason = $('#reason').val();
  let body = JSON.stringify({
    user: user,
    active: type.text,
    change_content: type.change_content?type.change_content:"",
    change_title: type.change_title?type.change_title:"",
    id: ident,
    reason: reason
  });

  self.http.put(AppEnvConfig.env + "/work/updateMyAcceptProdOrder", body, options)
      .map(res => res.json())
      .subscribe(data => {
        if (data.status === 200) {
          self.baseTool.alertView("更新工单状态成功", self.baseTool.success);
          $('.modal.fade.detailView.in').click();
          self.baseTool.refView("workOrder/myAcceptOrder");
        } else {
          self.baseTool.alertView("更新工单状态失败，请稍后再试...", self.baseTool.failure);
          $('.modal.fade.detailView.in').click();
        }
      });
}

// 下载
function downloadFiles(FILE_TYPE_ENUM) {
  let idStr = $('#sign').text();
  location.href = `${AppEnvConfig.env}/work/donwloadFiles?type=${FILE_TYPE_ENUM}&id=${idStr}`;
}

