/**
 * 查询字符串
 */
export default {
    /**
     * 序列化
     *
     * @param {Object} query
     * @returns {String}
     */
    stringify(query = {}) {
        return Object.keys(query)
            .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(query[key]))
            .join('&')
    },
    /**
     * 反序列化
     *
     * @param {String} queryString
     * @returns {Object}
     */
    parse(queryString = '') {
        const query = {}
        queryString.split('&').forEach(keyValue => {
            const [key, value] = keyValue.split('=')
            query[decodeURIComponent(key)] = decodeURIComponent(value)
        })
        return query
    }
}