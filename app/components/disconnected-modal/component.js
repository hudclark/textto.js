import Ember from 'ember'

export default Ember.Component.extend({

    classNames: ['disconnected-modal'],

    api: Ember.inject.service(),
    bus: Ember.inject.service(),

    didInsertElement () {
        this._super(...arguments)
        this.connectionInterval = setInterval(() => {
            this.ping()
        }, 5000)
    },

    willDestroyElement () {
        this._super(...arguments)
        clearInterval(this.connectionInterval)
    },

    ping () {
        return this.get('api').ping()
            .then(() => {
                console.log('reconnected')
                this.get('bus').post('reconnectedToNetwork')
            }).catch()
    },

    actions: {

        async reconnect () {
            this.set('isLoading', true)
            await this.ping()
            this.set('isLoading', false)
        }

    }

})