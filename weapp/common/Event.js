import EventProxy from '../vendor/EventProxy'

const ep = new EventProxy()

ep.LOGIN_SUCCESS = 'login_success'

ep.ORDER_CANCEL = 'order_cancel'
ep.ORDER_DELETE = 'order_delete'
ep.ORDER_TIMEOUT = 'order_timeout'
ep.ORDER_ERROR = 'order_error'
ep.ORDER_SUBMIT = 'order_submit'
ep.ORDER_PAY = 'order_pay'

ep.ADDRESS_DELETE = 'address_delete'
ep.ADDRESS_ADD = 'address_add'
ep.ADDRESS_EDIT = 'address_edit'
ep.ADDRESS_CHOOSE = 'address_choose'

ep.CART_ADD = 'cart_add'
ep.CART_EDIT = 'cart_edit'
ep.CART_UNCHECKALL = 'cart_uncheckall'

export default ep