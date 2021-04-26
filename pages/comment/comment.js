import { $wuxActionSheet } from '../../components/wux'
import {fetch} from "../../axios/fetch"
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
      fetch({
        url: "/wxss/comment/getCommentList",
        data: {
          dataId: this.data.source_id,
          type: this.data.source,
          page: this.data.page
        },
        method: 'GET'
      }).then(res=>{
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
      }).finally(()=>{
        wx.hideLoading()
        wx.stopPullDownRefresh()
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
        getApp().user.getLogin().then(rest=>{
          wx.showNavigationBarLoading()
          fetch({
            url: "/wxss/comment/addComment",
            data: {
              dataId: this.data.source_id,
              type: this.data.source,
              referId: this.data.refer_id,
              formId: e.detail.formId,
              content: e.detail.value.comment
            },
            method: 'POST'
          }).then(res=>{
            if (res.code == 1) {
              that._initData();
              this.setData({
                  taContent: '',
                  isTaFocused: false
              })
          } else {
              wx.showToast({
                title: res.msg,
                duration: 2000
              })
          }
          }).finally(()=>{
            wx.hideNavigationBarLoading()
          })
        })
    },
    commentOnActivity() {
      getApp().user.getLogin().then(rest=> {
        this.setData({
          taPlaceholder: '用户留言',
          isTaFocused: true
        })
        this.data.refer_id = 0
      })
    },
    commentOnComment(commentIndex) {
      getApp().user.getLogin().then(rest=> {
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
              getApp().user.getLogin().then(rest=>{
                wx.showNavigationBarLoading()
                fetch({
                  url: "/wxss/comment/delComment",
                  data: {
                    dataId: that.data.data[commentIndex].id,
                  },
                  method: 'POST'
                }).then(res=>{
                  if (res.code == 1) {
                    that._initData();
                  } else {
                    wx.showToast({
                      title: res.msg,
                      duration: 2000
                    })
                  }
                }).finally(()=>{
                  wx.hideNavigationBarLoading()
                })
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
        let userInfo = getApp().user.getUserInfo;
        if (that.data.data[commentIndex].user_id === 
          userInfo.user_id) {
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