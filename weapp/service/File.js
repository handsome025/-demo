import Config from '../common/Config'

export default {
    getUrl(path) {
        return `http://170717fg0279${Config.isProd ? '' : '.dev'}.umaman.com${path}`
    }
}