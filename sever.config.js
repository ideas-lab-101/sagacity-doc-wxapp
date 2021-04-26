
const Environment = 'production'

const version = '3.0.0'

/**
 * 数据服务器
 * @type {string}
 */
const host = Environment === 'development'? "http://dev.linestorm.ltd" : "https://docs.ideas-lab.cn"

/**
 * 上传文件服务器
 * @type {string}
 */
const qiniuUploadUrl= Environment === 'development'? "http://dev.linestorm.ltd" : "https://docs.ideas-lab.cn"

/**
 * 图片服务器
 * @type {string}
 */
const resourseUrl = host + 'resource/'
const qiniuDomain= 'http://cloud-doc.ideas-lab.cn/'

module.exports = {
    version,
    Environment,
    host,
    qiniuUploadUrl,
    resourseUrl,
    qiniuDomain
}
