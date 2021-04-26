//app.js
const Version = '1.8.2';
const Towxml = require('/towxml/main');
const User = require('/utils/user');
const Pages = require('/utils/pages');
// const HOST = "https://docs.ideas-lab.cn";
const HOST = "http://dev.linestorm.ltd";

App({
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    var app = this
    wx.getSystemInfo({
      success: function (res) {
        app.globalData.deviceHeight = res.windowHeight
        app.globalData.deviceWidth = res.windowWidth
      },
    })
  },
  globalData: {
    g_isPlayingMusic: false,
    deviceHeight: 0,
    deviceWidth: 0
  },
  towxml: new Towxml(),
  user: new User(),
  pages: new Pages(),
  api: {
    get_list: HOST + "/api/list",
    get_v3_info: HOST + "/api/v3/info",
    get_menu: HOST + "/api/menu",
    get_page: HOST + "/api/page",
    get_v2_index: HOST + "/api/v2/index",
    get_v2_class: HOST + "/wxss/doc/getClassList",
    get_class: HOST + "/wxss/system/getClassList",
    get_v2_class_doc: HOST + "/api/v2/list",
    get_v2_doc_menu: HOST + "/wxss/doc/getDocMenu",
    get_v2_page: HOST + "/wxss/doc/getPageDetail",
    get_v2_my_doc: HOST + "/api/v2/get-my-doc",
    get_v2_search: HOST + "/wxss/doc/search",
    get_v2_search_index: HOST + "/wxss/doc/getHotSearch",
    get_v2_search_tip: HOST + "/wxss/doc/tipSearch",

    /**
     * V3版本接口
     */
    get_index: HOST + "/wxss/doc/v2/index",
    get_doc_info: HOST + "/wxss/doc/v2/getDocInfo",
    get_page_info: HOST + "/wxss/doc/v2/getPageDetail",
    get_doc_menu: HOST + "/wxss/doc/v2/getDocMenu",

    v3_doc_feedback: HOST +"/wxss/doc/docFeedback",//文档反馈

    get_v3_doc_page_menu: HOST + "/api/v3/doc-page-menu",
    get_v3_article_index: HOST + "/api/v3/article-index",
    get_v3_article_page: HOST + "/api/v3/article-page",
    get_class_doc: HOST + "/wxss/doc/v2/getClassDocList",
    get_user_index: HOST + "/wxss/user/getAccountInfo",
    get_share_code: HOST + '/wxss/system/getWXSSCode',
    do_user_favor: HOST + "/wxss/user/userFavor",
    do_user_like: HOST + "/wxss/user/userLike",
    do_user_follow: HOST + "/wxss/user/userFollow",
    v3_user_favor_cancel: HOST + "/wxss/user/userFavorCancel",
    v3_user_account: HOST + "/wxss/user/getPayList",

    login: HOST + "/wxss/system/accountLogin",
    scan_login: HOST + "/wxss/system/scanLogin",

    //问答
    v3_wenda_index: HOST + "/wxss/question/index",
    v3_wenda_page: HOST + "/wxss/question/getQuestionInfo",
    v3_wenda_upload_image: HOST + "/api/v3/wenda-upload-image",
    v3_wenda_post: HOST + "/wxss/question/questionPost",
    v3_wenda_reply_post: HOST + "/wxss/question/replyPost",

    //视频
    get_video_class: HOST + "/wxss/video/getVideoClass",
    get_video_list: HOST + "/wxss/video/getVideoList",
    get_class_video: HOST + "/wxss/video/getClassVideoList",
    get_video_info: HOST + "/wxss/video/getVideoInfo",

    //搜索的新接口，包括文档和视频
    get_v3_search: HOST + "/wxss/system/search",
    get_v3_search_index: HOST + "/wxss/system/getHotSearch",
    get_v3_search_tip: HOST + "/wxss/system/tipSearch",

    //支付相关接口
    get_v2_pay_item: HOST + "/wxss/pay/getPayItem",
    get_v2_gen_order: HOST + "/wxss/pay/genOrder",
    wx_pay: HOST + "/wxss/pay/wxPay",

    //音乐相关
    get_back_music: HOST + "/wxss/music/getPageMusic",

    //留言
    v3_comment_index: HOST + "/wxss/comment/getCommentList",
    v3_comment_post: HOST + "/wxss/comment/addComment",
    v3_comment_del: HOST + "/wxss/comment/delComment",
  }
})
