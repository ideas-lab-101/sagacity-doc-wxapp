import { $wuxButton } from '../../components/wux'
import {fetch} from "../../axios/fetch"
Page({
  data: {
    doc_id: 0,
    doc: {},
    likes: {},
    related_doc: {},
    is_favor: false,
    class_id: 0,
  },
  onLoad: function (option) {
    let id = option.doc_id
    this.setData({
      doc_id: id
    })
    wx.showLoading({
      title: '加载中',
    })
    this.get_data()
    this.init_buttons()
  },
  init_buttons(position = 'bottomRight') {
    const self = this
    this.setData({
      opened: !1,
    })

    this.button = $wuxButton.init('br', {
      position: position,
      buttons: [
        {
          label: '首页',
          icon: "../../assets/images/btn_home.png",
        },
        {
          label: '全本封面',
          icon: "../../assets/images/btn_QR.png",
        }
        // {
        //   label: '收藏',
        //   icon: "../../assets/images/btn_fav.png",
        // }
      ],
      buttonClicked(index, item) {
        index === 0 && wx.switchTab({
          url: '../index/index',
        })
        index === 1 && self.onGetShareCode()
        // index === 2 && self.add_my_doc()
        return true
      },
      callback(vm, opened) {
        vm.setData({
          opened,
        })
      },
    })
  },
  get_data() {
    fetch({
      url: "/wxss/doc/v2/getDocInfo",
      data: {
        docId: this.data.doc_id
      },
      method: 'GET'
    }).then(res=>{
      this.setData({
        doc: res.data.doc,
        is_favor: res.data.is_favor,
        likes: res.data.likes,
        related_doc: res.data.relatedDocs,
        show_page: true
      })
    }).finally(()=>{
      wx.stopPullDownRefresh()
      wx.hideLoading()
    })
  },
  go_menu: function (event) {
    let doc_id = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../doc-menu/doc-menu?doc_id=' + doc_id
    })
  },
  previewImg: function (event) {
    wx.previewImage({
      urls: [this.data.doc.cover],
    })
  },
  go_doc: function ( event){
    let id = event.currentTarget.dataset.id;
    wx.redirectTo({
      url: '../doc-info/doc-info?doc_id=' + id
    })
  },
  do_pay: function(event) {
    wx.navigateTo({
      url: '../pay/pay?type=doc&id=' + this.data.doc.id
      + '&title=' + this.data.doc.title + '&cover=' + this.data.doc.cover,
    })
  },
  do_favor: function (event) {
      getApp().user.getLogin().then(rest=>{
      wx.showNavigationBarLoading()
      fetch({
        url: "/wxss/user/userFavor",
        data: {
          dataId: this.data.doc_id,
          type: 'doc'
        },
        method: 'POST'
      }).then(res=>{
        if (res.code == 1) {
          this.setData({
            is_favor: res.data.is_favor
          })
          try {
            //更新用户中心的数据
            getApp().pages.get('pages/user/user').get_data();
          } catch (e) {
          }
        }else{
          wx.showToast({
            title: res.msg,
            icon: 'none',
          })
        }
      }).finally(()=>{
        wx.hideNavigationBarLoading()
      })
    })
  },
  onPullDownRefresh: function () {
    
  },
  onReachBottom: function () {

  },
  do_comment: function () {
    wx.navigateTo({
      url: '../comment/comment?type=doc&id=' + this.data.doc.id,
    })
  },
  onShareAppMessage: function () {
    return {
      title: "魔灯文档-分享知识"
    }
  },
  onGetShareCode: function() {
    getApp().user.getLogin().then(rest=>{
      fetch({
        url: "/wxss/system/getWXSSCode",
        data: {
          type: 'd',
          dataId: this.data.doc_id
        },
        method: 'POST'
      }).then(res=>{
        if (res.code == 1) {
          wx.previewImage({
            urls: [res.data.qr_code],
          })
        }else{
          wx.showToast({
            title: res.msg,
            icon: 'none',
          })
        }
      }).finally(()=>{
      })  
    })
  },
  doc_like(event) {
    let doc_id = event.currentTarget.dataset.id;
    getApp().user.getLogin().then(rest=>{
      wx.showNavigationBarLoading()
      fetch({
        url: "/wxss/user/userLike",
        data: {
          dataId: doc_id,
          type: 'doc'
        },
        method: 'POST'
      }).then(res=>{
        if (res.code == 1) {
          wx.showToast({
            title: res.msg,
          })
          //更新赞的人员列表
          this.setData({
            likes: res.data.likes
          })
        }else{
          wx.showToast({
            title: res.msg,
            icon: 'none',
          })
        }
      }).finally(()=>{
        wx.hideNavigationBarLoading()
      })
    })
  }
})