import {fetch} from "../../axios/fetch"
//获取应用实例
var app = getApp()
Page({
  data: {
    data: {},
    page: 1,
    more_data: "加载更多中..",
    no_more: false,
    no_data: false,
    more: false,
    ls_load: false,
    swiper:[],
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    grid:[],
    doc_class_list:[]
  },
  //事件处理函数
  go_info: function (event) {
    let id = event.currentTarget.dataset.id;
    console.log(id)

    wx.navigateTo({
      url: '../doc-info/doc-info?doc_id=' + id
    })
  },
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
    })
    var scene = decodeURIComponent(options.scene)
    if (scene !== 'undefined' && scene.indexOf('d_') >= 0) { //全本
      wx.navigateTo({
        url: `/pages/doc-info/doc-info?doc_id=${scene.slice(2)}`,
      })
    } else if (scene !== 'undefined' && scene.indexOf('p_') >= 0) { //单页
      wx.navigateTo({
        url: `/pages/doc-page/doc-page?page_id=${scene.slice(2)}`,
      })
    } else if (scene !== 'undefined' && scene.indexOf('v_') >= 0) { //视频
      wx.navigateTo({
        url: `/pages/video-info/video-info?video_id=${scene.slice(2)}`,
      })
    }
    //加载首页
    this.get_data()
  },
  get_data() {
    this.setData({
      is_load: true
    })
    fetch({
      url: "/wxss/doc/v2/index",
      data: {
        page: this.data.page
      },
      method: 'GET'
    }).then(res=>{
      this.setData({
        swiper: res.data.swiper,
        grid:res.data.grid,
        doc_class_list:res.data.doc
      })
    }).finally(()=>{
      wx.hideLoading()
      wx.stopPullDownRefresh()
    })
  },
  go_search() {
    wx.navigateTo({
      url: '../doc-search/doc-search',
    })
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.setData({
      page: 1,
      more: false,
      no_more: false,
      no_data: false
    })
    this.get_data()
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

  }
})
