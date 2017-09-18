import Ember from 'ember';

export default Ember.Component.extend({

    tagName: 'contact-picture',

    didReceiveAttrs() {
        this._super(...arguments);
        this.set('image', null);
        this.set('text', null);

        const length = this.get('length')
        if (length > 1) {
            this.set('text', length)
            return
        }

        const contact = (this.get('contacts')) ? this.get('contacts')[0] : this.get('contact')

        if (!contact) {
            this.set('text', '#')
        } else if (contact.image) {
            this.set('image', contact.image)
        } else if (contact.name) {
            let parts = contact.name.split(' ')
            let text = parts[0].charAt(0).toUpperCase()
            if (parts.length > 1) {
                text += parts[1].charAt(0).toUpperCase()
            }
            this.set('text', text)
        } else {
            this.set('text', '#');
        }
    }

})