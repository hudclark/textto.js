import Ember from 'ember';

export default Ember.Component.extend({

    tagName: 'thread-view',
    classNameBindings: ['thread.active:active'],

    click () {
        this.sendAction('onClick', this.get('thread'))
    }

});