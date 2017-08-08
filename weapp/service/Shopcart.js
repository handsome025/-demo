import Laiyifen from './Laiyifen'
import Modal from '../common/Modal'
import Event from '../common/Event'
import Currency from '../util/Currency'
import User from './User'
import Navigator from '../common/Navigator'

export default {
    addToCart(options = {}) {
        if (User.isLogin()) {
            Modal.showToast('加入购物车成功')
            Laiyifen.api_cart_addItem(options).then(() => Event.emit(Event.CART_ADD))
        } else {
            User.goLogin()
        }
    },
    getList() {
        if (Navigator.getCurrentPage() == 'shopcart') {
            Modal.showLoading()
        }
        return new Promise((resolve, reject) => {
            Laiyifen.api_cart_list()
                .then(cartListRes => {
                    // 这块先放着，暂时只取一个列表
                    let productList = []
                    // 失效和活动 统一调用取消勾选
                    let unChecked = cartListRes.failureProducts
                    cartListRes.merchantList.forEach(merchant => {
                        merchant.productGroups = merchant.productGroups.filter(productGroup => {
                            unChecked = unChecked.concat(productGroup.productList.filter(product => product.promotions.length || product.disabled))
                            productGroup.productList = productGroup.productList.filter(product => !product.promotions.length)
                            productList = productList.concat(productGroup.productList)
                            return !productGroup.promotion
                        })
                    })
                    unChecked.forEach(p => p.checked = false)
                    this.edit(unChecked)
                        .then(editRes => {
                            Object.assign(cartListRes.summary, editRes)
                            productList.forEach(product => {
                                product.price = Currency.toFixed(product.price)
                            })
                            // productList.sort((a, b) => {
                            //     if (a.checked) {
                            //         return -1
                            //     }
                            //     if (b.checked) {
                            //         return 1
                            //     }
                            //     return 0
                            // })

                            cartListRes.summary.amount = Currency.toFixed(cartListRes.summary.amount)
                            resolve({
                                summary: cartListRes.summary,
                                productList,
                                merchantList: cartListRes.merchantList,
                            })
                        })
                        .catch(err => reject(err))
                })
                .catch(err => reject(err))
        })
            .catch(err => Modal.showError(err))
            .finally(() => Modal.hideLoading())
    },
    removeList(productList) {
        return new Promise((resolve, reject) => {
            Modal.confirm({
                content: `确定要删除这${productList.length}项吗？`,
                success: ({confirm}) => {
                    if (!confirm) {
                        return
                    }
                    if (!Array.isArray(productList)) {
                        productList = [productList]
                    }
                    Laiyifen
                        .api_cart_removeItemBatch({
                            mpIds: productList.map(p => `${p.mpId}-0-0`).join(',')
                        })
                        .then(res => {
                            Modal.showToast('删除成功')
                            resolve(res)
                        })
                        .catch(err => Modal.showError(err))
                }
            })
        })
    },
    clearFailure(data = {}) {
        return Laiyifen.api_cart_clearFailure(data)
    },
    remove(data = {}) {
        return Laiyifen.api_cart_removeItem(data)
    },
    edit(productList) {
        if (!Array.isArray(productList)) {
            productList = [productList]
        }
        if (Navigator.getCurrentPage() == 'shopcart') {
            Modal.showLoading()
        }
        return Laiyifen.api_cart_editItemCheck({
            checkStr: productList.map(p => `${p.mpId}-${p.checked ? 1 : 0}-0-0`).join(',')
        })
        // .finally(() => Modal.hideLoading()) // 完了会重新拉取 list 所以先不 hide
            .catch(err => {
                if (Navigator.getCurrentPage() == 'shopcart') {
                    Modal.showError(err)
                }
            })
    },
    getCount(data = {}) {
        return Laiyifen.api_cart_count(data)
    },
    clear(data = {}) {
        return Laiyifen.api_cart_clear(data)
    },
    /**
     * 设置某个商品在购物车的数量
     * @param data
     *  mpId
     *  num
     */
    setNumber(data = {}) {
        return Laiyifen.api_cart_editItemNum(data)
    }
}