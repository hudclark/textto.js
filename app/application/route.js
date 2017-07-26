import Ember from 'ember';

export default Ember.Route.extend({

    auth: Ember.inject.service(),

    beforeModel() {
        // subscrible to logOut events.
        this.get('auth').addOnLogOutListener(this);
    },

    onLogOut() {
        this.transitionTo('login');
    }


});