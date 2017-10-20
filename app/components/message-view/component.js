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
            $('.messages').animate({
                scrollTop: `+=${this.$().outerHeight(true)}px`
            }, 100)
        }
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