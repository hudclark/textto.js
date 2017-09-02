import Ember from 'ember'

export default Ember.Helper.helper( function (params) {
    const contact = params[0]
    return (contact.name) ? contact.name : contact.address
})