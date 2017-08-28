import Ember from 'ember'

export default Ember.Helper.helper(function(params, hash) {
    const date = Number(params[0])
    let time = new Date(date)
    const year = ("" + time.getFullYear()).substr(2)

    // minutes
    const mm = time.getMinutes()
    const minute = (mm < 10) ? '0' + mm : mm

    // hours
    let hour = time.getHours()
    let amPm = (hour < 12) ? "AM" : "PM"
    if (hour > 12) {
        hour = hour - 12
    }

    return [(time.getMonth() + 1), time.getDate(), year].join('/') +
        ' ' + hour + ':' + minute + ' ' + amPm
})