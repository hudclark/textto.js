import Ember from 'ember';

export default Ember.Component.extend({

    tagName: 'contact-picture',

    didReceiveAttrs() {
        this._super(...arguments);
        this.set('image', null);
        this.set('text', null);
        let contacts = this.get('contacts');
        if (contacts.length == 1) {
            let contact = contacts[0];
            if (contact.image) {
                this.set('image', contact.image);
                return;
            } else if (contact.name) {
                let parts = contact.name.split(' ');
                let text = parts[0].charAt(0).toUpperCase();
                if (parts.length > 1) {
                    text += parts[1].charAt(0).toUpperCase();
                }
                this.set('text', text);
                return;
            }
        }
        if (this.get('length') == 1) {
            this.set('text', '#');
        } else {
            this.set('text', this.get('length'));
        }
    },


    actions: {

    }



});