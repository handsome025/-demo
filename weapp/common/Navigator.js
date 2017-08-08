import QueryString from '../util/QueryString'

const concatNameAndParams = (name, params = {}) => `/page/${name}/${name}?${QueryString.stringify(params)}`

export default {
    navigateTo(name, params) {
        wx.navigateTo({url: concatNameAndParams(name, params)})
    },
    redirectTo(name, params) {
        wx.redirectTo({url: concatNameAndParams(name, params)})
    },
    switchTab(name) {
        // tab 不支持 queryString
        // wx.switchTab({url: concatNameAndParams(name, params)})
        wx.switchTab({url: `/page/${name}/${name}`})
    },
    reLaunch(name, params) {
        wx.reLaunch({url: concatNameAndParams(name, params)})
    },
    navigateBack(delta) {
        wx.navigateBack(delta)
    },
    getCurrentPage() {
        return getCurrentPages().pop().route.match(/\/(.*?)\/\1/).pop()
    }
}