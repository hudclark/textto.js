import Ember from 'ember';

export default Ember.Route.extend({

    auth: Ember.inject.service(),

    beforeModel() {
        if (this.get('auth').isLoggedIn()) {
            this.replaceWith('threads');
        }
    },

    actions: {

        onLogin() {
            console.log('test');
            this.transitionTo('threads');
        }

    }

});