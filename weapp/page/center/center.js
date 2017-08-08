import User from '../../service/User'
import Event from '../../common/Event'
import Modal from '../../common/Modal'
import Navigator from '../../common/Navigator'

Page({
    _components: ['LoginTip', 'Circle'],
    data: {
        userInfo: {},
        orderSummary: {},
        userLevlName: '',
        yBean: '',
        orderState: [
            {'type': 'unpay', 'name': '待付款', 'imgurl': '/static/center/payment.png', 'number': 0, 'status': 1},
            {'type': 'undelivery', 'name': '待发货', 'imgurl': '/static/center/shipped.png', 'number': 0, 'status': 2},
            {'type': 'unreceive', 'name': '待收货', 'imgurl': '/static/center/receipt.png', 'number': 0, 'status': 3},
            {'type': 'isOver', 'name': '已完成', 'imgurl': '/static/center/evaluated.png', 'number': 0, 'status': 4}
        ],
        walletInfo: [
            {'type': 'yCardBalance', 'name': '悠点卡', 'number': '--'},
            {'type': 'eCardBalance', 'name': '伊点卡', 'number': '--'},
            {'type': 'coupon', 'name': '优惠券', 'number': '--'}
        ],
    },
    onLoad() {
        Event.on(Event.LOGIN_SUCCESS, () => this.resetData())
        Event.on(Event.ORDER_CANCEL, () => this.resetData())
        Event.on(Event.ORDER_DELETE, () => this.resetData())
        Event.on(Event.ORDER_TIMEOUT, () => this.resetData())
        Event.on(Event.ORDER_SUBMIT, () => this.resetData())
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
    onPullDownRefresh() {
        this.getData()
    },
    getData() {
        const isLogin = User.isLogin()
        this.setData({loginStatus: isLogin ? 1 : 0})
        if (isLogin) {
            const userInfo = User.getUserInfo()
            this.setData({
                userInfo: {
                    headPicUrl: userInfo.headPicUrl,
                    nickname: userInfo.nickname || userInfo.username || userInfo.mobile
                }
            })
            this.orderSummary()
            this.centerInfo()
            this.walletSummary()
        }
        Modal.hideLoading()
    },
    orderSummary() {
        User.getOrderSummary().then(res => {
            const orderState = this.data.orderState
            Object.keys(res).forEach(key => (orderState.filter(item => item.type == key)[0] || {}).number = res[key])
            this.setData({orderState})
        })
    },
    centerInfo() {
        User.centerInfo().then(({userLevlName}) => this.setData({userLevlName}))
    },
    walletSummary() {
        User.walletSummary().then(res => {
            const walletInfo = this.data.walletInfo
            Object.keys(res).forEach(key => (walletInfo.filter(item => item.type == key)[0] || {}).number = res[key])
            this.setData({
                walletInfo,
                yBean: res.yBean
            })
        })

    },
    jumpUrl(event){
         const { type }=event.currentTarget.dataset
         if(type=='coupon'){
            Navigator.navigateTo('coupon');
         }
    }
})