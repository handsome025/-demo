import Order from '../../service/Order'
import Navigator from '../../common/Navigator'
import Event from '../../common/Event'

Page({
    _components: ['GoodsPic'],
    data: {
        visible: false
    },
    onLoad() {
        Event.on(Event.ORDER_CANCEL, () => this.resetData())
        Event.on(Event.ORDER_PAY, () => this.resetData())
        this.getData()
    },
    resetData() {
        this.setData(this._data)
        this._needReload = true
    },
    onShow() {
        if (this._needReload) {
            this._needReload = false
            this.getData()
        }
    },
    getData() {
        const orderCode = this._query.id
        Order.getDetail({orderCode})
            .then(res => {
                this.setData({
                    orderCode,
                    visible: true,
                    orderStatusName: res.orderStatusName,
                    merchantName: res.merchantName,
                    orderStatus: res.orderStatus,
                    canDelete: res.canDelete,
                    canCancel: res.canCancel,
                    parentOrderCode: res.parentOrderCode,
                    receiver: res.receiver,
                    payMethod: res.payMethod,
                    orderCreateTimeStr: res.orderCreateTimeStr,
                    paymentTimeStr: res.paymentTimeStr,
                    productAmount: res.productAmount,
                    orderDeliveryFeeAccounting: res.orderDeliveryFeeAccounting,
                    orderPaidByUcard: res.orderPaidByUcard,
                    orderPaidByCard: res.orderPaidByCard,
                    paymentAmount: res.paymentAmount,
                    shipTimeStr: res.shipTimeStr,
                    receiveTimeStr: res.receiveTimeStr,
                    promotionAmount: res.promotionAmount,
                    childOrderList: res.childOrderList,
                    orderCanceOperateTypeContext: res.orderCanceOperateTypeContext,
                })
                if (res.orderStatus == 1) {
                    Order.startDaojishi(res.orderCreateTime, daojishi => this.setData({daojishi}))
                }
            })
    },
    onUnload() {
        Order.stopDaojishi()
    },
    tapDeleteOrder(event) {
        Order.remove({orderCode: this._query.id}).then(res => Navigator.navigateBack())
    }
})