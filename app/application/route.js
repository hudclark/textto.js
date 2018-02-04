import Ember from 'ember'

export default Ember.Route.extend({
    auth: Ember.inject.service(),
    theme: Ember.inject.service(),

    redirect () {
        this.get('theme')

        // If logged in, go straight to /threads
        const path = window.location.pathname
        if ((path === '/' || path === '/no-messages') && this.get('auth').isLoggedIn()) {
            this.transitionTo('threads')
        }
    }
})