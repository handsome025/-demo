import Paging from '../../common/Paging'
import Event from '../../common/Event'
import Order from '../../service/Order'
import Modal from '../../common/Modal'
import Navigator from '../../common/Navigator'

Page({
    _components: ['GoodsPic'],
    data: {
        // 0:查询所有  1:待支付 2:待发货 3:待收货 4:待评价 8:已完成 10:已取消 13：已支付（只有拼团订单才会有）20:查询可售后订单
        tabList: [
            {name: '全部', status: 0},
            {name: '待付款', status: 1},
            {name: '待发货', status: 2},
            {name: '待收货', status: 3},
            {name: '已完成', status: 8}
        ],
        tabActive: 0,
        hasMore: true,
        orderList: [],
        isGet: false
    },
    onLoad() {
        Event.on(Event.ORDER_CANCEL, () => this.resetData())
        Event.on(Event.ORDER_DELETE, () => this.resetData())
        Event.on(Event.ORDER_PAY, () => this.resetData())
        this.getData()
    },
    resetData() {
        this.setData(this._data)
        // 先设置好 tab active，不然返回的时候有一瞬间是选中全部的
        this.setData({tabActive: this._query.index})
        this._needReload = true
    },
    onShow() {
        if (this._needReload) {
            this._needReload = false
            this.getData()
        }
    },
    getData() {
        this.getList(this._query.index, true)
    },
    tapTabItem(event) {
        const {index} = event.currentTarget.dataset
        this.getList(index, true)
    },
    getList(index = 0, reset) {
        if (reset) {
            this.orderPaging = new Paging()
            this.setData({
                orderList: [],
                isGet: false
            })
        }
        this.setData({tabActive: index})
        Order.getList({orderStatus: this.data.tabList[index].status}, this.orderPaging)
            .then(res => this.setData({
                hasMore: res.hasMore,
                isGet: true,
                orderList: this.data.orderList.concat(res.list)
            }))
    },
    onReachBottom() {
        this.getList(this.data.tabActive)
    },
    tapDeleteOrder(event) {
        const {id, index} = event.currentTarget.dataset
        Order.remove({orderCode: id}).then(() => {
            const orderList = this.data.orderList
            orderList.splice(index, 1)
            this.setData({orderList})
        })
    }
})