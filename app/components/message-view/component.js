import Ember from 'ember';

export default Ember.Component.extend({

    tagName: 'message-view',
    classNameBindings: ['received'],

    body: Ember.computed('message.body', function() {
        return twemoji.parse(this.get('message.body'));
    }),

    received: Ember.computed('message', function () {
        let message = this.get('message');
        return (message.status === 'received');
    })

});