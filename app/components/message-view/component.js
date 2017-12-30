import Ember from 'ember';

export default Ember.Component.extend({

    tagName: 'message-view',
    classNameBindings: ['received', 'hidden'],
    api: Ember.inject.service(),

    isLoading: Ember.computed('message', function () {
        const message = this.get('message')
        if (!this.get('isScheduled')) return false
        if (message.failed) return false
        return true
    }),

    isSingleEmoji: Ember.computed('message', function () {
        const text = this.get('message.body')
        if (!text) return false
        return !(/[0-9a-zA-Z]/g.test(text))
    }),

    didReceiveAttrs () {
        this._super(...arguments)

        const message = this.get('message')
        const received = (!this.get('isScheduled') && (message.sender !== 'me'))
        this.set('received', received)
        this.set('mms', (message.type === 'mms'))
    },

    didRender: function () {
        this._super(...arguments)
        if (this.get('message.failed')) {
            $('.dropdown-button').dropdown({belowOrigin: true, alignment: 'right'})
        }
        if (this.get('message.animated')) {
            if (this.get('mms') || this.get('message.fileUrl')) {
                setTimeout(() => {
                    if (!(this.isDestroyed || this.isDestroying)) this.animateDown()
                }, 800) // wait for image to render...
            } else {
                this.animateDown()
            }
        }
    },

    animateDown () {
        const amount = this.get('isScheduled') ? $('.messages')[0].scrollHeight :
                                                 `+=${this.$().outerHeight(true)}px`
        $('.messages').animate({
            scrollTop: amount
        }, 100)
    },

    actions: {

        retry: function () {
            this.set('isLoading', true)
            this.get('api').retryFailedMessage(this.get('message._id'))
            this.set('message.failed', false)
        },

        delete: function () {
            this.get('api').deleteFailedMessage(this.get('message._id'))
            this.set('hidden', true)
        }

    }
});