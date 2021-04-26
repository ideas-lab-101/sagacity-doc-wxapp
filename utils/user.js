import {fetch} from "../axios/fetch"
class user {

  constructor() {
    try {
        let authToken = wx.getStorageSync('AuthToken')
        if (authToken) {
            this.authToken = authToken
        } else {
            throw false
        }
    } catch (e) {
        this.authToken = false
    }
    try {
      let userInfo = wx.getStorageSync('UserInfo')
      if (userInfo) {
          this.userInfo = userInfo
      } else {
          throw false
      }
  } catch (e) {
      this.authInfo = null
      this.userInfo = null
  }
  }

  get getToken() {
    let authToken = wx.getStorageSync('AuthToken')
    return authToken
  }

  get getUserInfo() {
    let userInfo = wx.getStorageSync('UserInfo')
    return userInfo
  }
  /**
   * 检测是否登录 无操作
   */
  ckLogin() {
    try {
      let authToken = wx.getStorageSync('AuthToken')
      let userInfo = wx.getStorageSync('UserInfo')
      if (authToken && userInfo) {
        return authToken
      } else {
        throw false;
      }
    } catch (e) {
      return false
    }
  }

  getLogin(){
    return new Promise((resolve, reject) => {
        try {
          let authToken = wx.getStorageSync('AuthToken')
          let userInfo = wx.getStorageSync('UserInfo')
          if (authToken && userInfo) {
            resolve()
          } else {
            this.authUser()
                .then(res => {
                    resolve()
                }, ret => {
                    reject(ret)
                })
          }
        }catch(e) {}
    })
}

  authUser() {
    return new Promise((resolve, reject) => {
      this.__getUserProfile()
      .then(res => {
        this.goLogin(res.userInfo)
        .then((token)=>{
          resolve(token)
        },ret=>{
          reject(ret)
        })
      },ret =>{
        reject(ret)
      })
    })
  }

  goLogin(authInfo) {
    const FormatUserInfo = JSON.stringify(authInfo) || '';
    return new Promise((resolve, reject) => {
        this.__getWxLogin()
            .then( code => {
              fetch({
                url: '/wxss/system/accountLogin',
                data: {
                  userData: FormatUserInfo,
                  code: code
                },
                method: 'POST'
              }).then(res=>{
                wx.setStorageSync('UserInfo', res.data.user_info)
                wx.setStorageSync('AuthToken', res.data.token)
                resolve(res.data.token)
              }, ret => {
                reject(ret)
              })
            })    
      })
  }

  /**
     * 获取微信用户信息
     * @returns {Promise<unknown>}
     */
    __getWxLogin() {
      return new Promise((resolve, reject) => {
          wx.login({
              success: res => {
                  resolve(res.code)
              },
              fail: ret => {
                  reject(ret)
              }
          })
      })
  }

  __getUserProfile() {
    return new Promise((resolve, reject) => {
      wx.getUserProfile({
          desc: "魔灯知库申请获取你的头像及昵称",
          success: res => {
              resolve(res)
          },
          fail: ret => {
              reject(ret)
          }
      })
    })
  }






  /**
   * 检测用户是否登录，未登录进行登录操作
   */
  isLogin(cb) {
    try {
      let authToken = wx.getStorageSync('AuthToken')
      let userInfo = wx.getStorageSync('UserInfo')
      if (authToken && userInfo) {
        typeof cb == "function" && cb(authToken)
      } else {
        throw false;
      }
    } catch (e) {
      this.getUser(res => {
        typeof cb == "function" && cb(res)
      })
    }
  }

  getUser(cb) {
    var that = this
    this.getUserInfo(function (info, code) {
      that.goLogin(code, info, function (userInfo) {
        typeof cb == "function" && cb(userInfo)
      });
    });
  }
  
  /**
   * 获取微信用户信息
   */
  getUserInfo(cb) {
    var that = this
    //调用登录接口
    wx.login({
      success: function (res) {
        var code = res.code;
        wx.getUserProfile({
          success: function (res) {
            typeof cb == "function" && cb(res, code)
          },
          fail: function (res) {
            wx.showModal({
              content: '您拒绝了用户授权，如需重新授权，请到个人中心点击立即登录按钮授权！',
              success: function (res) {
                if (res.confirm) {
                  wx.switchTab({
                    url: '/pages/user/user',
                  })
                } else if (res.cancel) {
                  console.log('用户点击取消')
                }
              }
            })
          }
        })
      }
    })
  }

}


module.exports = user;