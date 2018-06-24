import Ember from 'ember'

export default Ember.Component.extend({

    classNames: ['error-view'],

    displayText: Ember.computed('error', function () {
        let error = this.get('error')
        if (error == null) return null
        if (error.responseJSON) error = error.responseJSON

        let errorText = 'Please try again or contact help@moduloapps.com'
        if (error.error) errorText = error.error
        else if (error.message) errorText = error.message
        return 'An error occured: ' + errorText
    })

})