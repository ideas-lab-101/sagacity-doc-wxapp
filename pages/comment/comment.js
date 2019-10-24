import { $wuxActionSheet } from '../../components/wux'
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
      isTaFocused: false,
      taPlaceholder: '用户留言',
      taContent: '',
      //业务数据
      source: '',
      source_id: 0,
      refer_id: 0
    },
    onLoad: function (options) {  
      this.setData({
        source: options.type,
        source_id: options.id,
      })
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
        url: getApp().api.v3_comment_index,
        method: 'GET',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: {
          data_id: this.data.source_id,
          type: this.data.source,
          page: this.data.page
        },
        success: res => {
          wx.hideLoading()
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
    postComment(e) {
        const that = this;
        if (e.detail.value.comment === '') {
            return
        }
        wx.showLoading({
            title: '发送中...',
        })
        wx.request({
            url: getApp().api.v3_comment_post,
            method: 'POST',
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
                data_id: this.data.source_id,
                type: this.data.source,
                refer_id: this.data.refer_id,
                form_id: e.detail.formId,
                token: getApp().user.ckLogin(),
                content: e.detail.value.comment
            },
            success: res => {
                wx.hideLoading()
                if (res.data.code == 1) {
                    that._initData();
                    this.setData({
                        taContent: '',
                        isTaFocused: false
                    })
                } else {
                    wx.showToast({
                      title: res.data.msg,
                      duration: 2000
                    })
                }
            },
            fail: error => {
                wx.hideLoading()
            }
        })
    },
    commentOnActivity() {
      getApp().user.isLogin(token => {
        this.setData({
          taPlaceholder: '用户留言',
          isTaFocused: true
        })
        this.data.refer_id = 0
      })
    },
    commentOnComment(commentIndex) {
        getApp().user.isLogin(token => {
          this.setData({
            taPlaceholder: `回复 ${this.data.data[commentIndex].nick_name}:`,
            isTaFocused: true
          })
          this.data.refer_id = this.data.data[commentIndex].id
        }); 
    },
    deleteComment(commentIndex) {
        const that = this;
        $wuxActionSheet.show({
            titleText: '确认删除该条评论吗',
            className: 'cancel-action',
            buttons: [{ text: '删除' }],
            buttonClicked(index, item) {
                wx.request({
                    url: getApp().api.v3_comment_del,
                    method: 'POST',
                    header: {
                        'content-type': 'application/x-www-form-urlencoded'
                    },
                    data: {
                        data_id: that.data.data[commentIndex].id,
                        token: getApp().user.ckLogin()
                    },
                    success: res => {
                        if (res.data.code == 1) {
                            that._initData();
                        } else {
                            wx.showToast({
                              title: res.data.msg,
                              duration: 2000
                            })
                        }
                    },
                    fail: error => {

                    }
                })
                return true
            },
            cancelText: '取消',
            cancel() { }
        });
    },
    moreOpts(e) {
        const that = this;
        const commentIndex = e.currentTarget.dataset.index
        const actionConfig = {
            titleText: '评论操作',
            buttons: [{ text: '回复' }],
            buttonClicked(index, item) {
                that.commentOnComment(commentIndex);
                return true
            },
            cancelText: '取消',
            cancel() {
            }
        };
        if (that.data.data[commentIndex].open_id === getApp().user.ckLogin()) {
            actionConfig.destructiveText = '删除';
            actionConfig.destructiveButtonClicked = function () {
                that.deleteComment(commentIndex);
            };
        }
        $wuxActionSheet.show(actionConfig);
    },
    hideTa: function () {
        this.setData({
            isTaFocused: false
        })
    },
})