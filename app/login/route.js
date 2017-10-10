import ApplicationRoute from 'textto/application/route'

export default ApplicationRoute.extend({

    title: 'Log In | Textto',
    description: 'Log in and sync your Android device with Textto.',

    auth: Ember.inject.service(),

    beforeModel() {
        if (this.get('auth').isLoggedIn()) {
            this.replaceWith('threads');
        }
    },

    actions: {

        onLogin() {
            this.transitionTo('threads');
        },

        openIndex () {
            this.transitionTo('index')
        }

    }

});