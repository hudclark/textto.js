import Ember from 'ember'

export default Ember.Component.extend({

    classNames: ['donation-card'],
    payment: Ember.inject.service(),

    actions: {
        async donate (amount) {
            this.set('isLoading', true)
            this.set('error', null)
            try {
                await this.get('payment').createDonation(amount)
                this.set('donated', true)
            } catch (e) {
                this.set('error', e)
            }
            this.set('isLoading', false)
        }
    }

})