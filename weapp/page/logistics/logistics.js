import Order from '../../service/Order'

Page({
    data: {
        isGet: false,
        order: {},
        msgList: []
    },
    onLoad() {
        this.getData()
    },
    getData() {
        const orderCode = this._query.id
        Order.getLogistics({orderCode}).then(({orderInfo, orderMessageList}) => {
            this.setData({
                isGet: true,
                order: {
                    distributors: orderInfo.distributors,
                    trackingNumber: orderInfo.trackingNumber,
                    mpCount: orderInfo.mpCount,
                    packageStatusName: orderInfo.packageStatusName,
                    picUrl: orderInfo.productList[0].picUrl
                },
                msgList: orderMessageList
            })
        })
    }
})