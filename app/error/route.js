import Ember from 'ember';

export default Ember.Route.extend({

    timeout: null,
    pingInterval: 5 * 1000,

    startPinging: Ember.on('activate', function () {

    }),

    deactivate: Ember.on('deactivate', function () {
        this.stopPinging();
    }),

    stopPinging () {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
    }



});