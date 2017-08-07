import Ember from 'ember';

export default Ember.Component.extend({

    isImage: Ember.computed('part.contentType', function() {
        return this.get('part.contentType').includes('image');
    }),

    isPlainText: Ember.computed('part.contentType', function() {
        return this.get('part.contentType') === "text/plain";
    }),

    actions: {

        toggleImage() {
            let image = this.$('.mms-image');
        }

    }

});