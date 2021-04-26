// pages/course-info/course-info.js
import { $wuxButton } from '../../components/wux'
import {fetch} from "../../axios/fetch"
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
        is_favor: false,
        liveStatus: {
            isControlsShow: false,
            isPlaying: true,
            isFullscreen: false
        },
        videoCurrentUrl: '',
        videoCurrent: 0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (option) {

        let id = option.video_id
        //let id = 142

        this.setData({
          video_id: id
        })

        wx.showLoading({
            title: '加载中',
        })
        this.get_data({
          success: (res) => {
            this._initMedia()
          }
        })
        this.init_buttons()
    },
    onUnload() {
        wx.stopAccelerometer()
    },
    get_data(options) {
      fetch({
        url: "/wxss/video/getVideoInfo",
        data: {
          videoId: this.data.video_id
        },
        method: 'GET'
      }).then(res=>{
        wx.setNavigationBarTitle({
          title: res.data.video.title
        })
        this.data.videoCurrentUrl = res.data.episodes[this.data.videoCurrent].source_url
        this.setData({
            video: res.data.video,
            is_follow: res.data.is_follow,
            is_favor: res.data.is_favor,
            danmuList: res.data.danmus,
            likes: res.data.likes,
            related_video: res.data.relatedVideos,
            episodes: res.data.episodes,
            videoCurrentUrl: this.data.videoCurrentUrl
        })
        options.success && options.success(res)
      }).finally(()=>{
        wx.stopPullDownRefresh()
        wx.hideLoading()
      })
    },
    videoChange(e) {
      const { index } = e.currentTarget.dataset
      this.data.videoCurrentUrl = this.data.episodes[index].source_url
      this.setData({
        videoCurrent: index,
        videoCurrentUrl: this.data.videoCurrentUrl
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
            url: '../index/index',
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
    _initMedia(){
      // console.log(this.data.video.is_live)
      if(this.data.video.is_live === 1){
        this.livePlayerContext = wx.createLivePlayerContext('live-player')
      }else{
        this.videoContext = wx.createVideoContext('video-player')
      }
      //监控屏幕
      this.screenChangeManager()
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {
        wx.startAccelerometer()
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
      getApp().user.getLogin().then(rest=>{
        fetch({
          url: "/wxss/system/getWXSSCode",
          data: {
            type: 'v',
            dataId: this.data.video_id
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
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {
      wx.stopAccelerometer()
    },

    do_pay: function (event) {
      wx.navigateTo({
        url: '../pay/pay?type=video&id=' + this.data.video.id
        + '&title=' + this.data.video.title + '&cover=' + this.data.video.cover,
      })
    },
    do_favor: function (event) {
      getApp().user.getLogin().then(rest=>{
        wx.showNavigationBarLoading()
        fetch({
          url: "/wxss/user/userFavor",
          data: {
            dataId: this.data.video_id,
            type: 'video'
          },
          method: 'POST'
        }).then(res=>{
          if (res.code == 1) {
            this.setData({
              is_favor: res.data.is_favor
            })
          }else{
            wx.showToast({
              title: res.msg,
              icon: 'none',
            })
          }
        }).finally(()=>{
          wx.hideNavigationBarLoading()
        })
      })
    },
    user_follow: function (event) {
        let video_id = event.currentTarget.dataset.id;
        getApp().user.getLogin().then(rest=>{
          wx.showNavigationBarLoading()
          fetch({
            url: "/wxss/user/userFollow",
            data: {
              dataId: this.data.video_id,
            },
            method: 'POST'
          }).then(res=>{
            if (res.code == 1) {
              this.setData({
                is_follow: true
              })
              wx.showToast({
                title: res.msg,
                icon: 'none',
              })
            }else{
              wx.showToast({
                title: res.msg,
                icon: 'none',
              })
            }
          }).finally(()=>{
            wx.hideNavigationBarLoading()
          })
        })
    },
    onPullDownRefresh: function () {

    },

    onShareAppMessage: function () {
        return {
            title: '魔灯视频-分享精彩'
        }
    },
    video_like(event) {
        let video_id = event.currentTarget.dataset.id;
        getApp().user.getLogin().then(rest=>{
          fetch({
            url: "/wxss/user/userLike",
            data: {
              dataId: video_id,
              type: 'video'
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
    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    do_comment: function () {
      wx.navigateTo({
        url: '../comment/comment?type=video&id=' + this.data.video.id,
      })
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
    },

    screenChangeManager(){
      let lastState = 0
      let lastTime = Date.now()
      const that = this

      wx.onAccelerometerChange((res) => {
        const now = Date.now();

        // 500ms检测一次
        if (now - lastTime < 500) {
          return;
        }
        lastTime = now;

        let nowState;

        // 57.3 = 180 / Math.PI
        const Roll = Math.atan2(-res.x, Math.sqrt(res.y * res.y + res.z * res.z)) * 57.3;
        const Pitch = Math.atan2(res.y, res.z) * 57.3;

        // console.log('Roll: ' + Roll, 'Pitch: ' + Pitch)

        // 横屏状态
        if (Roll > 50) {
          if ((Pitch > -180 && Pitch < -60) || (Pitch > 130)) {
            nowState = 1;
          } else {
            nowState = lastState;
          }

        } else if ((Roll > 0 && Roll < 30) || (Roll < 0 && Roll > -30)) {
          let absPitch = Math.abs(Pitch);

          // 如果手机平躺，保持原状态不变，40容错率
          if ((absPitch > 140 || absPitch < 40)) {
            nowState = lastState;
          } else if (Pitch < 0) { /*收集竖向正立的情况*/
            nowState = 0;
          } else {
            nowState = lastState;
          }
        }
        else {
          nowState = lastState;
        }

        // 状态变化时，触发
        if (nowState !== lastState) {
          lastState = nowState;
          if (nowState === 1) {
            // console.log('change:横屏');
            if(that.data.video.is_live === 1){
              console.log('live-h');
              that.livePlayerContext.requestFullScreen({
                direction: 90
              });
            }else{
              console.log('video-h');
              that.videoContext.requestFullScreen({
                direction: 90
              });
            }
          } else {
            // console.log('change:竖屏');
            if (that.data.video.is_live === 1) {
              console.log('live-s');
              that.livePlayerContext.exitFullScreen();
            }else{
              console.log('video-s');
              that.videoContext.exitFullScreen();
            }
          }
        }
      });
    }
})
