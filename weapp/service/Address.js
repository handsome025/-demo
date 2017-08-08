import Modal from '../common/Modal'
import Navigator from '../common/Navigator'
import Event from '../common/Event'
import Validate from '../util/Validate'
import Laiyifen from './Laiyifen'

export default {
    /**
     * 获取地址列表
     */
    getList() {
        return Laiyifen.ouser_web_address_getAllAddressForm()
    },
    /**
     * 设置默认地址
     * @param options
     *  id
     */
    setDefault(options = {}) {
        return Laiyifen.ouser_web_address_updateDefaultAddr(options)
    },
    /**
     * 移除某个收货地址
     * @param options
     *  id
     *  defaultIs
     */
    remove(options = {}) {
        return new Promise((resolve, reject) => {
            Modal.confirm({
                content: '您确定要删除该地址吗？',
                success: ({confirm}) => {
                    if (confirm) {
                        Event.emit(Event.ADDRESS_DELETE)
                        Modal.showToast('删除地址成功')
                        Laiyifen.ouser_web_address_deleteAddressForm(options).then(res => resolve())
                    } else {
                        reject()
                    }
                },
                fail: err => reject()
            })
        })
    },
    /**
     * 添加地址
     * @param options
     *  userName
     *  mobile
     *  detailAddress
     *  provinceCode
     *  cityId
     *  regionId
     *  defaultIs
     */
    add(options = {}) {
        if (Validate.isEmpty(options.userName)) {
            Modal.alert('请输入收货人姓名')
            return
        }
        if (!Validate.isPhoneNumber(options.mobile)) {
            Modal.alert('请输入正确的手机号码')
            return
        }
        if (Validate.isEmpty(options.provinceCode) || Validate.isEmpty(options.cityId) || Validate.isEmpty(options.regionId)) {
            Modal.alert('请选择所在地区')
            return
        }
        if (Validate.isEmpty(options.detailAddress)) {
            Modal.alert('请输入详细地址')
            return
        }
        Modal.showLoading()
        Laiyifen.ouser_web_address_addAddressForm(options)
            .finally(() => Modal.hideLoading())
            .then(() => {
                Event.emit(Event.ADDRESS_ADD)
                Modal.alert({
                    content: '提交成功',
                    success: () => Navigator.navigateBack()
                })
            })
            .catch(err => Modal.showError(err))
    },
    edit(options = {}) {
        if (Validate.isEmpty(options.userName)) {
            Modal.alert('请输入收货人姓名')
            return
        }
        if (!Validate.isPhoneNumber(options.mobile)) {
            Modal.alert('请输入正确的手机号码')
            return
        }
        if (Validate.isEmpty(options.provinceCode) || Validate.isEmpty(options.cityId) || Validate.isEmpty(options.regionId)) {
            Modal.alert('请选择所在地区')
            return
        }
        if (Validate.isEmpty(options.detailAddress)) {
            Modal.alert('请输入详细地址')
            return
        }
        Modal.showLoading()
        Laiyifen.ouser_web_address_updateAddressForm(options)
            .finally(() => Modal.hideLoading())
            .then(() => {
                Event.emit(Event.ADDRESS_ADD)
                Modal.alert({
                    content: '提交成功',
                    success: () => Navigator.navigateBack()
                })
            })
            .catch(err => Modal.showError(err))
    },
    _getLocationList: {}, // cache
    getLocationList(options = {}) {
        const key = JSON.stringify(options)
        return this._getLocationList[key]
            ? Promise.resolve(this._getLocationList[key])
            : Laiyifen.api_location_list(options)
                .then(res => this._getLocationList[key] = res)
    },
    choose(options = {}) {
        return Laiyifen.api_checkout_saveReceiver(options)
            .then(() => {
                Event.emit(Event.ADDRESS_CHOOSE)
                Navigator.navigateBack()
            })
            .catch(err => Modal.showError(err))
    },
    tipAdd() {
        Modal.confirm({
            content: '您还没有收货地址，请新增收货地址',
            success: ({confirm}) => {
                if (confirm) {
                    Navigator.navigateTo('address-detail', {type: 'add'})
                }
            }
        })
    }
}