import Ember from 'ember'

export default Ember.Component.extend({

    classNames: ['phone-input'],
    classNameBindings: ['completed', 'error'],

    api: Ember.inject.service(),

    async submit (address) {
        this.set('isLoading', true)
        try {
            const startTime = new Date().getTime()

            const response = await this.get('api').textAppLink(address)

            const endTime = new Date().getTime()
            // Pretend to take longer...
            if (endTime - startTime < 500) {
                setTimeout(() => this.onSubscribed(), 1000 - (endTime - startTime))
            } else {
                this.onEntered()
            }
        } catch (err) {
            this.onFailed()
        }
    },

    onEntered () {
        // TODO animate and shit
        this.set('isLoading', false)
        this.set('completed', true)
        this.sendAction('on-completed', this.get('number'))
    },

    onFailed (err) {
        this.set('isLoading', false)
        this.set('error', true)
        setTimeout(() => this.set('error', false), 1000)
    },

    actions: {

        submit () {
            if (this.get('isLoading') || this.get('completed')) return
            this.submit(this.get('number'))
        }

    }


})