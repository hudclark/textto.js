import Ember from 'ember'

export default Ember.Component.extend({

    bus: Ember.inject.service(),
    auth: Ember.inject.service(),
    notifications: Ember.inject.service(),
    classNames: ['modal', 'no-messages-modal'],

    didInsertElement () {
        this._super(...arguments)
        this.get('bus').register(this)
        Ember.run.scheduleOnce('afterRender', this, () => {
            $('.modal').modal({
            })
            this.$().modal({
                dismissible: false,
                complete: () => {
                    this.get('bus').post('closeModal')
                }
            })
            this.$().modal('open')
        })
    },

    willDestoryElement () {
        this._super(...arguments)
        this.get('bus').unregister(this)
    },

    onStartInitialSync () {
        this.set('isSyncing', true)
        this.get('notifications').disable()
    },

    onEndInitialSync () {
        this.get('notifications').enable()
        this.close()
    },

    close () {
        $('.modal').modal('close')
        this.get('bus').post('closeModal')
    },

    // TODO add an event for onBulkThreadInsert

    actions: {

        logOut () {
            this.close()
            this.get('auth').logOut()
        }

    }


})