const utils = require('../../utils/util.js')

Page({
  data: {
    show_page: false,
    data: {},
    page: 1,
    class_id: 0,
    more_data: "加载更多中..",
    no_more: false,
    no_data: false,
    more: false,
    ls_load: false
  },
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
    })
    this.get_data()
  },
  get_data() {
    this.setData({
      is_load: true
    })
    wx.request({
      url: getApp().api.v3_wenda_index,
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        token: getApp().user.ckLogin(),
        page: this.data.page
      },
      success: res => {
        if (this.data.page == 1) {
          this.setData({
            data: res.data.list,
            show_page: true
          })
        } else {
          let o_data = this.data.data;
          for (var index in res.data.list) {
            o_data.push(res.data.list[index])
          }
          this.setData({
            data: o_data
          })
        }
        utils.set_page_more(this, res.data)
        wx.stopPullDownRefresh()
      }, complete: res => {
        wx.hideLoading()
      }
    })
  },
  onPullDownRefresh: function () {
    this.setData({
      page: 1,
      more: false,
      no_more: false
    })
    this.get_data()
  },
  onReachBottom: function () {
    if (this.data.more && !this.data.ls_load) {
      this.setData({
        page: this.data.page + 1,
        more_data: "正在加载更多.."
      })
      this.get_data()
    }
  },
  onShareAppMessage: function () {

  }
})