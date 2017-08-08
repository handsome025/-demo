import Coupon from '../../service/Coupon'

Page({
    _components: ['Swiper', 'GoodsPic', 'MoreTip'],
    data: {
        tab: 1,
        couponList: [],
        quannumber: '',
        password: ''
    },
    onLoad() {
        this.getData()
    },
    getData() {
        this.setData(this._data)
        this.getCoupon(1)
    },
    swicthTab(event) {
        const {index, couponStatus} = event.currentTarget.dataset
        this.setData({tab: index, couponList: []})
        this.getCoupon(couponStatus)
    },
    formSubmit(e) {
        const {quannumber, password} = e.detail.value
        Coupon.bindCoupon({
            couponCode: quannumber,
            pwd: password
        }, () => this.getData())
    },
    getCoupon(couponStatus) {
        Coupon.myCoupon({couponStatus})
            .then(couponList => this.setData({couponList}))
    }
})