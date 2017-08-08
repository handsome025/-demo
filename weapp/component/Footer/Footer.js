import User from '../../service/User'

export default {
    addToCart(event){
    	const {id} = event.currentTarget.dataset
        User.addToCart({id})
    }
}