import Ember from 'ember';

export default Ember.Route.extend({

    auth: Ember.inject.service(),

    beforeModel() {
        // this is a protected route.
        if (!this.get('auth').isLoggedIn()) {
            return this.replaceWith('login');
        }
    },

    setupController (controller, model) {
        controller.load();
    }



});