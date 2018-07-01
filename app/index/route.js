import BaseRoute from 'textto/application/base-route'

export default BaseRoute.extend({

    redirect (e) {
        if (window.ELECTRON) {
            return this.transitionTo('threads')
        }
    },

    register: Ember.on('activate', function () {
        this.navInterval = setInterval(() => {
            const scrolledToTop = $(window).scrollTop() < 5
            if (this.isNavTransparent && !scrolledToTop) {
                $('.nav-bar').toggleClass('transparent')
                this.isNavTransparent = false
            } else if (!this.isNavTransparent && scrolledToTop) {
                $('.nav-bar').toggleClass('transparent')
                this.isNavTransparent = true
            }
        }, 500)
        this.isNavTransparent = true
    }),

    unregister: Ember.on('deactivate', function () {
        $().stopScrollIn()
        clearInterval(this.navInterval)
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