import Ember from 'ember'

export default Ember.Helper.helper(function(params, hash) {
    return params[0].join(', ')
})