import Ember from 'ember';

export default Ember.Component.extend({

    tagName: 'thread-view',
    classNameBindings: ['thread.active:active'],

    click (e) {
        if (this.$('.material-icons.cancel')[0] === e.target) {
            this.sendAction('delete', this.get('thread'))
        } else {
            this.sendAction('onClick', this.get('thread'))
        }
    }

});