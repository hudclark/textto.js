import Ember from 'ember';

export default Ember.Component.extend({

    bus: Ember.inject.service(),

    isImage: Ember.computed('part.contentType', function() {
        return this.get('part.contentType').includes('image');
    }),

    isPlainText: Ember.computed('part.contentType', function() {
        return this.get('part.contentType') === "text/plain";
    }),

    actions: {

        openImage() {
            let modal = {
                componentName: 'photo-modal',
                data: this.get('part.data')
            };
            this.get('bus').post('openModal', modal);
        }

    }

});