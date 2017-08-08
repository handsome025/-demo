import Laiyifen from './Laiyifen'
import Navigator from '../common/Navigator'
import Modal from '../common/Modal'
import Event from '../common/Event'
import Validate from '../util/Validate'
import Request from '../common/Request'

export default {
    getUserInfo: () => Request.getUserInfo(),
    setUserInfo: data => Request.setUserInfo(data),
    isLogin: () => Request.isLogin(),
    goLogin() {
        Navigator.navigateTo('login')
    },
    login(data = {}) {
        Modal.showLoading()
        Laiyifen.api_ouser_login_loginIn(data)
            .finally(() => Modal.hideLoading())
            .then(res => {
                res.data.ut = res.ut
                this.setUserInfo(res.data)
                Event.emit(Event.LOGIN_SUCCESS)
                Modal.alert({
                    content: '登录成功',
                    success: () => Navigator.navigateBack()
                })
            })
            .catch(err => Modal.showError(err))
    },
    regist(data = {}) {
        if (!data.mobile) {
            Modal.alert('账户不能为空')
            return
        }
        if (!data.captchas) {
            Modal.alert('请输入验证码')
            return
        }
        Modal.showLoading()
        Laiyifen.ouser_web_memberRegisterForm_do(data)
            .finally(() => Modal.hideLoading())
            .then(res => {
                Modal.alert({
                    content: '注册成功',
                    success: () => {}
                })
            })
            .catch(err => Modal.showError(err))
    },
    //手机号是否重复
    isRepeatMobile(data={}){
        return Laiyifen.ouser_web_mobileRegister_isRepeatPhoneForm_do(data)
    },
    //获取验证码
    sendCaptchasCode(data = {}) {
        Modal.showLoading()
        return (
            Validate.isPhoneNumber(data.mobile)
                ? Laiyifen.ouser_web_mobileRegister_sendCaptchasCodeFo(data)
                : Promise.reject({message: '手机号不正确'})
        )
            .finally(() => Modal.hideLoading())
            .then(res => Modal.alert('短信验证码发送成功'))
            .catch(err => Modal.showError(err))
    },
    //我的订单所有数量
    getOrderSummary(data = {}) {
        return Laiyifen.api_my_order_summary(data)
            .catch(err => Modal.showError(err))
    },
    // 个人中心的一些信息
    centerInfo(data = {}) {
        return Laiyifen.api_my_user_info(data)
            .catch(err => Modal.showError(err))
    },
    //钱包里的一些数据
    walletSummary(data = {}) {
        return Laiyifen.api_my_wallet_summary(data)
            .catch(err => Modal.showError(err))
    }

}