import Paging from '../../common/Paging'
import Laiyifen from '../../service/Laiyifen'
import File from '../../service/File'

Page({
    _components: ['TwoProduct', 'MoreTip', 'Swiper'],
    data: {
        hasMore: true,
        isGet: false,
        bannerList: [{}],
        productList: []
    },
    onLoad() {
        wx.setNavigationBarTitle({title: this._query.name})
        this.getData()
    },
    getData() {
        this.Swiper('bannerList', [
            {image: File.getUrl(`/static/category/category-${this._query.index}.jpg`)}
        ])
        this.goodsPaging = new Paging()
        this.getGoods()
    },
    getGoods() {
        return this.goodsPaging.getList(Laiyifen.api_search_searchList.bind(Laiyifen), {navCategoryIds: this._query.id})
            .then(res => {
                this.TwoProduct('productList', this.data.productList.concat(res.list))
                this.setData({
                    hasMore: res.hasMore,
                    isGet: true
                })
            })
    },
    onReachBottom() {
        this.getGoods()
    }
})