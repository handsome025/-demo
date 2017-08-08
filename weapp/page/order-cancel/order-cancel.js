import Order from '../../service/Order'

Page({
    _components: ['Right'],
    data: {
        list: Order.getCancelMsgList(),
        active: '',
        remark: ''
    },
    tapListItem(event) {
        const {index} = event.currentTarget.dataset
        this.setData({active: this.data.active === index ? '' : index})
    },
    inputRemark(event) {
        this.setData({remark: event.detail.value})
    },
    tapSubmit() {
        const {active, remark, list} = this.data
        Order.cancel({
            orderCode: this._query.id,
            cancelReasonId: (list[active] || {}).key,
            cancelRemark: remark
        })
    }
})