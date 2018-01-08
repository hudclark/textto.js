import BaseRoute from 'textto/application/base-route'

export default BaseRoute.extend({

    auth: Ember.inject.service(),

    redirect () {
        if (window.ELECTRON) {
            return this.transitionTo('threads')
        }
        // If logged in, go straight to /threads
        if (this.get('auth').isLoggedIn()) {
            this.transitionTo('threads')
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

                const options = {}
                const isMobile = ($(window).width() < 600)
                if (isMobile) {
                    options.delayFactor = 0.5
                    options.durationFactor = 0.8
                    options.percentageVisible = 0.1
                    options.movementFactor = .5
                }

                // if ($(window).width() < 600) {
                //     $('.appearing').css('opacity', 1)
                // } else {
                $('.appearing').scrollIn(options)
                //}
            })
        }
    }

})