// doc-search.js
import {fetch} from "../../axios/fetch"
let ArrayList = require("../../utils/arrayList.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    doc_list: {},
    video_list: {},
    data: {},
    search_tip: {},
    rich: wx.canIUse('rich-text'),
    is_search: false,
    key: null,
    is_load: false,
    more: false,
    no_more: false,
    page: 1,
    hot_tag: {},
    my_search: {},
    my_search_arr: {}
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //获取搜索记录
    let my_search = wx.getStorageSync("my_search");
    if (my_search == '') {
      my_search = { arr: [] };
    }
    let list = new ArrayList(my_search.arr);
    this.setData({
      my_search: list,
      my_search_arr: list.toArray()
    })
    this.get_hostSearch()
  },
  get_hostSearch(){
    fetch({
      url: "/wxss/system/getHotSearch",
      data: {
      },
      method: 'GET'
    }).then(res=>{
      this.setData({
        hot_tag: res.data.list
      })
    }).finally(()=>{
    })
  },
  get_result() {
    this.setData({
      is_load: true
    })
    fetch({
      url: "/wxss/system/search",
      data: {
        key: this.data.key,
        page: this.data.page
      },
      method: 'POST'
    }).then(res=>{
        if (this.data.page <= 1) {
          this.setData({
            doc_list: res.data.doc,
            video_list: res.data.video,
            data: res.data.result,
            is_search: true
          })
        } else {
          let o_data = this.data.data;
          for (var index in res.data.result.items) {
            o_data.items.push(res.data.result.items[index])
          }
          this.setData({
            data: o_data
          })
        }
        //判断是否还有下一页
        let all_page = Math.ceil(res.data.result.total / res.data.rows)
        if (this.data.page == all_page) {
          this.setData({
            more: false,
            no_more: true
          })
        } else if (all_page > this.data.page) {
          this.setData({
            more: true,
            no_more: false
          })
        }

        let key = this.data.key

        //更新搜索记录
        if (this.data.my_search.contains(key)) {//如果存在就先删除
          this.data.my_search.remove(key)
        }
        this.data.my_search.add(key)
        wx.setStorageSync("my_search", this.data.my_search)
        
        this.setData({
          is_load: false
        })
      }).finally(()=>{
        wx.hideLoading();
        this.setData({
          is_load: false
        })
      })
  },
  clear_my_search(event) {
    let key = event.currentTarget.dataset.name;
    //更新搜索记录
    if (this.data.my_search.contains(key)) {//如果存在就先删除
      this.data.my_search.remove(key)
    }
    wx.setStorageSync("my_search", this.data.my_search)
    this.setData({
      my_search_arr: this.data.my_search.toArray()
    })
  },
  search(e) {
    let key = e.detail.value;
    if (key == '') {
      return false;
    }
    this.setData({
      key: key,
      page: 1,
      is_load: false,
      more: false,
      no_more: false
    })
    wx.showLoading({
      title: '搜索中',
    })
    this.get_result()
  },
  search_tip(e) {
    let key = e.detail.value;
    if (key == '') {
      this.setData({
        search_tip: {}
      })
      return false;
    }
    fetch({
      url: "/wxss/system/tipSearch",
      data: {
        key: key
      },
      method: 'GET'
    }).then(res=>{
      this.setData({
        search_tip: res.data
      })
    }).finally(()=>{
    })
  },
  cancel() {
    if (this.data.key != null){ 
      this.setData({
        doc_list: {},
        video_list: {},
        data: {},
        search_tip: {},
        is_search: false,
        key: null,
        is_load: false,
        more: false,
        no_more: false,
        page: 1,
      })
    }else{
      wx.navigateBack()
    }
  },
  go_doc: function (event) {
    let id = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../doc-info/doc-info?doc_id=' + id
    })
  },
  go_video: function (event) {
    let id = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../video-info/video-info?video_id=' + id
    })
  },
  go_page: function (event) {
    let page_id = event.currentTarget.dataset.id;
    console.log(page_id)
    wx.navigateTo({
      url: '../doc-page/doc-page?page_id=' + page_id
    })
  },
  tag_search(event) {
    let name = event.currentTarget.dataset.name;
    this.setData({
      key: name
    })
    wx.showLoading({
      title: '搜索中',
    })
    this.get_result()
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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (!this.data.is_load && this.data.more) {
      this.setData({
        page: this.data.page + 1
      })
      this.get_data()
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})