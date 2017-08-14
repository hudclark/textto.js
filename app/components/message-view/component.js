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
    })

});