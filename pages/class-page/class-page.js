// doc-class.js
import {fetch} from "../../axios/fetch"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    doc: {},
    video: {},
    currentTab: 0,
    winHeight: getApp().globalData.deviceHeight,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
    })
    this.get_data()
   
  },
  bindChange: function (e) {

    var that = this;
    that.setData({ currentTab: e.detail.current });

  },
  swichNav: function (e) {

    var that = this;

    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current
      })
    }
  },
  get_data() {
    fetch({
      url: "/wxss/system/getClassList",
      data: {
      },
      method: 'GET'
    }).then(res=>{
      this.setData({
        doc: res.data.doc,
        video: res.data.video
      })
    }).finally(()=>{
      wx.hideLoading()
      wx.stopPullDownRefresh()
    })
  },
  go_doc_list(event){
    let id = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../doc-class-list/doc-class-list?class_id=' + id,
    })
  },
  go_video_list(event) {
    let id = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../video-class-list/video-class-list?class_id=' + id,
    })
  },
  go_search(){
    wx.navigateTo({
      url: '../system-search/system-search',
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    // this.get_data()
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