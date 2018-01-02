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
            const delay = (this.get('mms') || this.get('message.fileUrl')) ? 800 : 50
            setTimeout(() => this.animateDown(), delay)
        }
    },

    animateDown () {
        if (this.isDestroyed || this.isDestroying) return
        const amount = this.get('isScheduled') ? $('.messages')[0].scrollHeight :
                                                 `+=${this.$().outerHeight(true)}px`
        $('.messages').animate({
            scrollTop: amount
        }, 200)
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
        },

        onLoad () {
            console.log('image loaded')
        }



    }
});