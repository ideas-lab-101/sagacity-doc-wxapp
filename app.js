//app.js
const Towxml = require('/towxml/main');
const User = require('/utils/user');
const Pages = require('/utils/pages');
const HOST = "https://docs.ideas-lab.cn";
// const HOST = "http://test.ideas-lab.cn";

App({
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
  },
  towxml: new Towxml(),
  user: new User(),
  pages: new Pages(),
  set_page_more(tis, pageData) {
    if (pageData.totalRow <= 0) {
      tis.setData({
        no_data: true,
        no_more: false,
        more: false,
      })
    }
    if (pageData.lastPage || pageData.totalRow==0) {
      tis.setData({
        no_more: true,
        more: false,
        more_data: "没有更多了"
      })
    } else {
      tis.setData({
        more: true,
      })
    }
    tis.setData({
      is_load: false
    })
  },
  api: {
    get_list: HOST + "/api/list",
    get_v3_info: HOST + "/api/v3/info",
    get_menu: HOST + "/api/menu",
    get_page: HOST + "/api/page",
    get_v2_index: HOST + "/api/v2/index",
    get_v2_class: HOST + "/wxss/doc/getClassList",
    get_v2_class_doc: HOST + "/api/v2/list",
    get_v2_doc_menu: HOST + "/wxss/doc/getDocMenu",
    get_v2_page: HOST + "/wxss/doc/getPageDetail",
    get_v2_my_doc: HOST + "/api/v2/get-my-doc",
    get_v2_search: HOST + "/api/v2/search",
    get_v2_search_index: HOST + "/wxss/doc/getHotSearch",
    get_v2_search_tip: HOST + "/api/v2/title-tip",

    /**
     * V3版本接口
     */
    get_v3_index: HOST + "/wxss/doc/index",

    get_v3_2_doc_info: HOST + "/wxss/doc/getDocInfo",
    get_v3_doc_page: HOST + "/api/v3/doc-page",

    v3_doc_back: HOST +"/api/v3/doc-back",//文档反馈

    get_v3_doc_page_menu: HOST + "/api/v3/doc-page-menu",
    get_v3_article_index: HOST + "/api/v3/article-index",
    get_v3_article_page: HOST + "/api/v3/article-page",
    get_v3_class_doc: HOST + "/wxss/doc/getClassDocList",
    get_v3_user_index: HOST + "/wxss/user/getAccountInfo",
    get_share_code: HOST + '/wxss/system/getWXSSCode',
    v3_user_favor: HOST + "/wxss/user/userFavor",
    v3_user_like: HOST + "/wxss/user/userLike",
    v3_user_favor_cancel: HOST + "/wxss/user/userFavorCancel",

    login: HOST + "/wxss/system/accountLogin",
    v3_scan_code_login: HOST + "/api/v3/scan-login",

    //问答
    v3_wenda_index: HOST + "/wxss/question/index",
    v3_wenda_page: HOST + "/wxss/question/getQuestionInfo",
    v3_wenda_upload_image: HOST + "/api/v3/wenda-upload-image",
    v3_wenda_post: HOST + "/wxss/question/questionPost",
    v3_wenda_reply_post: HOST + "/wxss/question/replyPost",

    //课程
    get_v3_course: HOST + "/wxss/course/getCourseList",
    get_v3_course_page: HOST + "/wxss/course/getCourseInfo"
  }
})
