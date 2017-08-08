import Modal from './Modal'

export default class Paging {
    constructor(options = {}) {
        this._pageNo = 1
        this._hasMore = true
        this._isLock = false
    }

    getPageNo() {
        return this._pageNo
    }

    getList(api, data = {}) {
        data.pageNo = this._pageNo
        const request = (this._isLock || !this._hasMore)
            ? Promise.resolve({hasMore: false, list: [], empty: true})
            : api(data)
        this._isLock = true
        // if (this._pageNo == 1) {
        //     Modal.showLoading()
        // }
        return request
            .then(res => {
                if (!res.empty) {
                    this._hasMore = res.hasMore
                    this._pageNo++
                }
                return res
            })
            .finally(() => {
                // Modal.hideLoading()
                this._isLock = false
            })
    }
}