// pages/demo/demo.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        title: '',
        id: 0,
        type: '',
        cover: '',
        pay_item: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
      this.setData({
        type: options.type,
        title: options.title,
        id: options.id,
        cover: options.cover,
      })
      //获得支付项
      wx.request({
        url: getApp().api.get_v2_pay_item,
        success: (res) => {
          this.setData({
            pay_item: res.data.list
          })
        }
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

    selectItem: function (e) {
        const index = e.currentTarget.dataset.index || e.target.dataset.index
        const data = e.currentTarget.dataset.id || e.target.dataset.id //金额
        
        getApp().user.isLogin(token => {
          wx.showNavigationBarLoading()
          wx.request({
            url: getApp().api.get_v2_gen_order,
            method: 'POST',
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
              token: token,
              id: this.data.id,
              type: this.data.type,
              cost: data
            },
            success: res => {
              if (res.data.code == 1) {
                //支付
                this._pay(res.data.order, res.data.pay_id)
              } else {
                wx.showToast({
                  title: res.data.msg,  //标题  
                  icon: 'none'
                })
              }
            },
            fail: error => {
              wx.showToast({
                title: '失败',  //标题  
                icon: 'none'
              })
            }, complete: res => {
              wx.hideNavigationBarLoading()
            }  
          })
        })  
    },

    _pay(order, pay_id) {
      wx.showLoading({
        title: '支付中...',
        mask: true
      })
      wx.request({
        url: getApp().api.wx_pay,
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: {
          out_trade_no: order.orderCode,
          total_fee: order.totalPrice,
          token: getApp().user.ckLogin()
        },
        success: res => {
          wx.hideLoading()
          if (res.data.data) {
            wx.requestPayment({
              'timeStamp': res.data.data.timeStamp,
              'nonceStr': res.data.data.nonceStr,
              'package': res.data.data.package,
              'signType': res.data.data.signType,
              'paySign': res.data.data.paySign,
              'success': function (res) {
                //支付成功后关闭
                setTimeout(() => {
                  wx.navigateBack()
                }, 1500);
              },
              'fail': function (res) {
                wx.showToast({
                  title: '支付失败',  //标题  
                  icon: 'none'
                })
              }
            })
          } else {
            wx.showToast({
              title: '支付失败',  //标题  
              icon: 'none'
            })
          }
        },
        fail: error => {
          wx.hideLoading()
          wx.showToast({
            title: '支付失败',  //标题  
            icon: 'none'
          })
        },
        complete: () => {
          wx.hideLoading()
        }
      })
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

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})