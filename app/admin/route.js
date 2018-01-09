import Ember from 'ember';
import BaseRoute from 'textto/application/base-route'

export default BaseRoute.extend({

    api: Ember.inject.service(),

    model () {
        return this.get('api').getDailyStats()
    },

    actions: {


        cleanMessages() {
            this.get('api').cleanMessages()
                .then((response) => {
                    this.controllerFor('admin').set('response', JSON.stringify(response))
                })
        },

        cleanThreads () {
            this.get('api').cleanThreads()
                .then((response) => {
                    this.controllerFor('admin').set('response', JSON.stringify(response))
                })
        }

    }

})