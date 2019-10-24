const utils = require('../../utils/util.js')

Page({
    /**
     * 页面的初始数据
     */
    data: {
      page: 1,
      more_data: "加载更多中..",
      no_more: false,
      no_data: false,
      more: false,
      ls_load: false,
      data: [],
      totalRow: 0,
    },
    onLoad: function (options) {
      wx.showLoading({
        title: '加载中',
      })
      this._initData()
    },
    _initData: function () {
      this.setData({
        is_load: true
      })
      wx.request({
        url: getApp().api.v3_user_account,
        method: 'GET',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: {
          token: getApp().user.ckLogin(),
          page: this.data.page
        },
        success: res => {
          wx.hideLoading()
          this.setData({
            totalRow: res.data.totalRow,
          })
          if (this.data.page == 1) {
            this.setData({
              data: res.data.list,
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
        }, complete: () => {
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

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
      if (this.data.more && !this.data.ls_load) {
        this.setData({
          page: this.data.page + 1,
          more_data: "正在加载更多.."
        })
        this.get_data()
      }
    },

    goDetai: function (e) {
      const dataIndex = e.currentTarget.dataset.index
      if (this.data.data[dataIndex].type === 'video') {
        wx.navigateTo({
          url: '../video-info/video-info?video_id=' + this.data.data[dataIndex].data_id
        })
      } else if(this.data.data[dataIndex].type === 'doc'){
        wx.navigateTo({
          url: '../doc-info/doc-info?doc_id=' + this.data.data[dataIndex].data_id
        })
      }
    }
})