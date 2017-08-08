export default {
    showToast(options = {}) {
        if (typeof options === 'string') {
            options = {title: options}
        }
        wx.showToast(Object.assign({
            duration: 1000
        }, options))
    },
    showLoading(options = {}) {
        if (typeof options === 'string') {
            options = {title: options}
        }
        wx.showLoading(Object.assign({
            mark: true,
            title: '加载中...'
        }, options))
    },
    showBarLoading() {
        wx.showNavigationBarLoading()
    },
    hideLoading() {
        wx.hideLoading()
        wx.stopPullDownRefresh()
        wx.hideNavigationBarLoading()
    },
    showModal(options = {}) {
        wx.showModal(options)
    },
    alert(options = {}) {
        if (typeof options === 'string') {
            options = {content: options}
        }
        options.showCancel = false
        this.showModal(options)
    },
    showError(err) {
        this.alert({content: err.message})
    },
    confirm(options = {}) {
        if (typeof options === 'string') {
            options = {content: options}
        }
        options.showCancel = true
        this.showModal(options)
    },
    showActionSheet(options = {}) {
        wx.showActionSheet(options)
    }
}