
export default Ember.Helper.helper(function(params, hash) {
    const time = params[0]

    const date = new Date(time)

    return (date.getMonth() + 1) + '/' + date.getDate() + '  ' + date.toLocaleTimeString()
})