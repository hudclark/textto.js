import Ember from 'ember'

export default Ember.Helper.helper(function(params, hash) {
    const array = params[0]
    const index = params[1]
    if (index === 0) return false

    const first = array[index]
    const second = array[index - 1]

    const difference = first.date - second.date
    console.log('Diff between ' + first.body + ' and ' + second.body)
    console.log(difference)
    return (difference > 1000 * 60  * 20)
})