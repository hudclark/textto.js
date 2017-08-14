import Ember from 'ember'

export default Ember.Helper.helper(function(params, hash) {
    const array = params[0]
    const index = params[1]
    if (index === array.length - 1) return false
    const first = array[index]
    const second = array[index + 1]
    const difference = first.date - second.date
    return (difference > 1000 * 60  * 15)
})