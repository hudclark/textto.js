import Ember from 'ember';

export default Ember.Component.extend({

    tagName: 'login-view',

    auth: Ember.inject.service(),

    actions: {

        async login() {
            this.set('error', false)
            this.set('isLoading', true);
            try {
                await this.get('auth').signIn()
                this.sendAction('on-login');
            } catch (err) {
                console.log('error logging in');
                console.log(err);
                this.set('error', true)
            }
            this.set('isLoading', false);
        }

    }
});