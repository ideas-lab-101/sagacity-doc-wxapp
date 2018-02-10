// doc-page.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    page_id: {},
    article: {},
    info: [],
    read_type: 'light',
    can_type: wx.canIUse('setNavigationBarColor'),
    font_size: 28,
    show_set_font: false,
    show_menu: false,
    menu: [], //用以展现目录
    list_menu: [] //列表数据，用以实现上一页、下一页
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (option) {
    let id = option.page_id
    this.setData({
      page_id: id
    });
    let s_type = wx.getStorageSync('read_type');
    if (s_type === 'light' || s_type === 'dark') {
      this.setData({
        read_type: s_type
      })
    }

    wx.getStorage({
      key: 'font_size',
      success: res => {
        this.setData({
          font_size: res.data
        })
      },
    })

    wx.showLoading({
      title: '加载中',
    })
    this.get_data()
  },

  get_data() {
    wx.request({
      url: getApp().api.get_v2_page,
      data: {
        page_id: this.data.page_id
      },
      header: {
        'content-type': 'application/json'
      },
      success: (res) => {
        try {
          let data = getApp().towxml.toJson(res.data.page.content, 'markdown');
          data.theme = this.data.read_type;
          this.set_nav_type(this.data.read_type)
          this.setData({
            article: data,
            info: res.data.page,
            list_menu : res.data.menu
          });
          wx.setNavigationBarTitle({
            title: res.data.page.title,
          })
          wx.updateShareMenu({

          })
          wx.hideLoading()
          // if (this.data.menu.length <= 0) {
          //   this.get_menu()
          // }
          /*wx.pageScrollTo({
            scrollTop: 0
          })*/


        } catch (error) {
          console.log(error)
          wx.hideLoading()
          wx.showModal({
            title: '提示',
            content: '文档解析失败',
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                console.log('用户点击确定')
                wx.navigateBack()
              }
            }
          })
        }
      },
      fail: (error) => {
        wx.hideLoading()
      },
      complete: () => {

      }
    })
  },
  change_read_type() {
    if (!this.data.can_type) {
      wx.showModal({
        content: '您当前微信版本不支持切换，请升级最新版！'
      })
      return;
    }

    let data = this.data.article
    if (data.theme == 'dark') {
      data.theme = 'light'
    } else {
      data.theme = 'dark'
    }
    this.set_nav_type(data.theme)
    wx.setStorageSync('read_type', data.theme)
    this.setData({
      article: data,
      read_type: data.theme
    })
  },
  set_nav_type(t) {
    if (t === 'dark') {
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#000000',
        animation: {
          duration: 300,
          timingFunc: 'easeIn'
        }
      })
    } else if (t === 'light') {
      wx.setNavigationBarColor({
        frontColor: '#000000',
        backgroundColor: '#ffffff',
        animation: {
          duration: 300,
          timingFunc: 'easeIn'
        }
      })
    }
  },

  onPullDownRefresh: function () {

  },

  onReachBottom: function () {

  },
  onShareAppMessage: function () {
    return {
      title: this.data.info.title
    }
  },
  previewImage: function (event) {
    let src = event.currentTarget.dataset.src;
    wx.previewImage({
      current: src,
      urls: [src]
    })
  },
  sliderchange(event) {
    let value = event.detail.value

    wx.setStorageSync('font_size', value)

    this.setData({
      font_size: value
    })
  },
  main_click() {
    this.setData({
      show_set_font: false,
      show_menu: false,
    })
  },
  set_font() {
    this.setData({
      show_set_font: !this.data.show_set_font
    })
  },
  show_menu() {
    if (this.data.menu.length <= 0) {
      this.get_menu()
    }
    this.setData({
      show_menu: !this.data.show_menu
    })
  },
  get_menu() {
    wx.request({
      url: getApp().api.get_v2_doc_menu,
      data: {
        doc_id: this.data.info.doc_id
      },
      success: (res) => {
        this.setData({
          menu: res.data.data
        })
        wx.stopPullDownRefresh()
      },
      complete: () => {
        wx.hideLoading();
      }
    })
  },
  go_page: function (event) {
    let page_id = event.currentTarget.dataset.id;
    this.setData({
      show_menu: false,
      page_id: page_id
    });
    wx.showLoading({
      title: '加载中',
    })
    this.get_data()
  },
  // 上一页
  up_page() {
    let list_menu = this.data.list_menu
    let page_index = false
    list_menu.map((menu, index) => {
      if (menu.id == this.data.page_id) {
        page_index = index
      }
    })

    if (typeof (list_menu[page_index - 1]) == 'undefined') {
      wx.showToast({
        title: '没有上一篇了',
      })
      return
    }
    let up_id = list_menu[page_index - 1].id

    this.setData({
      show_menu: false,
      page_id: up_id,
      article: '加载中'
    });
    wx.showLoading({
      title: '加载中',
    })
    this.get_data()
  },
  // 下一页
  next_page() {
    let list_menu = this.data.list_menu
    let page_index = false
    list_menu.map((menu, index) => {
      if (menu.id == this.data.page_id) {
        page_index = index
      }
    })

    if (typeof (list_menu[page_index + 1]) == 'undefined') {
      wx.showToast({
        title: '没有下一篇了',
      })
      return
    }
    let up_id = list_menu[page_index + 1].id

    this.setData({
      show_menu: false,
      page_id: up_id,
      article: '加载中'
    });
    wx.showLoading({
      title: '加载中',

    })
    this.get_data()
  },
  //更多
  show_more() {
    wx.showActionSheet({
      itemList: ['收藏', '报错/举报', '文档主页'],
      success: (res) => {
        switch (res.tapIndex) {
          case 0:
            this.collect()
            break;
          case 1:
            wx.navigateTo({
              url: '../doc-back/doc-back?page_id=' + this.data.page_id
            })
            break;
          case 2:
            wx.redirectTo({
              url: '../doc-info/doc-info?doc_id=' + this.data.info.doc_id
            })
            break;
        }
      }
    })
  },
  collect() {
    getApp().user.isLogin(token => {
      wx.showLoading({
        title: '正在收藏',
      })
      wx.request({
        url: getApp().api.v3_user_favor,
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: {
          token: token,
          data_id: this.data.page_id,
          type: 'page'
        }, success: res => {
          if (res.data.code == 1) {
            wx.showToast({
              title: res.data.msg,
            })
            try {
              getApp().pages.get('pages/user/user').get_data();
            } catch (e) {

            }
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