import Ember from 'ember';

export default Ember.Component.extend({

    tagName: 'message-view',
    classNameBindings: ['received'],

    received: Ember.computed('message', function () {
        let message = this.get('message');
        return (message.status === 'received');
    })

});