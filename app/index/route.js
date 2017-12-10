import BaseRoute from 'textto/application/base-route'

export default BaseRoute.extend({

    redirect () {
        if (window.ELECTRON) {
            return this.transitionTo('threads')
        }
    },

    unregister: Ember.on('deactivate', function () {
        $().stopScrollIn()
    }),

    actions: {

        openWeb () {
            this.transitionTo('threads')
        },

        scrollDown () {
            $('html').animate({scrollTop: $(window).height()})
        },

        onSubscribed (email) {
            this.controllerFor('index').set('subscribed', true)
            this.controllerFor('index').set('email', email)
        },

        didTransition () {
            Ember.run.scheduleOnce('afterRender', this, function () {
                $('.appearing').scrollIn()
            })
        }
    }

})