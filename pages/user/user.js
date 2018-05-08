// user.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
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
      wx.showLoading({
        title: '加载中',
      })
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
  login() {
    getApp().user.isLogin(token => {
      this.setData({
        token: token
      })
      wx.showLoading({
        title: '加载中',
      })
      this.get_data()
    })
  },
  get_userInfo(res) {
    if (res.detail.errMsg == "getUserInfo:ok") {
      this.login()
    }
  },
  get_data() {
    wx.request({
      url: getApp().api.get_v3_user_index,
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        token: getApp().user.ckLogin()
      }, success: res => {
        if (res.data.code == 1) {
          this.setData({
            page_show: true,
            is_login: true,
            user: res.data.user,
            user_data: res.data.user_data,
          })
        }

      }, fail: error => {
      }
      , complete: res => {
        wx.hideLoading()
        wx.stopPullDownRefresh()
      }
    })
  },
  account_manage(){
    getApp().user.isLogin(token => {
      wx.navigateTo({
        url: '../pay-list/pay-list'
      })
    })  
  },
  scan_code() {
    getApp().user.isLogin(token => {
      if (this.data.user.length <= 0) {
        this.get_data()
      }
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
          wx.request({
            url: getApp().api.v3_scan_code_login,
            method: 'post',
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
              token: this.data.token,
              key: key
            }, success: res => {
              if (res.data.code == 1) {
                wx.showToast({
                  title: res.data.msg,
                  icon: 'none',
                })
              } else {
                wx.showToast({
                  title: res.data.msg,
                  icon: 'none',
                })
              }
            }, complete: res => {

            }
          })
        }
      }
    })
  },
  del_my_doc: function (event) {
    let id = event.currentTarget.dataset.id;
    getApp().user.isLogin(token => {
      wx.showLoading({
        title: '',
      })
      wx.request({
        url: getApp().api.v3_user_favor_cancel,
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: {
          token: token,
          data_id: id,
          type: 'doc'
        }, success: res => {
          if (res.data.code == 1) {
            this.get_data() //重新刷新
          } else {
            wx.showToast({
              title: res.data.msg,
            })
          }
        }, complete: res => {
          wx.hideLoading()
        }
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
  un_collect(event) {
    let id = event.currentTarget.dataset.id
    getApp().user.isLogin(token => {
      wx.showLoading({
        title: '正在删除',
      })
      wx.request({
        url: getApp().api.v3_user_favor_cancel,
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: {
          token: token,
          data_id: id,
          type: 'page'
        }, success: res => {
          if (res.data.code == 1) {
            wx.showToast({
              title: res.data.msg,
            })
            this.get_data()
          } else {
            wx.showToast({
              title: res.data.msg,
            })
          }
        }, complete: () => {
        }
      })
    })
  }
})