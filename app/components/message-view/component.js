import Ember from 'ember';

export default Ember.Component.extend({

    tagName: 'message-view',
    classNameBindings: ['received', 'hidden', 'animated'],
    api: Ember.inject.service(),

    animated: Ember.computed('message', function () {
        return this.get('message.animated')
    }),

    received: Ember.computed('message', function () {
        let message = this.get('message');
        return (message.sender !== 'me');
    }),

    isLoading: Ember.computed('message', function () {
        const message = this.get('message')
        if (!this.get('isScheduled')) return false
        if (message.failed || message.sent) return false
        return true
    }),

    didRender: function () {
        this._super(...arguments)
        if (this.get('message.failed')) {
            $('.dropdown-button').dropdown({belowOrigin: true, alignment: 'right'})
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