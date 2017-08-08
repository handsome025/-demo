import User from '../../service/User'
import Shopcart from '../../service/Shopcart'
import Event from '../../common/Event'
import Navigator from '../../common/Navigator'
import Modal from '../../common/Modal'

Page({
    _components: ['LoginTip', 'NumberBox', 'Right'],
    data: {
        visible: false,
        checkAll: false,
        isEdit: false,
        summary: {},
        merchantList: [],
        productList: [],
    },
    onLoad() {
        Event.on(Event.LOGIN_SUCCESS, () => this.resetData())
        Event.on(Event.CART_ADD, () => this.getData())
        Event.on(Event.CART_EDIT, () => this.getData())
        Event.on(Event.ORDER_ERROR, () => this.getData())
        Event.on(Event.ORDER_SUBMIT, () => this.getData())
        Event.on(Event.ORDER_PAY, () => this.getData())
        Event.on(Event.CART_UNCHECKALL, () => this.setCheckAll(false))
        this._event.on('NumberBox:change', data => this.onNumberBoxChange(data))
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
            this.getCartList()
        }
    },
    getCartList() {
        return Shopcart.getList().then(({summary, productList}) => {
            this.setData({
                summary,
                productList
            })
            productList.forEach((product, index) => this.NumberBoxInit({
                key: `productList[${index}].numberBox`,
                data: {
                    id: product.mpId,
                    value: product.num,
                    max: product.stockNum
                }
            }))
            this.setData({
                checkAll: this.isCheckAll(),
                visible: true
            })
        })
    },
    tapEdit(event) {
        const isEdit = !this.data.isEdit
        this.setData({isEdit})
    },
    tapFooterBuy(event) {
        if (this.data.summary.totalNum > 0) {
            Navigator.navigateTo('order-confirm')
        }
    },
    isCheckAll() {
        return this.data.productList.every(product => product.checked)
    },
    tapCheckAll(event) {
        let {checkAll} = this.data
        this.setCheckAll(!checkAll)
    },
    setCheckAll(checked) {
        const {productList} = this.data
        productList.forEach(product => product.checked = checked)
        this.setData({checkAll: checked, productList})
        this.checkGoods(productList)
    },
    tapCheckOne(event) {
        const {index} = event.currentTarget.dataset
        const {productList} = this.data
        const checked = productList[index].checked = !productList[index].checked
        this.setData({productList, checkAll: this.isCheckAll()})
        this.checkGoods(productList[index])
    },
    checkGoods(productList) {
        Shopcart.edit(productList)
            .then(res => this.getCartList())
    },
    onNumberBoxChange(data) {
        Modal.showLoading()
        Shopcart.setNumber({
            mpId: data.id,
            num: data.value
        }).then(res => this.getCartList())
    },
    tapDelete() {
        const {productList} = this.data
        Shopcart.removeList(productList.filter(p => p.checked))
            .then(res => this.getCartList())
    }
})