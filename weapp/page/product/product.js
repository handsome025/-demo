import Product from '../../service/Product'
import Currency from '../../util/Currency'
import Event from '../../common/Event'
import User from '../../service/User'
import Shopcart from '../../service/Shopcart'

Page({
    _components: ['Swiper', 'GoodsPic'],
    data: {
        pics: [{}],
        baseInfo: {},
        desc: [],
        tab: 1,
        footer: {},
    },
    onLoad() {
        const {id} = this._query
        // Event.on(Event.cartNum,()=>{
        // 	console.log(11111);
        // 	this.setData({cartNum:this.data.cartNum++})
        // })
        //   Event.on(Event.cartNum, () => this.getCartCount(id))

        this.getProductDetail(id)
        this.getProductDesc(id)
        this.getCartCount(id)

    },
    getProductDetail(id) {
        Product.getDetail({mpId: id})
            .then(([res]) => {
                const info = {
                    mpId: res.mpId,
                    name: res.name,
                    price: Currency.toFixed(res.price),
                    stockNum: res.stockNum,
                    subTitle: res.subTitle,
                    volume4sale: res.volume4sale
                }
                //设置页面标题
                wx.setNavigationBarTitle({
                    title: res.name
                })
                this.setData({baseInfo: info})
                this.Swiper('pics', res.pics.map(p => ({image: p.url})))
            })
    },
    getProductDesc(id) {
        Product.getDesc({mpId: id})
            .then(res => this.setData({desc: res}))
    },
    switchTab(event) {
        const {index} = event.currentTarget.dataset
        this.setData({tab: index})
    },
    getCartCount(id) {
        Shopcart.getCount({mpId: id}).then(res => {
            this.setData({
                footer: {
                    id,
                    number: res
                }
            })
        })
    },
    addToCart(event) {
        const {id, number} = event.currentTarget.dataset
        Shopcart.addToCart({mpId: id})
        this.setData({
            footer: {
                id,
                number: number + 1
            }
        })
    }
})