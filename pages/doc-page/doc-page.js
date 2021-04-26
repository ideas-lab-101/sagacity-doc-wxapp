// doc-page.js
import { $wuxButton } from '../../components/wux'
import {fetch} from "../../axios/fetch"

Page({

  /**
   * 页面的初始数据
   */
  data: {
    page_id: 0,
    article: {},
    music: {},
    page_info: [],
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
          icon: "/assets/images/btn_QR.png",
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
    fetch({
      url: "/wxss/doc/v2/getPageDetail",
      data: {
        pageId: this.data.page_id
      },
      method: 'GET'
    }).then(res=>{
      try {
        let data = getApp().towxml.toJson(res.data.page.content, 'markdown');
        data.theme = this.data.read_type;
        this.set_nav_type(this.data.read_type)
        this.setData({
          article: data,
          page_info: res.data.page,
          likes: res.data.likes,
          list_menu : res.data.menu
        });
        wx.setNavigationBarTitle({
          title: res.data.page.title,
        })
        //获取背景音
        this.set_back_music()
        wx.updateShareMenu({})
      } catch (error) {
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
    }).finally(()=>{
      wx.stopPullDownRefresh()
      wx.hideLoading()
    })
  },
  onGetShareCode: function () {
    getApp().user.getLogin().then(rest=>{
      fetch({
        url: "/wxss/system/getWXSSCode",
        data: {
          type: 'p',
          dataId: this.data.page_id
        },
        method: 'POST'
      }).then(res=>{
        if (res.code == 1) {
          wx.previewImage({
            urls: [res.data.qr_code],
          })
        }else{
          wx.showToast({
            title: res.msg,
            icon: 'none',
          })
        }
      }).finally(()=>{
      })  
    })
  },
  page_like() {
    getApp().user.getLogin().then(rest=>{
      fetch({
        url: "/wxss/user/userLike",
        data: {
          dataId: this.data.page_id,
          type: 'page'
        },
        method: 'POST'
      }).then(res=>{
        if (res.code == 1) {
          wx.showToast({
            title: res.msg,
          })
          //更新赞的人员列表
          this.setData({
            likes: res.data.likes
          })
        }else{
          wx.showToast({
            title: res.msg,
            icon: 'none',
          })
        }
      }).finally(()=>{
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
      title: this.data.page_info.title,
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
  set_back_music(){
    fetch({
      url: "/wxss/music/getPageMusic",
      data: {
        pageId: this.data.page_id
      },
      method: 'GET'
    }).then(res=>{
      try{
        wx.stopBackgroundAudio({
          fail: (res) => {},
        }) //停掉之前的歌曲
        if (res.data != null){
          this.setData({
            music: res.data,
            show_back_music: true,
            isPlayingMusic: false
          })
        }else{
          this.setData({
            show_back_music: false,
            isPlayingMusic: false
          })
        }
      }catch(err){}
    }).finally(()=>{
      wx.hideLoading()
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
    fetch({
      url: "/wxss/doc/v2/getDocMenu",
      data: {
        docId: this.data.doc_id
      },
      method: 'GET'
    }).then(res=>{
      this.setData({
        menu: res.data.list,
      })
    }).finally(()=>{
      wx.stopPullDownRefresh()
      wx.hideLoading()
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
  //收藏
  collect() {
    getApp().user.getLogin().then(rest=>{
      fetch({
        url: "/wxss/user/userFavor",
        data: {
          dataId: this.data.page_id,
          type: 'page'
        },
        method: 'POST'
      }).then(res=>{
        if (res.code == 1) {
          // this.setData({
          //   is_favor: res.data.is_favor
          // })
          try {
            //更新用户中心的数据
            getApp().pages.get('pages/user/user').get_data();
          } catch (e) {
          }
        }
        wx.showToast({
          title: res.msg,
          icon: 'none',
        })
      }).finally(()=>{
      })
    })
  }
})