import Config from './Config'

const DOMAIN = Config.isProd ? 'https://applet.touch.laiyifen.com' : 'http://m.lyf.dev.laiyifen.com'
const USER_KEY = Config.isProd ? 'WEAPP_LAIYIFEN' : 'WEAPP_LAIYIFEN_DEV'

export default {
    request(options = {}) {
        return new Promise((resolve, reject) => {
            options.header = options.header || {}
            options.data = options.data || {}

            if (options.url.indexOf('/') === 0) {
                options.url = DOMAIN + options.url
            }

            if (options.method == 'POST') {
                options.header['content-type'] = 'application/x-www-form-urlencoded'
            }

            const ut = this.getUserInfo().ut
            if (ut) {
                options.data.ut = ut
            }

            if (!('companyId' in options.data)) {
                options.data.companyId = 30
            }

            options.success = ({data = {}, statusCode}) => {
                if (statusCode >= 200 && statusCode <= 299) {
                    if (typeof data === 'string' && data !== '') {
                        resolve(data)
                        return
                    }
                    if (data.code == 0) {
                        resolve(data)
                        return
                    }
                }
                reject(this.createError(data))
            }

            options.fail = err => reject(this.createError(err))

            if (options.name && options.filePath) {
                wx.uploadFile(options)
            } else {
                wx.request(options)
            }
        })
    },
    setUserInfo(data) {
        this._userInfo = data
        try {
            wx.setStorageSync(USER_KEY, data)
        } catch (e) {}
    },
    getUserInfo() {
        if (!this._userInfo) {
            try {
                this._userInfo = wx.getStorageSync(USER_KEY)
            } catch (e) {
                return {}
            }
        }
        return this._userInfo
    },
    isLogin() {
        return Object.keys(this.getUserInfo()).length > 0
    },
    wxLogin() {
        return new Promise((resolve, reject) => {
            wx.login({
                success: res => resolve(res),
                fail: err => reject(this.createError(err))
            })
        })
    },
    createError(data) {
        const error = new Error(data.errMsg || data.message || '网络繁忙')
        error.detail = data
        return error
    }
}