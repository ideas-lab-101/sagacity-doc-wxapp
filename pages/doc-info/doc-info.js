
let ArrayList = require("../../utils/arrayList.js");
Page({
  data: {
    doc_id: 0,
    doc: {},
    likes: {},
    my_doc: [],
    is_add: true,
    add_text: "已加入",
    show_page: false,
    question: {},
    page: 1,
    class_id: 0,
    more_data: "加载更多中..",
    no_more: false,
    no_data: false,
    more: false,
    ls_load: false
  },
  onLoad: function (option) {

    let old_my_doc = wx.getStorageSync("old_my_doc");
    if (old_my_doc == '') {
      old_my_doc = { arr: [] };
    }
    let list = new ArrayList(old_my_doc.arr);
    list.setType("number")
    let id = option.doc_id
    this.setData({
      doc_id: id,
      my_doc: list
    })
    wx.showLoading({
      title: '加载中',
    })
    this.get_data()
  },
  get_data() {
    wx.request({
      url: getApp().api.get_v3_2_doc_info,
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        token: getApp().user.ckLogin(),
        doc_id: this.data.doc_id,
        page: this.data.page
      },
      success: (res) => {
        if (!res.data.doc.is_follow) {
          this.setData({
            is_add: false,
            add_text: "加入档库"
          })
        }
        wx.setNavigationBarTitle({
          title: res.data.doc.title
        })
        if (this.data.page == 1) {
          this.setData({
            doc: res.data.doc,
            likes: res.data.likes,
            question: res.data.questions.list,
            show_page: true
          })
        } else {
          let o_data = this.data.question;
          for (var index in res.data.questions.list) {
            o_data.push(res.data.questions.list[index])
          }
          this.setData({
            question: o_data
          })
        }
        getApp().set_page_more(this, res.data.questions)
        wx.stopPullDownRefresh()
      }, complete: () => {
        wx.hideLoading()
      }
    })
  },
  go_menu: function (event) {
    let doc_id = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../doc-menu/doc-menu?doc_id=' + doc_id
    })
  },
  add_my_doc: function (event) {
    let doc_id = event.currentTarget.dataset.id;
    getApp().user.isLogin(token => {
      wx.showNavigationBarLoading()
      wx.request({
        url: getApp().api.v3_user_favor,
        method: 'post',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: {
          token: token,
          data_id: doc_id,
          type: 'doc'
        }, success: res => {
          if (res.data.code == 1) {
            this.setData({
              is_add: true,
              add_text: "已加入"
            })
            wx.showToast({
              title: res.data.msg
            })
            try {
              getApp().pages.get('pages/user/user').get_data();
            } catch (e) {

            }
          }else{
            wx.showToast({
              title: res.data.msg,
            })
          }
        }, complete: res => {
          wx.hideNavigationBarLoading()
        }
      })
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
  show_menu() {
    wx.showActionSheet({
      itemList: ['提问', '生成封面', '打赏'],
      success: (res) => {
        switch (res.tapIndex) {
          case 0:
            wx.navigateTo({
              url: '../wenda-post/wenda-post?source=doc&source_id='+this.data.doc_id,
            })
            break;
          case 1:
            this.onGetShareCode()
            break;
          case 2:
            wx.showToast({
              title: '即将开放',
            })
            break;  
        }
      }
    })
  },
  onShareAppMessage: function () {
    return {
      title: "魔灯文档-分享精彩"
    }
  },
  onGetShareCode: function() {
    wx.request({
      url: getApp().api.get_share_code,
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        doc_id: this.data.doc_id
      },
      success: res => {
        if (res.data.code == 1) {
          wx.previewImage({
            urls: [res.data.qr_code],
          })
        } else {
          wx.showToast({
            title: res.data.msg,
          })
        }
      }
    })
  },
  doc_like(event) {
    let doc_id = event.currentTarget.dataset.id;
    getApp().user.isLogin(token => {
      wx.request({
        url: getApp().api.v3_user_like,
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: {
          token: token,
          data_id: doc_id,
          type: 'doc'
        }, success: res => {
          if (res.data.code == 1) {
            wx.showToast({
              title: res.data.msg,
            })
            //更新赞的人员列表
            this.setData({
              likes: res.data.likes
            })
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