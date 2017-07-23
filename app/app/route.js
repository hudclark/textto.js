import Ember from 'ember';

export default Ember.Route.extend({

    api: Ember.inject.service(),

    model() {
        console.log("Testing...");

        return 'hi';
    }

});