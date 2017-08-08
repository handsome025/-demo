export default {
    NumberBoxInit(options = {}) {
        let {key, data} = options
        data = Object.assign({
            value: 1,
            min: 1,
            max: 99999
        }, data)
        data.value = Math.min(data.value, data.max)
        this.setData({
            [key]: {
                key: key,
                value: data.value,
                min: data.min,
                max: data.max,
                leftDisabled: data.value <= data.min,
                rightDisabled: data.value >= data.max,
                id: data.id
            }
        })
    },
    NumberBoxTapLeft(event) {
        const {key} = event.currentTarget.dataset
        const data = this._getData(key)
        let {value, leftDisabled, rightDisabled, min} = data
        if (value <= min) {
            return
        }
        value--
        this.setData({
            [`${key}.value`]: value,
            [`${key}.leftDisabled`]: value <= min,
            [`${key}.rightDisabled`]: false
        })
        this._event.emit('NumberBox:change', data)
    },
    NumberBoxTapRight(event) {
        const {key} = event.currentTarget.dataset
        const data = this._getData(key)
        let {value, leftDisabled, rightDisabled, max} = data
        if (value >= max) {
            return
        }
        value++
        this.setData({
            [`${key}.value`]: value,
            [`${key}.leftDisabled`]: false,
            [`${key}.rightDisabled`]: value >= max
        })
        this._event.emit('NumberBox:change', data)
    }
}