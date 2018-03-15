import Ember from 'ember';

export default Ember.Component.extend({

    auth: Ember.inject.service(),
    encryption: Ember.inject.service(),

    async didInsertElement () {
        this._super(...arguments)

    },

    actions: {

        async login() {
            this.set('error', false)
            this.set('isLoading', true);
            try {
                await this.get('auth').signIn()
                const encryption = this.get('encryption')
                await encryption.finishInit()

                if (!encryption.enabled()) {
                    this.set('showEncryptionSetup', true)
                } else {
                    this.sendAction('on-login');
                }

            } catch (err) {
                console.log('error logging in');
                console.log(err);
                console.error('Error logging in')
                console.error(err) // won't get stripped in production
                this.set('error', true)
            }
            this.set('isLoading', false);
        },

        finish () {
            this.sendAction('on-login');
        }


    }
});