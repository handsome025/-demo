import Shopcart from '../../service/Shopcart'

export default {
    _components: ['GoodsPic'],
    OneProductTapShopCart(event) {
        const {id} = event.currentTarget.dataset
        Shopcart.addToCart({mpId:id})
    }
}