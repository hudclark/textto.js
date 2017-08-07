import Ember from 'ember';

export default Ember.Component.extend({

    

    text: Ember.computed('content', function() {
        if (this.get('content')) {
            return twemoji.parse(this.get('content'));
        } else {
            return "";
        }
    })
});