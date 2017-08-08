import Address from '../../service/Address'

Page({
    data: {
        form: {},
        region: [0, 0, 0],
        regionSelected: false,
        regionArray: [[], [], []],
    },
    onLoad() {
        const {type, form} = this._query
        wx.setNavigationBarTitle({title: type == 'edit' ? '编辑收货地址' : '新增收货地址'})
        if (type == 'edit') {
            this.editCount = 0
            this.setData({
                regionSelected: true,
                form: JSON.parse(form)
            })
        }
        this.regionArray2 = [[], [], []]
        this.getLocationList(0)
    },
    getLocationList(column, id) {
        if (column > 2) {
            return
        }
        for (let i = column + 1; i < 3; i++) {
            this.regionArray2[i] = []
        }
        Address.getLocationList({id}).then(res => {
            this.regionArray2[column] = res
            const regionArray = this.data.regionArray
            regionArray[column] = res.map(item => item.name)
            this.setData({regionArray})
            const {form, region} = this.data
            if (this.editCount < 3) { // 控制进来自动选中的
                this.editCount++
                const code = [form.provinceCode, form.cityCode, form.regionCode][column]
                region[column] = res.findIndex(item => item.code == code)
                this.setData({region})
                this.getLocationList(column + 1, code)
            } else {
                const re = this.regionArray2[column][region[column]]
                if (re) {
                    this.getLocationList(column + 1, re.code)
                }
            }
        })
    },
    tapSave() {
        const type = this._query.type
        const {form, region} = this.data
        const {regionArray2} = this
        form.provinceCode = regionArray2[0][region[0]].id
        form.cityId = regionArray2[1][region[1]].id
        form.regionId = regionArray2[2][region[2]].id
        if (type == 'edit') {
            Address.edit(form)
        } else {
            Address.add(form)
        }
    },
    inputUserName(event) {
        this.setData({'form.userName': event.detail.value})
    },
    inputMobile(event) {
        this.setData({'form.mobile': event.detail.value})
    },
    inputDetailAddress(event) {
        this.setData({'form.detailAddress': event.detail.value})
    },
    changeDefaultIs(event) {
        this.setData({'form.defaultIs': event.detail.value})
    },
    changeRegion(event) {
        this.setData({
            region: event.detail.value,
            regionSelected: true,
        })
    },
    changeRegionColumn(event) {
        const {column, value} = event.detail
        const {region} = this.data
        region[column] = value
        this.setData({region})
        this.getLocationList(column + 1, this.regionArray2[column][value].code)
    }
})