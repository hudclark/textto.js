import Ember from 'ember';
import BaseRoute from 'textto/application/base-route'

export default BaseRoute.extend({

    title: 'Threads | Textto',

    auth: Ember.inject.service(),
    websocket: Ember.inject.service(),
    bus: Ember.inject.service(),
    api: Ember.inject.service(),

    register: Ember.on('activate', function () {
        this.get('bus').register(this)
        this.get('websocket').connect()
    }),

    unregister: Ember.on('deactivate', function () {
        this.get('bus').unregister(this);
        this.get('websocket').close()
    }),

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
        this.get('websocket').close()
        const modal = {
            componentName: 'disconnected-modal',
            data: null
        }
        this.get('bus').post('openModal', modal)
    },

    onReconnectedToNetwork () {
        this.get('bus').post('closeModal')
        this.get('websocket').connect()
    },

    onLogout () {
        this.controllerFor('threads').set('activeThread', null)
        this.transitionTo('login')
    },

});