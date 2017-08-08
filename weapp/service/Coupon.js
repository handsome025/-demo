import Laiyifen from './Laiyifen'
import Modal from '../common/Modal'

export default {
    use(options = {}) {
        return Laiyifen.api_checkout_saveCoupon(options)
    },
    bindCoupon(options = {}, cb = () => {}) {
        if (!options.quannumber) {
            Modal.alert('输入券号有误')
            return
        }
        if (!options.password) {
            Modal.alert('输入券密码不正确')
            return
        }
        Modal.showLoading()
        Laiyifen.api_my_coupon_bindCoupon(options)
            .then(() => {
                Modal.showToast('绑定成功')
                cb()
            })
            .finally(() => Modal.hideLoading())
            .catch(err => Modal.showError(err))

    },
    myCoupon(options = {}) {
        return Laiyifen.api_my_coupon(options)
    }

}