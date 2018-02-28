// pages/course-info/course-info.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        course_id: 0,
        course: {},
        related_course: {},
        likes: {},
        is_add: true,
        add_text: "已加入",
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
        let id = option.course_id
        this.setData({
            course_id: id
        })

        wx.showLoading({
            title: '加载中',
        })
        this.get_data()
    },
    get_data() {
        wx.request({
            url: getApp().api.get_v3_course_page,
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
                token: getApp().user.ckLogin(),
                course_id: this.data.course_id
            },
            success: (res) => {
                if (!res.data.course.is_follow) {
                    this.setData({
                        is_add: false,
                        add_text: "收藏课程"
                    })
                }
                wx.setNavigationBarTitle({
                    title: res.data.course.title
                })
                this.setData({
                    course: res.data.course,
                    likes: res.data.likes,
                    related_course: res.data.relatedCourses
                })
                wx.stopPullDownRefresh()
            }, complete: () => {
                wx.hideLoading()
            }
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
    go_course(event){
      let id = event.currentTarget.dataset.id;
      //停止当前课程
      wx.redirectTo({
        url: '../course-info/course-info?course_id=' + id
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
      wx.showToast({
        title: '即将开放',
      })
    },
    add_my_course: function (event) {
        let course_id = event.currentTarget.dataset.id;
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
                    data_id: course_id,
                    type: 'course'
                }, success: res => {
                    if (res.data.code == 1) {
                        this.setData({
                            is_add: true,
                            add_text: "已加入"
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
            title: '魔灯课程-分享精彩'
        }
    },
    course_like(event) {
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
                    type: 'course'
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