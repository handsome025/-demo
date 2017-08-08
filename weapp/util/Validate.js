/**
 * 表单验证
 */
export default {
    /**
     * 是否为空
     *
     * @param value
     * @returns {boolean}
     */
    isEmpty(value) {
        return value == null || !String(value).trim()
    },
    /**
     * 是否为手机号码
     *
     * @param value
     * @returns {boolean}
     */
    isPhoneNumber(value) {
        return /^1\d{10}$/.test(value)
    },
    /**
     * 是否为邮编
     *
     * @param value
     * @returns {boolean}
     */
    isPostalCode(value) {
        return /^\d{6}$/.test(value)
    },
    /**
     * 获取字符串的字节长度
     *
     * @param {String} value
     * @returns {Number}
     */
    getByteLength(value) {
        return value ? String(value).replace(/[^\x00-\xff]/g, '**').length : 0
    }
}