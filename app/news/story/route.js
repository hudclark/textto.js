import BaseRoute from 'textto/application/base-route'

export default BaseRoute.extend({

    api: Ember.inject.service(),

    model (params) {
        return this.get('api').getNewsStory(params.story)
    },

    afterModel (model) {
        this.set('title', model.title + ' | Textto')
        this._super(...arguments)
    }

})
