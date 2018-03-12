import Ember from 'ember';

export default Ember.Component.extend({

    tagName: 'mms-part',

    isImage: Ember.computed('part.contentType', function() {
        return this.get('part.contentType').includes('image');
    }),

    isPlainText: Ember.computed('part.contentType', function() {
        return this.get('part.contentType') === "text/plain";
    }),

    sender: Ember.computed('message', function () {
        const message = this.get('message')
        if (message.sender !== 'me' && message.addresses.length > 1) {
            return (message.contact && message.contact.name) ? message.contact.name : message.sender
        }
    }),

})