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
            this.transitionTo('threads');
        },

        openIndex () {
            this.transitionTo('index')
        }

    }

});