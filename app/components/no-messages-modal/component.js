import Ember from 'ember'

export default Ember.Component.extend({

    bus: Ember.inject.service(),
    auth: Ember.inject.service(),
    classNames: ['modal', 'no-messages-modal'],

    didInsertElement () {
        this._super(...arguments)
        this.get('bus').register(this)
        Ember.run.scheduleOnce('afterRender', this, () => {
            $('.modal').modal({
            })
            //$('.modal').modal('open')``
            // TODO
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

    onNewThread (paylaod) {
        // TODO done here
        $('.modal').modal('close')
    },

    onNewMessages (payload) {
        // TODO done here
        $('.modal').modal('close')
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