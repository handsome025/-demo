import Order from '../../service/Order'

Page({
    data: {
        visible: false,
        daojishi: '',
        canUseECard: false,
        canUseUCard: false,
        eCardBalance: 0,
        yCardBalance: 0,
        amount: 0,
        paymentAmount: 0,
        orderCode: ''
    },
    onLoad() {
        this.getData()
    },
    getData() {
        const orderCode = this._query.id
        Order.getPayInfo({orderCode}).then(({order, supportPayment, wallet}) => {
            this.setData({
                orderCode,
                amount: order.amount,
                paymentAmount: order.paymentAmount,
                canUseECard: supportPayment.canUseECard,
                canUseUCard: supportPayment.canUseUCard,
                eCardBalance: wallet.eCardBalance || 0,
                yCardBalance: wallet.yCardBalance || 0,
                visible: true
            })
            Order.startDaojishi(order.orderCreateTime, daojishi => this.setData({daojishi}))
        })
    },
    tapECard() {
        if (this.data.eCardBalance <= 0) {
            return
        }
        Order.payByECard({orderCode: this._query.id}).then(res => this.getData())
    },
    tapUCard() {
        if (this.data.yCardBalance <= 0) {
            return
        }
        Order.payByUCard({orderCode: this._query.id}).then(res => this.getData())
    },
    tapWeChat() {
        Order.payByWeChat({
            orderNo: this._query.id,
            money: this.data.paymentAmount
        })
    },
    onUnload() {
        Order.stopDaojishi()
    }
})