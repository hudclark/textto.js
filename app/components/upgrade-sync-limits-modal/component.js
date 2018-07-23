import Ember from 'ember'

export default Ember.Component.extend({

    classNames: ['modal', 'upgrade-sync-limits', 'remove-ads-modal'],

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

        async upgrade () {

            const msg =
                "Please make sure you upgraded to SendLeap for Android v1.3.3. If you are on an earlier version, old conversations will NOT be retroactively synced."

            if (!confirm(msg)) {
                return
            }

            this.set('isLoading', true)
            try {
                await this.get('payment').upgradeSyncLimits()
                this.set('upgraded', true)
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