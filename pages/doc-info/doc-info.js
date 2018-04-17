import { $wuxButton } from '../../components/wux'
Page({
  data: {
    doc_id: 0,
    doc: {},
    likes: {},
    related_doc: {},
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
          label: '生成封面',
          icon: "../../assets/images/btn_QR.png",
        },
        {
          label: '收藏',
          icon: "../../assets/images/btn_fav.png",
        }
      ],
      buttonClicked(index, item) {
        index === 0 && wx.switchTab({
          url: '../index/index',
        })
        index === 1 && self.onGetShareCode()
        index === 2 && self.add_my_doc()
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
    wx.request({
      url: getApp().api.get_v3_2_doc_info,
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        token: getApp().user.ckLogin(),
        doc_id: this.data.doc_id
      },
      success: (res) => {
        wx.setNavigationBarTitle({
          title: res.data.doc.title
        })
        this.setData({
          doc: res.data.doc,
          likes: res.data.likes,
          related_doc: res.data.relatedDocs,
          show_page: true
        })
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
  add_my_doc: function (event) {
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
          data_id: this.data.doc_id,
          type: 'doc'
        }, success: res => {
          if (res.data.code == 1) {
            // this.setData({
            //   is_add: true,
            //   add_text: "已加入"
            // })
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
              icon: 'none',
            })
          }
        }, complete: res => {
          wx.hideNavigationBarLoading()
        }
      })
    })
  },
  onPullDownRefresh: function () {
    this.get_data()
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
    wx.request({
      url: getApp().api.get_share_code,
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        type: 'd',
        data_id: this.data.doc_id
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