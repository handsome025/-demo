const DAY_OF_SECONDS = 60 * 60 * 24
const HOUR_OF_SECONDS = 60 * 60
const MINUTES_OF_SECONDS = 60

export default {
    /**
     * 标准格式化
     *
     * @param date
     * @returns {String}
     * @example 2000-02-02 02:02:02
     */
    format(date) {
        if (!(date instanceof Date)) {
            date = new Date(date)
        }
        const f2 = value => ('00' + value).slice(-2)
        return `${date.getFullYear()}-${f2(date.getMonth() + 1)}-${f2(date.getDate())} ${f2(date.getHours())}:${f2(date.getMinutes())}:${f2(date.getSeconds())}`
    },
    formatDjs(src, target) {
        if (!(src instanceof Date)) {
            src = new Date(src)
        }
        if (!(target instanceof Date)) {
            target = new Date(target)
        }
        let totalSeconds = Math.floor((target.getTime() - src.getTime()) / 1000)
        if (totalSeconds < 0) {
            totalSeconds = 0
        }
        let day = Math.floor(totalSeconds / DAY_OF_SECONDS)
        let hour = Math.floor((totalSeconds - day * DAY_OF_SECONDS) / HOUR_OF_SECONDS)
        let minutes = Math.floor((totalSeconds - day * DAY_OF_SECONDS - hour * HOUR_OF_SECONDS) / MINUTES_OF_SECONDS)
        let seconds = Math.floor(totalSeconds - day * DAY_OF_SECONDS - hour * HOUR_OF_SECONDS - minutes * MINUTES_OF_SECONDS)
        day = ('00' + day).slice(-2)
        hour = ('00' + hour).slice(-2)
        minutes = ('00' + minutes).slice(-2)
        seconds = ('00' + seconds).slice(-2)
        return {
            number: totalSeconds,
            string: `${day}天${hour}时${minutes}分${seconds}秒`
        }
    }
}