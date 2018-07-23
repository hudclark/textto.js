import BaseRoute from 'textto/application/base-route'

export default BaseRoute.extend({

    title: 'Log In | SendLeap',
    description: 'Log in and sync your Android device with SendLeap.',

    auth: Ember.inject.service(),

    beforeModel() {
        if (this.get('auth').isLoggedIn()) {
            this.replaceWith('threads');
        }
    },

    resetController (controller, isExiting, transition) {
         if (isExiting) {
             controller.set('redirect', null)
         }
    },

    actions: {

        openIndex () {
            this.transitionTo('index')
        }

    }

});