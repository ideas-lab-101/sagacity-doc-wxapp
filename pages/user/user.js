// user.js
import {fetch} from "../../axios/fetch"
Page({
  /**
   * 页面的初始数据
   */
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    page_show: false,
    is_login: false,
    token: getApp().user.ckLogin(),
    user: [],
    user_data: {
      scan_code_title: '扫一扫',
      doc: [],
      doc_page: []
    },
    show_tab: 1
  },
  onLoad: function (options) {
    getApp().pages.add(this);
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    if (getApp().user.ckLogin()) {
      this.get_data()
    } else {
      this.setData({
        page_show: true
      })
    }
  },
  onShow: function () {
    this.setData({
      is_login: getApp().user.ckLogin()
    })
  },
  get_userInfo(e) {
    getApp().user.authUser()
      .then(rest =>{
        wx.showLoading({
          title: '加载中',
        })
        this.get_data()
      }).catch((ret)=>{
        wx.showModal({
          content: '如你需要使用魔灯知库，请重新授权！',
          showCancel: false,
          success: function (res) {
          }
        })
      })
  },
  get_data() {
    fetch({
      url: "/wxss/user/getAccountInfo",
      data: {
      },
      method: 'GET'
    }).then(res=>{
      this.setData({
        page_show: true,
        is_login: true,
        user_data: res.data
      })
    }).finally(()=>{
      wx.hideLoading()
    })
  },
  account_manage(){
    getApp().user.getLogin().then(rest=>{
      wx.navigateTo({
        url: '../pay-list/pay-list'
      })
    })
  },
  scan_code() {
    getApp().user.getLogin().then(rest=>{
      wx.scanCode({
        onlyFromCamera: false,
        success: res => {
          let data = res.result
          try{
            var obj = JSON.parse(data);
            if (obj.type == 'login') {
              this.scan_login(obj.key)
            } else {
              wx.showToast({
                title: '错误的二维码！',
                icon: 'none',
              })
            }
          }catch(e){
            wx.showToast({
              title: '错误的二维码！',
              icon: 'none',
            })
          }
        },
        fail: function (res) {

        },
        complete: function (res) {

        },
      })
    })
  },
  scan_login(key) {
    wx.showModal({
      content: '是否登录网页版？',
      success: res => {
        if (res.confirm) {
          wx.showLoading({
            title: '正在登录',
          })
          fetch({
            url: "/wxss/system/scanLogin",
            data: {
              key: key
            },
            method: 'POST'
          }).then(res=>{
            if (res.code == 1) {
              wx.showToast({
                title: res.msg,
                icon: 'success',
                duration: 3000,
              })
            }else{
              wx.showToast({
                title: res.msg,
                icon: 'none',
              })
            }
          }).finally(()=>{
            wx.hideLoading()
          })
        
        }
      }
    })
  },
  del_my_doc: function (event) {
    let id = event.currentTarget.dataset.id;
    getApp().user.getLogin().then(rest=>{
      wx.showNavigationBarLoading()
      fetch({
        url: "/wxss/user/userFavorCancel",
        data: {
          dataId: id,
          type: 'doc'
        },
        method: 'POST'
      }).then(res=>{
        if (res.code == 1) {
          wx.showToast({
            title: res.msg,
            icon: 'none',
          })
          this.get_data()
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
  edit_show: function () {
    this.setData({
      edit_show: !this.data.edit_show
    })
  },
  set_tab(event) {
    this.setData({
      show_tab: event.currentTarget.dataset.type
    })
  },
  del_my_page(event) {
    let id = event.currentTarget.dataset.id
    getApp().user.getLogin().then(rest=>{
      wx.showNavigationBarLoading()
      fetch({
        url: "/wxss/user/userFavorCancel",
        data: {
          dataId: id,
          type: 'page'
        },
        method: 'POST'
      }).then(res=>{
        if (res.code == 1) {
          wx.showToast({
            title: res.msg,
            icon: 'none',
          })
          this.get_data()
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