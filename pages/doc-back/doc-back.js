import {fetch} from "../../axios/fetch"
Page({
  data: {
    id: null,
    disabled: true,
    d_type: 1,
    items: [
      { name: '1', value: '报错', checked: 'true' },
      { name: '2', value: '举报' },
    ]
  },
  onLoad: function (options) {
    this.setData({
      id: options.page_id
    })
  },
  radioChange: function (e) {
    this.setData({
      d_type: e.detail.value
    })
    console.log('radio发生change事件，携带value值为：', e.detail.value)
  },
  reply_input: function (e) {
    if (e.detail.value.length > 0) {
      this.setData({
        disabled: false
      })
    } else {
      this.setData({
        disabled: true
      })
    }
  },
  bindFormSubmit: function (e) {
    var content = e.detail.value.textarea;
    getApp().user.getLogin().then(rest=>{
      wx.showNavigationBarLoading()
      fetch({
        url: "/wxss/system/userFeedback",
        data: {
          dataId: this.data.id,
          content: content,
          type: this.data.d_type
        },
        method: 'POST'
      }).then(res=>{
        if (res.code == 1) {
          wx.showToast({
            title: res.msg
          })
          setTimeout(() => {
            wx.navigateBack()
          }, 1500);
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
  }  
})