const utils = require('../../utils/util.js')

Page({
  data: {
    id: 0,
    show_page: false,
    data: {},
    reply: [],
    page: 1,
    class_id: 0,
    more_data: "加载更多中..",
    no_more: false,
    no_data: false,
    more: false,
    ls_load: false
  },
  onLoad: function (option) {
    let id = option.id
    this.setData({
      id: id
    })
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
      url: getApp().api.v3_wenda_page,
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        token: getApp().user.ckLogin(),
        id: this.data.id,
        page: this.data.page
      },
      success: res => {
        if (this.data.page == 1) {
          this.setData({
            data: res.data.qs,
            reply: res.data.replys.list,
            show_page: true
          })
        } else {
          let o_data = this.data.reply;
          for (var index in res.data.replys.list) {
            o_data.push(res.data.replys.list[index])
          }
          this.setData({
            reply: o_data
          })
        }
        utils.set_page_more(this, res.data.replys)
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

  },
  show_image(event) {
    let item = event.currentTarget.dataset.src;
    let pics = []
    this.data.wenda.pics_arr.map(item => {
      pics.push(item.path)
    })
    wx.previewImage({
      current: item,
      urls: pics
    })
  },
  wenda_like(event) {
   
    let id = event.currentTarget.dataset.id;
    let ty = event.currentTarget.dataset.type;
    getApp().user.isLogin(token => {
      wx.request({
        url: getApp().api.v3_user_like,
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: {
          token: token,
          data_id: id,
          type: ty
        }, success: res => {
          if (res.data.code == 1) {
            wx.showToast({
              title: res.data.msg,
            })
            if (ty == 'qs') { //问题点赞
              let data = this.data.data
              data.is_like = true
              data.like_count = data.like_count + 1
              this.setData({
                data: data
              })
            }else if(ty == 'qsr') { //回答点赞
              //通过id获得数据行
              let n_data = this.data.reply
              for (var index in n_data) {
                let data = n_data[index]
                if(data.id == id){
                  data.like_count = data.like_count + 1
                }
                this.setData({
                  reply: n_data
                })
              }

            }
          }else{
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