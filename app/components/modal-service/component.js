import Ember from 'ember';

export default Ember.Component.extend({


    bus: Ember.inject.service(),

    modalComponent: null,
    modalData: null,

    didInsertElement() {
        this._super(...arguments);
        this.get('bus').register(this);
    },

    willDestroyElement() {
        this._super(...arguments);
        this.get('bus').unregister(this);
    },

    onOpenModal(modal) {
        this.set('currentModal', modal);
    },

    onCloseModal() {
        this.set('currentModal', null);
    }

});