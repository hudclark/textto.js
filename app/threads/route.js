import Ember from 'ember';

export default Ember.Route.extend({

    auth: Ember.inject.service(),
    websocket: Ember.inject.service(),
    bus: Ember.inject.service(),
    api: Ember.inject.service(),

    register: Ember.on('activate', function () {
        this.get('bus').register(this)
        this.get('websocket').ensureConnected()
    }),

    unregister: Ember.on('deactivate', function () {
        this.get('bus').unregister(this);
        this.get('websockets').close()
    }),

    startConnectionInterval () {
        this.connectionTimeout = setInterval(() => {
            this.get('websocket').ensureConnected()
        }, 5000)
    },

    stopConnectionInterval() {
        console.log('Stopping connection interval')
        clearInterval(this.connectionTimeout)
    },

    beforeModel() {
        // this is a protected route.
        if (!this.get('auth').isLoggedIn()) {
            return this.replaceWith('login');
        } else {
        }
    },

    onWebsocketConnectionLost() {
        this.onLostConnection()
    },

    onLostConnection () {
        console.log('Lost connection')
        this.stopConnectionInterval()
        this.get('websocket').close()
        const modal = {
            componentName: 'disconnected-modal',
            data: null
        }
        this.get('bus').post('openModal', modal)
    },

    onReconnectedToNetwork () {
        this.get('bus').post('closeModal')
        this.get('websocket').ensureConnected()
        this.startConnectionInterval()
    }

});