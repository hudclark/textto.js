import Ember from 'ember';

export default Ember.Controller.extend({

    activeThread: null,
    activeThreadTitle: Ember.computed('activeThread.contact.name', function() {
        return twemoji.parse(this.get('activeThread.contact.name'));
    }),

    actions: {

        onThreadSelected(thread) {
            this.set('activeThread', thread)
            $('send-box').focus();
        },

    }

});