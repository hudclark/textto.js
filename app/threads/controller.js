import Ember from 'ember';
import RecipientListHelper from '../helpers/recipient-list'

export default Ember.Controller.extend({

    activeThread: null,
    activeThreadTitle: Ember.computed('activeThread.contact.name', function() {
        return twemoji.parse(this.get('activeThread.contact.name'));
    }),

    actions: {

        onThreadSelected (thread) {
            this.set('activeThread', thread)
            $('send-box').focus();
            this.send('setPageTitle', RecipientListHelper.compute(null, thread))
        },

        goHome () {
            this.transitionToRoute('index')
        }

    }

});