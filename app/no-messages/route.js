import BaseRoute from 'textto/application/base-route'

export default BaseRoute.extend({

    title: 'No Messages | SendLeap',
    bus: Ember.inject.service(),
    websocket: Ember.inject.service(),
    auth: Ember.inject.service(),

    register: Ember.on('activate', function () {
        this.get('bus').register(this)
        this.get('websocket').connect()
    }),

    unregister: Ember.on('deactivate', function () {
        this.get('bus').unregister(this);
        this.get('websocket').close()
    }),

    onStartInitialSync () {
        console.log('Starting initial sync')
        this.controllerFor('no-messages').set('isSyncing', true)
    },

    onEndInitialSync () {
        console.log('Ending initial sync')
        window.location.href = '/threads'
    },

    onLogout () {
        this.transitionTo('login')
    },

    actions: {

        logOut () {
            this.get('auth').logOut()
        }

    }

})