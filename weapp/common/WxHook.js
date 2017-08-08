import EventProxy from '../vendor/EventProxy'

function NOOP() {}
const PROP_COMPONENT = '_components'

/**
 * 微信API提供的功能 无法满足需求
 *
 *
 * 新增属性
 * _event: EventProxy 用于组件与组件、组件与页面通信
 * _data: Object 保存原始的data对象 用于需要时重置数据
 * _components: Array<string> 用于自动挂载组件方法到页面实例上
 *
 * 新增方法
 * _getData(namespace: string): any 根据命名空间字符串获取数据
 *
 * 重写方法
 * onLoad(query: Object) 自动设置this._query = query
 */
function hookPage() {
    const _Page = Page

    Page = opts => {
        const _onLoad = opts.onLoad || NOOP
        opts._event = new EventProxy()
        opts._data = Object.assign({}, opts.data)

        opts.onLoad = function (query) {
            const newQuery = {}
            Object.keys(query).forEach(key => newQuery[decodeURIComponent(key)] = decodeURIComponent(query[key]))
            this._query = newQuery
            return _onLoad.call(this, newQuery)
        }

        if (Array.isArray(opts[PROP_COMPONENT])) {
            addMethods(opts[PROP_COMPONENT])

            function addMethods(components) {
                components.forEach(component => {
                    const Component = require(`../component/${component}/${component}`)['default']
                    Component[component] = function (a, b) {
                        if (b) {
                            this.setData({
                                [a]: b.map((item, index) => {
                                    item.key = `${a}[${index}]`
                                    return item
                                })
                            })
                        } else {
                            Object.keys(a).forEach(key => {
                                a[key]['key'] = key
                            })
                            this.setData(a)
                        }
                    }
                    Object.keys(Component).forEach(method => {
                        if (method == PROP_COMPONENT) {
                            Component[method].forEach(componentName => opts[method].push(componentName))
                        } else {
                            opts[method] = Component[method]
                        }
                    })
                    // 组件嵌套依赖
                    if (Array.isArray(Component[PROP_COMPONENT])) {
                        addMethods(Component[PROP_COMPONENT])
                    }
                })
            }
        }

        opts._getData = function (namespace) {
            let data = this.data
            if (!namespace) {
                return data
            }
            namespace = namespace.split('.')
            while (namespace.length) {
                let ns = namespace.shift()
                ns = ns.match(/^(.*?)(?:\[(.*?)\])?$/)
                if (ns) {
                    data = data[ns[1]]
                    if (ns[2]) {
                        data = data[ns[2]]
                    }
                } else {
                    data = data[ns]
                }
            }
            return data
        }

        return _Page(opts)
    }
}

function promiseAddFinally() {
    Promise.prototype.finally = function (fn) {
        function finFn() {
            setTimeout(fn)
        }

        this.then(finFn, finFn)
        return this
    }
}

hookPage()
promiseAddFinally()