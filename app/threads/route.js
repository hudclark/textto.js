import Ember from 'ember';

export default Ember.Route.extend({

    auth: Ember.inject.service(),
    websocket: Ember.inject.service(),
    bus: Ember.inject.service(),

    register: Ember.on('activate', function () {
        this.get('bus').register(this);
        this.connectionTimeout = setInterval(() => {
            this.get('websocket').ensureConnected()
        }, 5000)
    }),

    unregister: Ember.on('deactivate', function () {
        this.get('bus').unregister(this);
        clearInterval(this.connectionTimeout)
    }),

    beforeModel() {
        // this is a protected route.
        if (!this.get('auth').isLoggedIn()) {
            return this.replaceWith('login');
        } else {
            this.get('websocket').ensureConnected(true);
        }
    },

    onWebsocketConnectionLost() {
        // TODO here should load error route.
        this.transitionTo('error');
    }


});