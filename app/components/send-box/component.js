import Ember from 'ember';

export default Ember.Component.extend({

    tagName: 'send-box',
    attributeBindings: ['contenteditable'],
    contenteditable: 'true',

    keyDown (e) {
        // enter pressed
        if (e.keyCode == 13) {
            let el = this.$()[0];
            this.sendAction('on-send', el.textContent);
            el.textContent = '';
            return false;
        }
    }

});