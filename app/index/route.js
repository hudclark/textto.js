import Ember from 'ember'

export default Ember.Route.extend({

    unregister: Ember.on('deactivate', function () {
        this.stopScrollListener()
    }),

    scrollFire (elements) {
        const $window = $(window)
        const windowHeight = $window.height()

        $window.on('scroll.appearing', () => {
            this.didScroll = true
        })

        this.scrollInterval = setInterval(() => {
            if (!this.didScroll) return
            this.didScroll = false
            const scrolledElements = elements.filter(e => {
                const offset = e.width() / 2
                const pos = $window.scrollTop() - e.position().top + windowHeight
                return (pos > offset)
            })
            scrolledElements.forEach (e => {
                e.addClass('visible')
                elements.removeObject(e)
            })
            if (elements.length === 0) {
                this.stopScrollListener()
            }
        }, 100)
    },

    stopScrollListener () {
        $(window).off('scroll.appearing')
        clearInterval(this.scrollInterval)
    },

    actions: {

        openWeb () {
            this.transitionTo('threads')
        },

        scrollDown () {
            $(window).scrollTop($(window).height())
        },

        didTransition () {
            Ember.run.scheduleOnce('afterRender', this, function () {
                const selector = $('.appearing')
                const elements = []
                for (let i = 0; i < selector.length; i++) {
                    elements.push(selector.eq(i))
                }
                this.scrollFire(elements)
            })
        }
    }

})