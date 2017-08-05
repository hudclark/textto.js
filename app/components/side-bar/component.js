import Ember from 'ember';

export default Ember.Component.extend({

    tagName: 'side-bar',

    sortedThreads: Ember.computed.sort('threads.[]', 'ordering'),
    ordering: ['last:desc'],

    actions: {

        onThreadClick(threadId) {
            this.sendAction('onThreadClick', threadId);
        }

    }

});