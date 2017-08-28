import Ember from 'ember';

export default Ember.Component.extend({

    bus: Ember.inject.service(),
    api: Ember.inject.service(),

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
                this.sendMessage(el.textContent)
                el.textContent = '';
            }
            return false;
        }
    },

    sendMessage (body) {
        const now = (new Date()).getTime()
        let scheduledMessage = {
            body: body,
            threadId: this.get('threadId'),
            uuid: now
        }
        this.get('api').sendScheduledMessage(scheduledMessage)
        scheduledMessage.uuid = "" + scheduledMessage.uuid // using biginteger
        this.get('bus').post('newScheduledMessage', {scheduledMessage: scheduledMessage})
    }

})