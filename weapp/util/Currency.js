/**
 * 货币操作
 */
export default {
    /**
     * 人民币分转元 带逗号分隔
     *
     * @param {Number|String} value 分字符串或数字
     * @returns {Number|String} 成功返回元 保留两位小数, 失败返回'--'
     */
    fenToYuan(value) {
        value = Number(value)
        if (isNaN(value)) {
            return '--'
        }
        value = (value / 100).toFixed(2)
        if (Math.abs(value) < 1000) {
            return value
        }
        return value.replace(/./g, (c, i, a) => i && c !== '.' && !((a.length - i) % 3) ? ',' + c : c)
    },
    toFixed(value) {
        try {
            value = Number(value)
            if (!isNaN(value)) {
                return value.toFixed(2)
            }
        } catch (e) {}
        return '--'
    }
}