import Ember from 'ember'
import BaseRoute from 'textto/application/base-route'

export default BaseRoute.extend({

    title: 'Settings | Textto',
    protected: true,

    api: Ember.inject.service(),

    model () {
        return this.get('api').getAppData()
    }


})