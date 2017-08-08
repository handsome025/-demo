import Address from '../../service/Address'
import Navigator from '../../common/Navigator'
import Modal from '../../common/Modal'
import Event from '../../common/Event'

Page({
    _components: ['Right'],
    data: {
        visible: false,
        list: [],
        active: 0,
        source: ''
    },
    onLoad() {
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
            this.getData()
        }
    },
    getData() {
        wx.setNavigationBarTitle({title: this._query.source == 'order-confirm' ? '选择收货地址' : '管理收货地址'})
        Address.getList().then(list => this.setData({
            list,
            source: this._query.source,
            active: list.findIndex(item => item.defaultIs),
            visible: true
        }))
    },
    tapAddressItem(event) {
        this.chooseAddress(event.currentTarget.dataset.index)
    },
    tapAddressChoose(event) {
        if (this._tapAddressChoose) {
            return
        }
        this._tapAddressChoose = true
        const {index} = event.currentTarget.dataset
        this.setData({active: index})
        Address.setDefault({id: this.data.list[index].id})
            .then(() => this.chooseAddress(index))
            .catch(err => {
                Modal.showError(err)
                this._tapAddressChoose = false
            })
    },
    chooseAddress(index) {
        if (this._query.source == 'order-confirm') {
            Address.choose({receiverId: this.data.list[index].id})
        }
    },
    tapEdit(event) {
        const {index} = event.currentTarget.dataset
        Navigator.navigateTo('address-detail', {
            type: 'edit',
            form: JSON.stringify(this.data.list[index])
        })
    },
    tapAdd(event) {
        Navigator.navigateTo('address-detail', {type: 'add'})
    },
    tapDel(event) {
        const {index} = event.currentTarget.dataset
        const {id, defaultIs} = this.data.list[index]
        Address.remove({id, defaultIs}).then(() => this.getData())
    },
    tapDefault(event) {
        const {index} = event.currentTarget.dataset
        const id = this.data.list[index].id
        this.setData({active: index})
        Modal.showToast('设为默认地址成功')
        Address.setDefault({id})
    }
})