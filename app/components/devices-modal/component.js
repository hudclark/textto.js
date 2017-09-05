import Ember from 'ember'

export default Ember.Component.extend({

    api: Ember.inject.service(),
    bus: Ember.inject.service(),

    classNames: ['modal', 'devices-modal'],

    async init () {
        this._super(...arguments)
        const tokens = await this.get('api').getRefreshTokens()
        this.set('refreshTokens', tokens)
    },

    didInsertElement () {
        this._super(...arguments)
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

        revokeToken (token) {
            this.get('api').revokeRefreshToken(token._id)
            this.get('refreshTokens').removeObject(token)
        }

    }


})