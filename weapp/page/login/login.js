import Modal from '../../common/Modal'
import Navigator from '../../common/Navigator'
import Laiyifen from '../../service/Laiyifen'
import User from '../../service/User'

Page({
    data: {
        mobile: '',
        buttonDisable: false,
        verifyCodeTime: '获取验证码',
        isRegist: 0

    },
    onLoad() {
        const {page, regist, mobile, loginstyle} = this._query
        //判断是登陆还是注册

        if (regist != 1) {
            wx.setNavigationBarTitle({
                title: '登录'
            })

            this.setData({
                usernamelabel: '账户',
                placeholder: '用户名/邮箱/手机号',
                btnname: '登录',
                currentPage: 'login',
                isRegist: 0,
                loginstyle: loginstyle || 'mobile'
            })

            if (mobile) {
                this.setData({
                    mobile: mobile
                })
            }

        } else {
            wx.setNavigationBarTitle({
                title: '注册'
            })

            this.setData({
                usernamelabel: '手机号',
                placeholder: '请输入11位手机号码',
                btnname: '提交',
                currentPage: 'regist',
                isRegist: 1
            })
        }
    },
    //去注册页面
    toRegist() {
        Navigator.redirectTo('login', {regist: 1})
    },
    //去登陆页面
    toLogin(mobile) {
        Navigator.redirectTo('login', {regist: 0, mobile: mobile})
    },
    loginByPwd(event) {
        const {style} = event.currentTarget.dataset
        this.setData({loginstyle: style})
        Navigator.redirectTo('login', {regist: 0, loginstyle: style})
    },
    formSubmit(e) {
        const {username, password, capture} = e.detail.value
        if (this.data.isRegist != 1) {  //登录
            if(this.data.loginstyle=='pwd'){  //密码登录
                if (!username) {
                    Modal.alert('账户不能为空')
                    return
                }
                if (!password) {
                    Modal.alert('密码不能为空')
                    return
                }
                 User.login({
                    // mobile:username,
                    // captchas:capture,
                    // captchasType:3
                    username: username,
                    password: password
                })

            }else{    //手机号登录
                 if (!username) {
                    Modal.alert('账户不能为空')
                    return
                }
                if (!capture) {
                    Modal.alert('验证码不能为空')
                    return
                }
                 User.login({
                    mobile:username,
                    captchas:capture,
                    captchasType:3
                    // username: username,
                    // password: password
                })

            }

        } else {  //注册
            User.regist({
                mobile: username,
                captchas: capture,
                deviceId: 'H5',
                captchasType: 1
            })
        }
    },
    pwdInputEvent(e) {
        this.setData({
            password: e.detail.value
        })
    },
    mobileInputEvent(e) {
        this.setData({
            mobile: e.detail.value
        })
    },
    verifyCodeEvent(e) {
        const {buttonDisable, mobile, isRegist} = this.data

        if (buttonDisable) {
            return false
        }

        //验证手机号是否重复
        if (isRegist == 1) {  //注册
            User.isRepeatMobile({mobile})
                .then(res => {
                    User.sendCaptchasCode({
                        mobile: mobile,
                        captchasType: 1
                    }).then(() => {
                        let c = 60
                        const intervalId = setInterval(() => {
                            if (--c <= 0) {
                                clearInterval(intervalId)
                                this.setData({
                                    verifyCodeTime: '获取验证码',
                                    buttonDisable: false
                                })
                            } else {
                                this.setData({
                                    verifyCodeTime: c + 's后重发',
                                    buttonDisable: true
                                })
                            }
                        }, 1000)
                    })

                })
                .catch(err => {
                    if (err.detail.code == -1) {
                        Modal.showToast({
                            title: '该手机号已经注册直接登录',
                            success: res => {
                                this.setData({
                                    isRegist: 0
                                })
                                this.toLogin(mobile)
                            }
                        })
                    } else {
                        Modal.showError(err)
                    }
                })

        } else {
            User.sendCaptchasCode({
                mobile: mobile,
                captchasType: 3
            }).then(() => {
                let c = 60
                const intervalId = setInterval(() => {
                    if (--c <= 0) {
                        clearInterval(intervalId)
                        this.setData({
                            verifyCodeTime: '获取验证码',
                            buttonDisable: false
                        })
                    } else {
                        this.setData({
                            verifyCodeTime: c + 's后重发',
                            buttonDisable: true
                        })
                    }
                }, 1000)
            })

        }

    }
})