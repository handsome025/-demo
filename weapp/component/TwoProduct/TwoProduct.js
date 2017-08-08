import Shopcart from '../../service/Shopcart'

export default {
    _components: ['GoodsPic'],
    TwoProductTapShopcart(event) {
        const {id} = event.currentTarget.dataset
        Shopcart.addToCart({mpId:id})
    }
}