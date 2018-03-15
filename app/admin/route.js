import Ember from 'ember';
import BaseRoute from 'textto/application/base-route'

export default BaseRoute.extend({

    api: Ember.inject.service(),

    model () {
        return this.get('api').getDailyStats()
    },

    actions: {


        startCleaning() {
            this.get('api').startCleaning()
                .then((response) => {
                    this.controllerFor('admin').set('response', JSON.stringify(response))
                })
        },

        stopCleaning () {
            this.get('api').stopCleaning()
                .then((response) => {
                    this.controllerFor('admin').set('response', JSON.stringify(response))
                })
        }

    }

})