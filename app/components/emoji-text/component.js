import Ember from 'ember';

export default Ember.Component.extend({

    text: Ember.computed('content', function() {
        if (this.get('content')) {
            const dirty = this.get('content')
            const clean = DOMPurify.sanitize(dirty)
            return twemoji.parse(clean);
        } else {
            return "";
        }
    })
});