import Ember from 'ember';

export default Ember.Component.extend({

    tagName: 'nav-bar',
    bus: Ember.inject.service(),

    didInsertElement() {
        Ember.run.scheduleOnce('afterRender', this, function () {
            $('.hamburger').sideNav()
        })
    },

    actions: {

        openSendModal: function () {
            const modal = {
                componentName: 'send-modal',
                data: null
            }
            this.get('bus').post('openModal', modal)
        },

        goHome: function () {
            this.sendAction('go-home')
        }
    }

});