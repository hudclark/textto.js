import Ember from 'ember'

export default Ember.Route.extend({
    auth: Ember.inject.service(),

    redirect () {
        // If logged in, go straight to /threads
        const path = window.location.pathname
        if (path !== '/admin' && this.get('auth').isLoggedIn()) {
            this.transitionTo('threads')
        }
    }
})