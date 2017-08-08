import Modal from '../common/Modal'
import Navigator from '../common/Navigator'
import Request from '../common/Request'
import Event from '../common/Event'
import DateFormatter from '../util/DateFormatter'
import Laiyifen from './Laiyifen'

export default {
    confirm(again = false) {
        Modal.showLoading()
        return (again ? Laiyifen.api_checkout_showOrder() : Laiyifen.api_checkout_initOrder())
            .finally(() => Modal.hideLoading())
            .catch(err => {
                // 如果全部商品都是有问题的，发送事件取消勾选购物车，否则刷新购物车
                const res = err.detail
                if (res && res.data && res.data.error && res.data.error.type == 4) {
                    Event.emit(Event.CART_UNCHECKALL)
                } else {
                    Event.emit(Event.ORDER_ERROR)
                }
                Modal.alert({
                    content: err.message,
                    success: () => {
                        Navigator.navigateBack()
                    }
                })
            })
    },
    /**
     *
     * @param data
     *  orderNo
     *  money
     */
    payByWeChat(data = {}) {
        Modal.showLoading()
        return new Promise((resolve, reject) => {
            Request.wxLogin()
                .then(loginRes => {
                    data.code = loginRes.code
                    Laiyifen.opay_web_createPay(Object.assign({}, data))
                        .finally(() => Modal.hideLoading())
                        .then(res => {
                            const options = {
                                timeStamp: res.timestamp,
                                nonceStr: res.noncestr,
                                package: res.package,
                                signType: res.signType,
                                paySign: res.sign
                            }
                            options.success = () => resolve()
                            options.fail = err => reject(Request.createError(err))
                            wx.requestPayment(options)
                        })
                        .catch(err => reject(err))
                })
                .catch(err => reject(err))
        })
            .then(() => this.afterPaySuccess())
            .catch(err => {
                if (err.message == 'requestPayment:fail cancel') {
                    Modal.alert({
                        content: '您取消了本次支付',
                        success: () => Navigator.switchTab('center')
                    })
                } else {
                    Modal.showError(err)
                }
            })

    },
    payByECard(options = {}) {
        return new Promise((resolve, reject) => {
            Modal.confirm({
                content: '确认使用伊点储值卡？',
                success: ({confirm}) => {
                    if (!confirm) {
                        reject()
                        return
                    }
                    Modal.showLoading()
                    Laiyifen
                        .api_cashier_payByCard({
                            payMethod: 2,
                            orderCode: options.orderCode
                        })
                        .finally(() => Modal.hideLoading())
                        .then(res => {
                            if (res.isPaid) {
                                this.afterPaySuccess()
                            } else {
                                resolve(res)
                            }
                        })
                        .catch(err => Modal.showError(err))
                }
            })
        })
    },
    payByUCard(options = {}) {
        return new Promise((resolve, reject) => {
            Modal.confirm({
                content: '确认使用悠点会员卡？',
                success: ({confirm}) => {
                    if (!confirm) {
                        reject()
                        return
                    }
                    Modal.showLoading()
                    Laiyifen
                        .api_cashier_payByCard({
                            payMethod: 1,
                            orderCode: options.orderCode
                        })
                        .finally(() => Modal.hideLoading())
                        .then(res => {
                            if (res.isPaid) {
                                this.afterPaySuccess()
                            } else {
                                resolve(res)
                            }
                        })
                        .catch(err => Modal.showError(err))
                }
            })
        })
    },
    getLogistics(options = {}) {
        return Laiyifen.api_my_order_detail({orderCode: options.orderCode})
            .then(res => Laiyifen.api_my_order_newOrderMessage({
                orderCode: options.orderCode,
                packageCode: res.childOrderList[0].packageList[0].packageCode
            }))
    },
    /**
     * 获取支付所需信息
     * @param options
     *  orderCode
     */
    getPayInfo(options = {}) {
        return Promise
            .all([
                Laiyifen.api_my_order_detail({orderCode: options.orderCode}),
                Laiyifen.api_cashier_lyfSupportPayment(),
                Laiyifen.api_my_wallet_summary()
            ])
            .then(([order, supportPayment, wallet]) => ({order, supportPayment, wallet}))
            .catch(err => Modal.showError(err))
    },
    getList(options, paging) {
        return paging.getList(Laiyifen.api_my_order_list, options)
    },
    remove(options = {}) {
        return new Promise((resolve, reject) => {
            Modal.confirm({
                content: '您确定要删除该订单吗？',
                success: ({confirm}) => {
                    if (confirm) {
                        Event.emit(Event.ORDER_DELETE)
                        Modal.showToast('删除订单成功')
                        Laiyifen.api_my_order_delete(options).then(res => resolve())
                    } else {
                        reject()
                    }
                },
                fail: err => reject()
            })
        })
    },
    startDaojishi(time, cb) {
        const target = new Date(time)
        target.setHours(target.getHours() + 12)
        const update = () => {
            const {number, string} = DateFormatter.formatDjs(new Date(), target)
            cb(string)
            if (number <= 0) {
                this.stopDaojishi()
                Event.emit(Event.ORDER_TIMEOUT)
                Modal.alert({
                    content: '该订单已超时',
                    success: () => Navigator.switchTab('center')
                })
            }
        }
        this.stopDaojishi()
        this._daojishi = setInterval(() => update(), 1000)
        update()
    },
    stopDaojishi() {
        clearInterval(this._daojishi)
    },
    getDetail(options = {}) {
        return Laiyifen.api_my_order_detail(options)
    },
    getCancelMsgList() {
        return [
            {key: 1, msg: '运费多收了，我要重新买'},
            {key: 2, msg: '我要退货、退运费'},
            {key: 3, msg: '我要补退差价'},
            {key: 4, msg: '我要退货、退款'},
            {key: 5, msg: '商品及包装有损坏'},
            {key: 6, msg: '商品发货与订单不符'},
            {key: 7, msg: '实际发货少于订单商品'},
            {key: 8, msg: '快递寄送有破损'},
            {key: 9, msg: '发货缺失，需要部分退款'},
            {key: 10, msg: '支付异常'}
        ]
    },
    cancel(options = {}) {
        if (!options.cancelReasonId) {
            Modal.alert('请选择取消原因')
            return
        }
        Modal.showLoading()
        Laiyifen.api_my_order_cancel(options)
            .finally(() => Modal.hideLoading())
            .then(() => {
                Event.emit(Event.ORDER_CANCEL)
                Modal.alert({
                    content: '取消订单成功',
                    success: () => Navigator.navigateBack()
                })
            })
            .catch(err => Modal.showError(err))
    },
    useUCard(isUse) {
        return Laiyifen.api_checkout_saveUCard({
            selected: isUse ? 1 : 0
        })
    },
    usePoints(options = {}) {
        return Laiyifen.api_checkout_savePoints(options)
    },
    saveDeliveryMode(options = {}) {
        return Laiyifen.api_checkout_saveDeliveryMode(options)
    },
    saveRemark(options = {}) {
        return Laiyifen.api_checkout_saveRemark(options)
    },
    submit() {
        Modal.showLoading()
        return Laiyifen.api_checkout_submitOrder()
            .finally(() => Modal.hideLoading())
            .then(res => {
                if (res.isPaid) {
                    this.afterPaySuccess()
                } else {
                    Event.emit(Event.ORDER_SUBMIT)
                    Navigator.redirectTo('order-pay', {id: res.orderCode})
                }
            })
            .catch(err => Modal.showError(err))
    },
    afterPaySuccess() {
        Event.emit(Event.ORDER_PAY)
        Modal.alert({
            content: '支付成功',
            success: () => Navigator.switchTab('center')
        })
    }
}