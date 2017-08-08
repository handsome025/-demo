import Laiyifen from './Laiyifen'
import Modal from '../common/Modal'

export default {
    getDetail(data = {}) {
        return Laiyifen.api_product_baseInfo(data)
            .catch(err => Modal.showError(err))
    },
    getDesc(data = {}) {
        return Laiyifen.api_product_desc(data)
            // .catch(err => Modal.showError(err))
    }
}