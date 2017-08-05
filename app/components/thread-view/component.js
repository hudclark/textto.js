import Ember from 'ember';

export default Ember.Component.extend({

    tagName: 'thread-view',
    classNameBindings: ['thread.active:active'],

    name: Ember.computed('thread.contact.name', function() {
        return twemoji.parse(this.get('thread.contact.name'));
    }),

    snippet: Ember.computed('thread.snippet', function() {
        return twemoji.parse(this.get('thread.snippet'));
    }),

    click() {
        this.sendAction('onClick', this.get('thread.androidId'));
    }

});