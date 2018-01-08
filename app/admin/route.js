import Ember from 'ember';
import BaseRoute from 'textto/application/base-route'

export default BaseRoute.extend({

    api: Ember.inject.service(),

    model () {
        return this.get('api').getDailyStats()
    }

})