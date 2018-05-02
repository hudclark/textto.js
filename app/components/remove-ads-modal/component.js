import Ember from 'ember'

export default Ember.Component.extend({

    classNames: ['modal', 'remove-ads-modal'],

    payment: Ember.inject.service(),
    bus: Ember.inject.service(),


    removed: false,

    didInsertElement () {
        this._super(...arguments)
        this.get('bus').register(this)
        Ember.run.scheduleOnce('afterRender', this, () => {
            $('.modal').modal({
                complete: () => {
                    this.get('bus').post('closeModal')
                }
            })
            $('.modal').modal('open')
        })
    },

    actions: {

        async removeAds () {
            this.set('isLoading', true)
            try {
                await this.get('payment').removeAds()
                this.set('removed', true)
                setTimeout(() => {
                    window.location.reload()
                }, 1000)
            } catch (e) {
                console.error(e)
                this.set('error', e)
            }
            this.set('isLoading', false)
        }

    }

})