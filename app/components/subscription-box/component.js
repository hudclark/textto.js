import Ember from 'ember'

export default Ember.Component.extend({

    classNames: ['subscription-box'],
    classNameBindings: ['completed', 'error'],

    api: Ember.inject.service(),

    async subscribe (email) {
        this.set('isLoading', true)
        try {
            const startTime = new Date().getTime()
            await this.get('api').request('/subscriptions',
                {method: 'POST', contentType: 'application/json', data: JSON.stringify({email: email})})
            const endTime = new Date().getTime()
            // Pretend to take longer...
            if (endTime - startTime < 500) {
                setTimeout(() => this.onSubscribed(), 1000 - (endTime - startTime))
            } else {
                this.onSubscribed()
            }
        } catch (err) {
            this.onFailed()
        }
    },

    onSubscribed () {
        // TODO animate and shit
        this.set('isLoading', false)
        this.set('completed', true)
        this.sendAction('on-completed', this.get('email'))
    },

    onFailed (err) {
        this.set('isLoading', false)
        this.set('error', true)
        setTimeout(() => this.set('error', false), 1000)
    },

    actions: {

        submit () {
            if (this.get('isLoading') || this.get('completed')) return
            this.subscribe(this.get('email'))
        }

    }


})