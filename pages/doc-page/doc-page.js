// doc-page.js
import { $wuxButton } from '../../components/wux'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    page_id: 0,
    article: {},
    music: {},
    info: [],
    likes: {},
    read_type: 'light',
    can_type: wx.canIUse('setNavigationBarColor'),
    font_size: 28,
    isPlayingMusic: false,
    show_set_font: false,
    show_back_music: false,
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
    this.initButton()
  },
  initButton() {
    const that = this
    this.setData({
      opened: !1,
    })

    this.button = $wuxButton.init('br', {
      position: 'bottomRight',
      buttons: [
        {
          label: '文档反馈',
          icon: "/assets/images/btn_message.png"
        },
        {
          label: '加入书签',
          icon: "/assets/images/btn_fav.png"
        },
        {
          label: '单页封面',
          icon: "../../assets/images/btn_QR.png",
        },
        {
          label: '文档首页',
          icon: "/assets/images/btn_doc.png"
        }
      ],
      buttonClicked(index, item) {
        index === 0 && wx.navigateTo({
          url: '../doc-back/doc-back?page_id=' + that.data.page_id
        })

        index === 3 && wx.navigateTo({
          url: '../doc-info/doc-info?doc_id=' + that.data.info.doc_id
        })

        index === 2 && that.onGetShareCode()

        index === 1 && that.collect()

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
      url: getApp().api.get_v3_page,
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
            likes: res.data.likes,
            list_menu : res.data.menu
          });
          wx.setNavigationBarTitle({
            title: res.data.page.title,
          })
          wx.updateShareMenu({

          })
          wx.hideLoading()
          this.get_back_music()
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
  onGetShareCode: function () {
    wx.request({
      url: getApp().api.get_share_code,
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        type: 'p',
        data_id: this.data.page_id
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
  page_like() {
    getApp().user.isLogin(token => {
      wx.request({
        url: getApp().api.v3_user_like,
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
            //更新赞的人员列表
            this.setData({
              likes: res.data.likes
            })
          } else {
            wx.showToast({
              title: res.data.msg,
              icon: 'none'
            })
          }
        }, complete: () => {
        }
      })
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
      title: this.data.info.title,
      path: "/pages/doc-page/doc-page?page_id="+this.data.page_id
    }
  },
  // previewImage: function (event) {
  //   let src = event.currentTarget.dataset.src;
  //   wx.previewImage({
  //     current: src,
  //     urls: [src]
  //   })
  // },
  eventRun_bind_tap: function (event) {
    let obj = event.currentTarget.dataset._el
    if(obj.tag === 'image'){
      let src = obj.attr.src
      wx.previewImage({
        current: src,
        urls: [src]
      })
    }
    console.log(event)
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
      show_set_font: false
    })
  },
  set_font() {
    this.setData({
      show_set_font: !this.data.show_set_font
    })
  },
  get_back_music(){
    wx.request({
      url: getApp().api.get_back_music,
      data: {
        doc_id: this.data.info.doc_id,
        page_id: this.data.page_id
      },
      success: (res) => {
        wx.stopBackgroundAudio() //停掉之前的歌曲
        if (res.data.data != null){
          this.setData({
            music: res.data.data,
            show_back_music: true,
            isPlayingMusic: false
          })
        }else{
          this.setData({
            show_back_music: false,
            isPlayingMusic: false
          })
        }
      },
      complete: () => {

      }
    })
  },
  on_music_tap() {
    this.setData({
      show_back_music: !this.data.show_back_music
    })
  },
  music_controll() {
    if (this.data.isPlayingMusic) {
      wx.pauseBackgroundAudio();
      //设置全局播放变量
      getApp().globalData.g_isPlayingMusic = false;
      this.setData({
        isPlayingMusic: false
      })
    }
    else {
      wx.playBackgroundAudio({
        dataUrl: this.data.music.resource_url,
        title: this.data.music.title,
        coverImgUrl: this.data.music.cover_url,
      })
      //设置全局播放变量
      getApp().globalData.g_isPlayingMusic = true;
      this.setData({
        isPlayingMusic: true
      })
    }
  },
  show_menu(e) {
    if (this.data.menu.length <= 0) {
      this.get_menu()
    }
    if (this.data.show_menu && e.target.dataset.itself !== 'toggle') {
      return false
    }
    this.setData({
      show_menu: !this.data.show_menu
    })
  },
  get_menu() {
    wx.request({
      url: getApp().api.get_v3_doc_menu,
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
    this.get_back_music()
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
        icon: 'none',
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
        icon: 'none',
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
    const self = this
    $wuxActionSheet.show({
      titleText: '请选择操作',
      theme: 'wx',
      buttons: [
        {
          text: '返回文档'
        },
        {
          text: '加入书签'
        },
        {
          text: '文档反馈'
        },
      ],
      buttonClicked(index, item) {
        index === 0 && wx.navigateTo({
          url: '../doc-info/doc-info?doc_id=' + self.data.info.doc_id
        })

        index === 1 && self.collect()
        
        index === 2 && wx.navigateTo({
          url: '../doc-back/doc-back?page_id=' + self.data.page_id
        })

        return true
      },
      cancelText: '取消',
      cancel() { },
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
              icon: 'none',
            })
          }
        }, complete: () => {
        }
      })
    })
  }
})