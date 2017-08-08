import Order from '../../service/Order'
import Coupon from '../../service/Coupon'
import Modal from '../../common/Modal'
import Event from '../../common/Event'
import Navigator from '../../common/Navigator'
import Address from '../../service/Address'
import Shopcart from '../../service/Shopcart'

Page({
    _components: ['GoodsPic', 'Right'],
    data: {
        visible: false,
        receiver: {},
        amount: 0,
        merchantList: [],
        totalDeliveryFee: 0,
        merchantDeliveryModeList: [],
        expenseList: [],
        allCoupon: {},
        points: {},
        orderECard: {},
        orderUCard: {},
        brokerage: {},
        coupons: []
    },
    onLoad() {
        Event.on(Event.ADDRESS_CHOOSE, () => this.resetData())
        Event.on(Event.ADDRESS_ADD, () => this.resetData())
        Event.on(Event.ADDRESS_EDIT, () => this.resetData())
        this.getData()
    },
    resetData() {
        this.setData(this._data)
        this._needReload = true
    },
    onShow() {
        if (this._needReload) {
            this._needReload = false
            this.getData(true)
        }
    },
    getData(again = false) {
        this.confirmOrder(again)
    },
    goAddressList() {
        Navigator.navigateTo('address-list', {source: 'order-confirm'})
    },
    confirmOrder(again) {
        return Order.confirm(again).then((res = {}) => {
            this.setData({
                receiver: res.receiver,
                amount: res.amount,
                merchantList: res.merchantList,
                totalDeliveryFee: res.totalDeliveryFee,
                merchantDeliveryModeList: res.merchantDeliveryModeList,
                expenseList: res.expenseList,
                allCoupon: res.allCoupon,
                coupons: res.coupons,
                points: res.points,
                orderECard: res.orderECard,
                orderUCard: res.orderUCard,
                brokerage: res.brokerage,
                visible: true
            })
            if (res.error) {
                // 取消勾选有问题的商品
                Shopcart.edit(res.error.data.map(item => ({
                    mpId: item.id,
                    checked: false
                }))).then(() => Event.emit(Event.CART_EDIT))
                // 提示用户是否继续买还是返回购物车
                Modal.confirm({
                    content: `您选择购买的【${res.error.data.map(item => item.name).join('、')}】已失效或库存不足，是否继续购买剩余商品？`,
                    success: ({confirm}) => {
                        if (confirm) {
                            if (!res.receiver) {
                                Address.tipAdd()
                            }
                        } else {
                            Event.emit(Event.ORDER_ERROR)
                            Navigator.navigateBack()
                        }
                    }
                })
            }
        })
    },
    changeDeliveryMode(event) {
        const {index} = event.currentTarget.dataset
        const {merchantDeliveryModeList} = this.data
        const merchantDeliveryMode = merchantDeliveryModeList[index]
        const value = event.detail.value
        if(merchantDeliveryMode.activeIndex == value) {
            return
        }
        merchantDeliveryMode.activeIndex = value
        this.setData({merchantDeliveryModeList})
        Modal.showLoading()
        Order.saveDeliveryMode({deliveryModeCodeChecked: merchantDeliveryMode.deliveryModeList[merchantDeliveryMode.activeIndex].code})
            .then(() => this.confirmOrder(true))
    },
    blurRemark(event) {
        const {index} = event.currentTarget.dataset
        Modal.showLoading()
        Order.saveRemark({
            remark: event.detail.value,
            id: index + 1
        })
            .then(() => this.confirmOrder(true))
    },
    submitOrder(event) {
        Order.submit()
    },
    changeCoupon(event) {
        const value = parseInt(event.detail.value)
        const allCoupon = this.data.allCoupon
        if (value != allCoupon.activeIndex) {
            const selected = value != 0 ? 1 : 0
            this.setData({'allCoupon.activeIndex': value})
            Modal.showLoading()
            Coupon.use({
                selected,
                couponId: selected == 0 ? 0 : allCoupon.orderCoupons[value].couponId
            }).then(() => this.confirmOrder(true))
        }
    },
    tapPoints() {
        const points = this.data.points
        if (!points.isAvailable) {
            return
        }
        points.selected = !points.selected
        this.setData({points})
        Modal.showLoading()
        Order.usePoints({points: points.selected ? points.canUseCount : 0})
            .then(() => this.confirmOrder(true))
    },
    tapUCard() {
        const orderUCard = this.data.orderUCard
        if (!orderUCard.isAvailable) {
            return
        }
        orderUCard.selected = !orderUCard.selected
        this.setData({orderUCard})
        Modal.showLoading()
        Order.useUCard(orderUCard.selected)
            .then(() => this.confirmOrder(true))
    },
    tapECard() {
        const orderECard = this.data.orderECard
        if (!orderECard.isAvailable) {
            return
        }
        orderECard.selected = !orderECard.selected
        this.setData({orderECard})
    }
})