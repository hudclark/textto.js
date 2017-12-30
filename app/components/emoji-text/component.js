import Ember from 'ember';

export default Ember.Component.extend({

    classNames: ['emoji-text'],

    didReceiveAttrs () {
        this._super(...arguments)
        if (this.get('content')) {
            const dirty = this.get('content')
            let clean = DOMPurify.sanitize(dirty)
            if (this.get('linkify')) {
                clean = Autolinker.link(clean)
            }
            this.set('text', twemoji.parse(clean))
        } else {
            this.set('text', '')
        }
    },

});