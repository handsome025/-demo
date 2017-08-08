import Modal from '../../common/Modal'
import Paging from '../../common/Paging'
import Laiyifen from '../../service/Laiyifen'

Page({
    _components: ['Swiper', 'OneProduct', 'TwoProduct', 'MoreTip', 'GoodsPic'],
    data: {
        hasMore: true,
        bannerList: [{}],
        productList: [],
        categoryList: new Array(10).fill({})
    },
    onLoad() {
       this.getData()
    },
    getData() {
        this.goodsPaging = new Paging()
        Laiyifen.cms_page_getAppHomePage()
            .then(({banner, goods}) => {
                this.getBanner(banner)
                this.getCategory()
                // 清空商品列表数据，重新加载
                this.setData({productList: []})
                this.goods = goods
                this.getGoods()
            })
    },
    onPullDownRefresh() {
        this.getData()
    },
    onReachBottom() {
        this.getGoods()
    },
    getBanner(options) {
        Laiyifen.api_dolphin_list({pageCode: options.pageCode, adCode: options.ad_code})
            .then(res => this.Swiper('bannerList', res))
    },
    getCategory() {
        Laiyifen.api_category_list()
            .then(categoryList => this.setData({categoryList}))
    },
    getGoods() {
        const moduleId = this.goods.moduleId
        if (!moduleId) {
            return
        }
        this.goodsPaging.getList(Laiyifen.cms_page_module_getModuleData.bind(Laiyifen), {moduleId})
            .then(goods => {
                this.OneProduct('productList', this.data.productList.concat(goods.list))
                this.setData({hasMore: goods.hasMore})
            })
            .finally(() => Modal.hideLoading())
    }
})
