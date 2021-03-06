import Ember from 'ember';
import BaseRoute from 'textto/application/base-route'

export default BaseRoute.extend({

    title: 'Threads | SendLeap',

    auth: Ember.inject.service(),
    websocket: Ember.inject.service(),
    bus: Ember.inject.service(),
    api: Ember.inject.service(),
    notifications: Ember.inject.service(),
    protected: true,

    hasMoved: false,

    register: Ember.on('activate', function () {
        console.log('Register')
        this.get('bus').register(this)
        this.get('websocket').connect()
        this.get('notifications').askPermission()
    }),

    unregister: Ember.on('deactivate', function () {
        this.get('bus').unregister(this);
        this.get('websocket').close()
    }),


    model () {
        return this.get('api').getAppData()
            .catch(e => this.transitionTo('login'))
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

    actions: {


        noMessages () {
            this.transitionTo('no-messages')
        },

        transitionToPath (path) {
            this.transitionTo(path)
        }

    }

});