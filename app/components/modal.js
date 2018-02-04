import Ember from 'ember'

export default Ember.Component.extend({
    bus: Ember.inject.service(),

    classNames: ['modal', 'color-primary'],

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

    willDestoryElement () {
        this._super(...arguments)
        this.get('bus').unregister(this)
    },

    close () {
        $('.modal').close()
    }


})