import Ember from 'ember';

export default Ember.Component.extend({

    tagName: 'message-view',
    classNameBindings: ['received'],

    mms: Ember.computed('message', function() {
        return this.get('message.type') === "mms";
    }),

    received: Ember.computed('message', function () {
        let message = this.get('message');
        return (message.sender !== 'me');
    }),

    isLoading: Ember.computed('message', function () {
        if (!this.get('isScheduled')) return false
        const message = this.get('message')
        if (message.failed) return false
        return true
    })

});