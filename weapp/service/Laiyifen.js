import Request from '../common/Request'
import Currency from '../util/Currency'
import DateFormatter from '../util/DateFormatter'

export default {
    api_dolphin_list(options = {}) {
        return Request.request({
            url: '/api/dolphin/list',
            data: Object.assign({
                pageCode: '',
                adCode: '',
                platform: 3
            }, options)
        }).then(res => res.data.ad_banner.map(item => {
            // 来伊份 APP 商品详情链接规则：lyf://productdetail?body={"mpId":"1004016507004643"}
            var mpId = decodeURIComponent(String(item.linkUrl)).match(/lyf:\/\/productdetail\?body=(.+)/i)
            try {
                mpId = JSON.parse(mpId.pop()).mpId
            } catch (e) {
                mpId = ''
            }
            return {
                url: mpId ? `/page/product/product?id=${mpId}` : '',
                image: item.imageUrl
            }
        }))
    },
    cms_page_module_getModuleData(options = {}) {
        // 为了过滤活动商品的逻辑
        const pageNo = options.pageNo || 1
        const pageSize = options.pageSize || 20
        if (pageNo == 1) {
            this._cms_page_module_getModuleData = {list: [], pageNo: 1, hasMore: true}
        }
        return new Promise((resolve, reject) => {
            const get50 = () => {
                if (!this._cms_page_module_getModuleData.hasMore
                    || this._cms_page_module_getModuleData.list.length >= pageNo * pageSize) {
                    resolve({
                        hasMore: this._cms_page_module_getModuleData.list.length > pageNo * pageSize,
                        list: this._cms_page_module_getModuleData.list.slice((pageNo - 1) * pageSize, pageNo * pageSize)
                    })
                    return
                }
                const data = Object.assign({
                    moduleId: '',
                    categoryId: -1,
                    pageNo: 1
                }, options, {
                    pageSize: 50, // 强制多取一点,
                    pageNo: this._cms_page_module_getModuleData.pageNo
                })
                return Request.request({
                    url: '/cms/page/module/getModuleData',
                    data
                }).then(res => {
                    this._cms_page_module_getModuleData.hasMore = res.data.totalPage > this._cms_page_module_getModuleData.pageNo
                    this._cms_page_module_getModuleData.pageNo++
                    const list = res.data.listObj.filter(item => item.promotionInfo == null && item.stockNum > 0)
                    this._cms_page_module_getModuleData.list = this._cms_page_module_getModuleData.list.concat(list)
                    get50()
                }).catch(err => reject(err))
            }
            get50()
        }).then(res => {
            res.list = res.list.map(item => ({
                id: item.mpId,
                name: item.mpName,
                image: item.picUrl,
                price: Currency.toFixed(item.price),
                originPrice: Currency.toFixed(item.marketPrice)
            }))
            return res
        })

        // 正常逻辑
        // const data = Object.assign({
        //     moduleId: '',
        //     categoryId: -1,
        //     pageNo: 1,
        //     pageSize: 10
        // }, options)
        // return Request.request({
        //     url: '/cms/page/module/getModuleData',
        //     data
        // }).then(res => ({
        //     hasMore: res.data.totalPage > data.pageNo,
        //     list: res.data.listObj.map(item => ({
        //         id: item.mpId,
        //         name: item.mpName,
        //         image: item.picUrl,
        //         price: Currency.toFixed(item.price),
        //         originPrice: Currency.toFixed(item.marketPrice)
        //     }))
        // }))
    },
    cms_page_getAppHomePage() {
        return Request.request({
            url: '/cms/page/getAppHomePage'
        }).then(res => ({
            banner: (res.data.dataList.filter(item => item.templateCode == 'ad_header').shift() || {}).staticData || {},
            goods: res.data.dataList.filter(item => item.templateCode == 'goods').shift() || {}
        }))
    },
    api_category_list() {
        return Request.request({
            url: '/api/category/list',
            data: {
                parentId: 0,
                level: 1
            }
        }).then(res => {
            const list = res.data.categorys.slice(0, 9)
            list.push({
                categoryId: '1008022000000022',
                categoryName: '水产海鲜'
            })
            return list.map((item, index) => ({
                id: item.categoryId,
                image: `/static/index/category-${index}.png`,
                name: item.categoryName
            }))
        })
    },
    api_search_searchList(options = {}) {
        // 为了过滤活动商品的逻辑
        const pageNo = options.pageNo || 1
        const pageSize = options.pageSize || 20
        if (pageNo == 1) {
            this._api_search_searchList = {list: [], pageNo: 1, hasMore: true}
        }
        return new Promise((resolve, reject) => {
            const get50 = () => {
                if (!this._api_search_searchList.hasMore || this._api_search_searchList.list.length >= pageNo * pageSize) {
                    resolve({
                        hasMore: this._api_search_searchList.list.length > pageNo * pageSize,
                        list: this._api_search_searchList.list.slice((pageNo - 1) * pageSize, pageNo * pageSize)
                    })
                    return
                }
                const data = Object.assign({
                    pageNo: 1,
                    pageSize: 20,
                    sortType: 10,
                    platformId: 3,
                    navCategoryIds: ''
                }, options, {
                    pageSize: 50, // 强制多取一点,
                    pageNo: this._api_search_searchList.pageNo
                })
                return Request.request({
                    url: '/api/search/searchList',
                    data
                }).then(res => {
                    this._api_search_searchList.hasMore = res.data.totalCount > data.pageSize * this._api_search_searchList.pageNo
                    this._api_search_searchList.pageNo++
                    const list = res.data.productList.filter(item => item.promotionInfo == null && item.stockNum > 0)
                    this._api_search_searchList.list = this._api_search_searchList.list.concat(list)
                    get50()
                }).catch(err => reject(err))
            }
            get50()
        }).then(res => {
            res.list = res.list.map(item => ({
                id: item.mpId,
                name: item.name,
                image: item.picUrl,
                price: Currency.toFixed(item.price),
                originPrice: Currency.toFixed(item.marketPrice)
            }))
            return res
        })

        // 正常逻辑
        // const data = Object.assign({
        //     pageNo: 1,
        //     pageSize: 20,
        //     sortType: 10,
        //     platformId: 3,
        //     navCategoryIds: ''
        // }, options)
        // return Request.request({
        //     url: '/api/search/searchList',
        //     data
        // }).then(res => ({
        //     hasMore: res.data.totalCount > data.pageSize * data.pageNo,
        //     list: res.data.productList.map(item => ({
        //         id: item.mpId,
        //         name: item.name,
        //         image: item.picUrl,
        //         price: Currency.toFixed(item.price),
        //         originPrice: Currency.toFixed(item.marketPrice)
        //     }))
        // }))
    },
    //登陆
    api_ouser_login_loginIn(data = {}) {
        return Request.request({
            url: '/ouser-web/mobileLogin/loginForm.do',
            method: 'POST',
            data
        })
    },
    //注册
    ouser_web_memberRegisterForm_do(data = {}) {
        return Request.request({
            url: '/ouser-web/memberRegisterForm.do',
            method: 'POST',
            data
        })
    },
    //验证手机号是否已经注册
    ouser_web_mobileRegister_isRepeatPhoneForm_do(data = {}) {
        return Request.request({
            url: '/ouser-web/mobileRegister/isRepeatPhoneForm.do',
            method: 'POST',
            data
        })
    },
    api_my_order_cancel(data = {}) {
        return Request.request({
            url: '/api/my/order/cancel',
            data
        })
    },
    api_my_order_delete(data = {}) {
        return Request.request({
            url: '/api/my/order/delete',
            data
        })
    },
    api_my_order_list(options) {
        const data = Object.assign({
            pageNo: 1,
            pageSize: 10
        }, options)
        return Request.request({
            url: '/api/my/order/list',
            data
        }).then(res => ({
            hasMore: res.data.totalCount > data.pageNo * data.pageSize,
            list: (res.data.orderList || []).map(item => ({
                merchantName: item.merchantName,
                orderStatusName: item.orderStatusName,
                totalCount: item.totalCount,
                amount: Currency.toFixed(item.amount),
                paymentAmount: Currency.toFixed(item.paymentAmount),
                orderStatus: item.orderStatus,
                picUrls: item.productList.map(item => item.picUrl).slice(0, 3),
                orderCode: item.orderCode,
                canCancel: item.canCancel,
                canDelete: item.canDelete
            }))
        }))
    },
    api_my_order_detail(options = {}) {
        return Request.request({
            url: '/api/my/order/detail',
            data: Object.assign({
                v: '2.1'
            }, options)
        }).then(({data}) => {
            data.amount = Currency.toFixed(data.amount)
            data.paymentAmount = Currency.toFixed(data.paymentAmount)
            data.productAmount = Currency.toFixed(data.productAmount)
            data.orderDeliveryFeeAccounting = Currency.toFixed(data.orderDeliveryFeeAccounting)
            data.orderPaidByUcard = Currency.toFixed(data.orderPaidByUcard)
            data.orderPaidByCard = Currency.toFixed(data.orderPaidByCard)
            data.orderPaidByCoupon = Currency.toFixed(data.orderPaidByCoupon)
            data.promotionAmount = Currency.toFixed(data.promotionAmount)
            data.childOrderList.forEach(childOrder => {
                childOrder.orderDeliveryFeeAccounting = Currency.toFixed(childOrder.orderDeliveryFeeAccounting)
                childOrder.packageList[0].productList.forEach(product => {
                    product.price = Currency.toFixed(product.price)
                })
            })
            return data
        })
    },
    api_my_order_newOrderMessage(options = {}) {
        return Request.request({
            url: '/api/my/order/newOrderMessage',
            data: options
        }).then(res => res.data)
    },
    api_my_order_delivery(data = {}) {
        return Request.request({
            url: '/api/my/order/delivery',
            data
        })
    },
    //获取验证码
    ouser_web_mobileRegister_sendCaptchasCodeFo(options = {}) {
        return Request.request({
            url: '/ouser-web/mobileRegister/sendCaptchasCodeForm.do',
            method: 'POST',
            data: Object.assign({
                mobile: ''
            }, options)
        })
    },
    //获取订单各状态的数量
    api_my_order_summary(data = {}) {
        return Request.request({
            url: '/api/my/order/summary',
            method: 'GET',
            data
        }).then(res => res.data)
    },
    //获取个人中心的数据
    api_my_user_info(data = {}) {
        return Request.request({
            url: '/api/my/user/info',
            method: 'POST',
            data
        }).then(res => res.data)
    },
    api_cashier_lyfSupportPayment() {
        return Request.request({
            url: '/api/cashier/lyfSupportPayment'
        }).then(res => res.data)
    },
    api_cashier_payByCard(options) {
        return Request.request({
            url: '/api/cashier/payByCard',
            method: 'POST',
            data: Object.assign({
                versionNo: 1,
                payMethod: ''
            }, options)
        }).then(res => res.data)
    },
    ouser_web_address_updateDefaultAddr(options = {}) {
        return Request.request({
            url: '/ouser-web/address/updateDefaultAddr.do',
            method: 'POST',
            data: Object.assign({
                defaultIs: 1
            }, options)
        })
    },
    ouser_web_address_deleteAddressForm(data = {}) {
        return Request.request({
            url: '/ouser-web/address/deleteAddressForm.do',
            method: 'POST',
            data
        })
    },
    api_location_list(options = {}) {
        return Request.request({
            url: `/api/location/list/${options.id || 100000}`
        }).then(res => res.data || [])
    },
    ouser_web_address_updateAddressForm(options = {}) {
        return Request.request({
            url: '/ouser-web/address/updateAddressForm.do',
            method: 'POST',
            data: {
                // 多余的不能提交
                id: options.id,
                userName: options.userName,
                mobile: options.mobile,
                detailAddress: options.detailAddress,
                provinceCode: options.provinceCode,
                cityId: options.cityId,
                regionId: options.regionId,
                defaultIs: options.defaultIs ? 1 : 0
            }
        })
    },
    opay_web_createPay(data = {}) {
        data.money = Number(data.money)
        return Request.request({
            url: '/opay-web/createPay.do',
            data: Object.assign({
                paymentConfigId: 145
            }, data)
        }).then(res => res.data)
    },
    api_checkout_initOrder() {
        return new Promise((resolve, reject) => {
            let error = null
            const initOrder = (data = {}) => {
                Request.request({
                    url: '/api/checkout/initOrder',
                    method: 'POST',
                    data: Object.assign({
                        ignoreChange: 1,
                        platformId: 3
                    }, data)
                })
                    .then(res => {
                        res.data.error = error
                        resolve(res)
                    })
                    .catch(err => {
                        const res = err.detail
                        if (res.code == '10200002') {
                            error = res.data.error
                            error.data = error.data || []
                            if (error.data.length) {
                                initOrder({delMpIds: error.data.map(item => item.id).join(',')})
                            } else {
                                reject(err)
                            }
                        } else {
                            reject(err)
                        }
                    })
            }
            return initOrder()
        }).then(res => this._handleOrder(res))
    },
    /**
     *
     * @param data
     *  points
     * @returns {*}
     */
    api_checkout_savePoints(data = {}) {
        return Request.request({
            url: '/api/checkout/savePoints',
            method: 'POST',
            data
        })
    },
    _handleOrder(res) {
        const data = res.data || {}

        data.points.selected = data.points.isAvailable && data.points.discount > 0
        if (data.points.discount == 0) {
            data.points.discount = data.points.canUseCount / 10
        }
        data.points.discount = Currency.toFixed(data.points.discount)

        data.coupons = data.coupons.filter(coupon => coupon.isAvailable)
        data.coupons.forEach(coupon => coupon.couponValue = Currency.toFixed(coupon.couponValue))
        data.coupons.unshift({couponValue: 0})

        let orderCoupons = data.allCoupon.orderCoupons
        orderCoupons = orderCoupons.filter(orderCoupon => orderCoupon.isAvailable)
        orderCoupons.forEach(orderCoupon => orderCoupon.pickName = `${orderCoupon.themeTitle}（${orderCoupon.moneyRule}）`)
        orderCoupons.unshift({pickName: '不使用优惠券'})
        data.allCoupon.orderCoupons = orderCoupons
        data.allCoupon.activeIndex = orderCoupons.findIndex(orderCoupon => orderCoupon.selected)
        if (data.allCoupon.activeIndex == -1) {
            data.allCoupon.activeIndex = 0
        }

        data.amount = Currency.toFixed(data.amount)
        // data.productAmount = Currency.toFixed(data.productAmount)
        data.totalDeliveryFee = Currency.toFixed(data.totalDeliveryFee)
        // data.promotionSavedAmount = Currency.toFixed(data.promotionSavedAmount)
        data.merchantDeliveryModeList.forEach(merchantDeliveryMode => {
            merchantDeliveryMode.activeIndex = merchantDeliveryMode.deliveryModeList.findIndex(deliveryMode => deliveryMode.isDefault)
        })

        data.merchantList.forEach(merchant => {
            merchant.amount = Currency.toFixed(merchant.amount)
            merchant.productList.forEach(product => {
                product.price = Currency.toFixed(product.price)
            })
        })

        data.orderECard.availableAmount = Currency.toFixed(data.orderECard.availableAmount)
        data.orderUCard.availableAmount = Currency.toFixed(data.orderUCard.availableAmount)

        data.expenseList.forEach(expense => expense.value = Currency.toFixed(expense.value))
        return data
    },
    /**
     * @param data
     *  deliveryModeCodeChecked
     */
    api_checkout_saveDeliveryMode(data) {
        return Request.request({
            url: '/api/checkout/saveDeliveryMode',
            method: 'POST',
            data
        })
    },
    api_checkout_saveCoupon(data = {}) {
        return Request.request({
            url: '/api/checkout/saveCoupon',
            method: 'POST',
            data
        })
    },
    api_checkout_showOrder() {
        return Request.request({
            url: '/api/checkout/showOrder',
            method: 'POST',
            data: {
                platformId: 3
            }
        }).then(res => this._handleOrder(res))
    },
    ouser_web_address_addAddressForm(options = {}) {
        return Request.request({
            url: '/ouser-web/address/addAddressForm.do',
            method: 'POST',
            data: {
                // 多余的不能提交
                userName: options.userName,
                mobile: options.mobile,
                detailAddress: options.detailAddress,
                provinceCode: options.provinceCode,
                cityId: options.cityId,
                regionId: options.regionId,
                defaultIs: options.defaultIs ? 1 : 0
            }
        })
    },
    /**
     *
     * @param data
     *  remark
     *  id
     */
    api_checkout_saveRemark(data) {
        return Request.request({
            url: '/api/checkout/saveRemark',
            method: 'POST',
            data
        })
    },
    api_checkout_submitOrder() {
        return Request.request({
            url: '/api/checkout/submitOrder',
            method: 'POST'
        }).then(res => res.data)
    },
    ouser_web_address_getAllAddressForm() {
        return Request.request({
            url: '/ouser-web/address/getAllAddressForm.do',
            method: 'POST'
        }).then(res => res.data)
    },
    //钱包的数据
    api_my_wallet_summary(options = {}) {
        return Request.request({
            url: '/api/my/wallet/summary',
            method: 'GET',
            data: Object.assign({
                platformId: 3,
                isECard: 1,
                isYCard: 1,
                isBean: 1,
                isCoupon: 1,
                isPoint: 1
            }, options)
        }).then(res => res.data)
    },
    /**
     *
     * @param data
     *  receiverId
     */
    api_checkout_saveReceiver(data = {}) {
        return Request.request({
            url: '/api/checkout/saveReceiver',
            method: 'POST',
            data
        })
    },
    //商品相关数据
    api_product_baseInfo(data = {}) {
        return Request.request({
            url: '/api/product/baseInfo',
            method: 'GET',
            data
        }).then(res => {
            const data = res.data
            data.forEach(item => {
                item.subTitle  = item.subTitle || ''
            })
            return data
        })
    },
    //商品相关数据
    api_product_desc(options = {}) {
        return Request.request({
            url: '/api/product/desc',
            method: 'GET',
            data: Object.assign({
                platformId: 3
            }, options)
        }).then(res => {
            const pattern = /src="(.*?)"/ig
            const array = []
            while (pattern.exec(res) != null) {
                array.push(RegExp.$1)
            }
            return array
        })
    },
    //购物车中商品数量
    api_cart_count(data = {}) {
        return Request.request({
            url: '/api/cart/count',
            method: 'POST',
            data
        }).then(res => res.data)
    },
    //加入购物车
    api_cart_addItem(options = {}) {
        return Request.request({
            url: '/api/cart/addItem',
            method: 'POST',
            data: Object.assign({
                num: 1
            }, options)
        }).then(res => res.data)
    },
    //购物车中商品列表
    api_cart_list(options = {}) {
        return Request.request({
            url: '/api/cart/list',
            method: 'POST',
            data: Object.assign({
                v: 1.2
            }, options)
        }).then(res => {
            const data = res.data
            data.summary = data.summary || {}
            data.merchantList = data.merchantList || []
            data.failureProducts = data.failureProducts || []
            return data
        })
    },
    api_checkout_saveUCard(data = {}) {
        return Request.request({
            url: '/api/checkout/saveUCard',
            method: 'POST',
            data
        })
    },
    //清除失效商品
    api_cart_clearFailure(data = {}) {
        return Request.request({
            url: '/api/cart/clearFailure',
            method: 'POST',
            data
        }).then(res => res.data)
    },
    //批量删除购物车中商品
    api_cart_removeItemBatch(data = {}) {
        return Request.request({
            url: '/api/cart/removeItemBatch',
            method: 'POST',
            data
        }).then(res => res.data)
    },
    //删除购物车中某个商品
    api_cart_removeItem(data = {}) {
        return Request.request({
            url: '/api/cart/removeItem',
            method: 'POST',
            data
        }).then(res => res.data)
    },
    //修改购物车商品选中状态
    api_cart_editItemCheck(data = {}) {
        return Request.request({
            url: '/api/cart/editItemCheck',
            method: 'POST',
            data
        }).then(res => res.data)
    },
    api_cart_editItemNum(data = {}) {
        return Request.request({
            url: '/api/cart/editItemNum',
            method: 'POST',
            data
        })
    },
    //购物车商品数量
    api_cart_count(data = {}) {
        return Request.request({
            url: '/api/cart/count',
            method: 'POST',
            data
        }).then(res => res.data)
    },
    //清空购物车
    api_cart_clear(data = {}) {
        return Request.request({
            url: '/api/cart/clear',
            method: 'POST',
            data
        }).then(res => res.data)
    },
    //绑定优惠券
    api_my_coupon_bindCoupon(data = {}) {
        return Request.request({
            url: '/api/my/coupon/bindCoupon',
            method: 'POST',
            data
        }).then(res => res.data)
    },
    //我的优惠券
    api_my_coupon(data) {
        return Request.request({
            url: '/api/my/coupon',
            data
        }).then(res => {
            if (data.couponStatus == 1) {
                return {
                    list: (res.data.canUseCouponList || []).map(item => ({
                        couponValue: item.couponValue,
                        themeTitle: item.themeTitle,
                        endTime: DateFormatter.format(item.endTime),
                        themeDesc: item.themeDesc
                    }))
                }
            } else if (data.couponStatus == 2) {
                return {
                    list: (res.data.usedCouponList || []).map(item => ({
                        couponValue: item.couponValue,
                        themeTitle: item.themeTitle,
                        endTime: DateFormatter.format(item.endTime),
                        themeDesc: item.themeDesc
                    }))
                }

            } else if (data.couponStatus == 3) {
                return {
                    list: (res.data.expiredCouponList || []).map(item => ({
                        couponValue: item.couponValue,
                        themeTitle: item.themeTitle,
                        endTime: DateFormatter.format(item.endTime),
                        themeDesc: item.themeDesc
                    }))
                }

            } else if (data.couponStatus == 4) {
                return {
                    list: (res.data.shareCouponList || []).map(item => ({
                        couponValue: item.couponValue,
                        themeTitle: item.themeTitle,
                        endTime: DateFormatter.format(item.endTime),
                        themeDesc: item.themeDesc
                    }))
                }
            }

        })
    },

}