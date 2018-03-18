// pages/course-info/course-info.js
import { $wuxButton } from '../../components/wux'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        video_id: 0,
        video: {},
        danmuList: {},
        related_video: {},
        likes: {},
        is_follow: true,
        add_text: "已订阅",
        liveStatus: {
            isControlsShow: false,
            isPlaying: true,
            isFullscreen: false
        }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (option) {
      let id = option.video_id
        this.setData({
          video_id: id
        })

        wx.showLoading({
            title: '加载中',
        })
        this.get_data()
        this.init_buttons()
    },
    get_data() {
        wx.request({
            url: getApp().api.get_v3_video_page,
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
                token: getApp().user.ckLogin(),
                video_id: this.data.video_id
            },
            success: (res) => {
                if (!res.data.video.is_follow) {
                    this.setData({
                        is_follow: false,
                        add_text: "订阅"
                    })
                }
                wx.setNavigationBarTitle({
                    title: res.data.video.title
                })
                this.setData({
                    video: res.data.video,
                    danmuList: res.data.danmus,
                    likes: res.data.likes,
                    related_video: res.data.relatedVideos
                })
                wx.stopPullDownRefresh()
            }, complete: () => {
                wx.hideLoading()
            }
        })
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
          }
        ],
        buttonClicked(index, item) {
          index === 0 && wx.switchTab({
            url: '../video/video',
          })
          index === 1 && self.onGetShareCode()
          return true
        },
        callback(vm, opened) {
          vm.setData({
            opened,
          })
        },
      })
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {
        this.livePlayerContext = wx.createLivePlayerContext('live-player')
    },
    play() {
        this.livePlayerContext.play()
        this.setData({
            'liveStatus.isPlaying': true
        })
    },
    pause() {
        this.livePlayerContext.stop()
        this.setData({
            'liveStatus.isPlaying': false
        })
    },
    fullscreen() {
        this.livePlayerContext.requestFullScreen({
            direction: 90
        })
        this.setData({
            'liveStatus.isFullscreen': true
        })
    },
    exitFullscreen() {
        this.livePlayerContext.exitFullScreen()
        this.setData({
            'liveStatus.isFullscreen': false
        })
    },
    go_video(event){
      let id = event.currentTarget.dataset.id;
      //停止当前课程
      wx.redirectTo({
        url: '../video-info/video-info?video_id=' + id
      })
    },
    onGetShareCode: function () {
      wx.request({
        url: getApp().api.get_share_code,
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: {
          type: 'v',
          data_id: this.data.video_id
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
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },
    do_pay: function (event) {
      wx.navigateTo({
        url: '../pay/pay?type=video&id=' + this.data.video.id
        + '&title=' + this.data.video.title + '&cover=' + this.data.video.cover,
      })
    },
    add_my_video: function (event) {
        let video_id = event.currentTarget.dataset.id;
        getApp().user.isLogin(token => {
            wx.showNavigationBarLoading()
            wx.request({
                url: getApp().api.v3_user_follow,
                method: 'post',
                header: {
                    'content-type': 'application/x-www-form-urlencoded'
                },
                data: {
                    token: token,
                    data_id: video_id
                }, success: res => {
                    if (res.data.code == 1) {
                        this.setData({
                            is_follow: true,
                            add_text: "已订阅"
                        })
                        wx.showToast({
                            title: res.data.msg
                        })
                    } else {
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
        this.get_data()
    },

    onShareAppMessage: function () {
        return {
            title: '魔灯视频-分享精彩'
        }
    },
    video_like(event) {
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
                    type: 'video'
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
    },
    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },

    statechange(e) {
        console.log('live-player code:', e.detail.code)
    },
    fullscreenchange(e) {
        console.log('live-player code:', e.detail.fullScreen)
    },
    toggleContrls() {
        this.setData({
            'liveStatus.isControlsShow': !this.data.liveStatus.isControlsShow
        })
    }
})