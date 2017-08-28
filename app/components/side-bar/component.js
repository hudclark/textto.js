import Ember from 'ember';

export default Ember.Component.extend({

    tagName: 'side-bar',

    actions: {

        onThreadClick(threadId) {
            this.sendAction('onThreadClick', threadId);
        }

    }

});