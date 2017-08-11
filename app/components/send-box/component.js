import Ember from 'ember';

export default Ember.Component.extend({

    tagName: 'send-box',
    attributeBindings: ['contenteditable', 'autofocus', 'placeholder'],
    contenteditable: 'true',
    autofocus: 'autofocus',
    placeholder: Ember.computed('to', function () {
        let to = this.get('to');
        if (to) {
            return 'Message ' + this.get('to') + '...';
        } else {
            return 'Send a message...';
        }
    }),

    keyDown (e) {
        // enter pressed
        if (e.keyCode == 13) {
            let el = this.$()[0];
            if (el.textContent.length > 0) {
                this.sendAction('on-send', el.textContent);
                el.textContent = '';
            }
            return false;
        }
    }

});