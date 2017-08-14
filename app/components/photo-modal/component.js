import Ember from 'ember';

export default Ember.Component.extend({

    bus: Ember.inject.service(),

    tagName: 'photo-modal',

    actions: {

        close() {
            this.get('bus').post('closeModal');
        }

    }

});