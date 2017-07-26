import Ember from 'ember';

export default Ember.Component.extend({

    tagName: 'contact-picture',

    didReceiveAttrs() {
        this._super(...arguments);
        this.set('image', null);
        this.set('text', null);
        let contact = this.get('contact');
        if (contact) {
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
        this.set('text', '#');
    },


    actions: {

    }



});