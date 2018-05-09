import Ember from 'ember'

export default Ember.Controller.extend({

    api: Ember.inject.service(),


    actions: {

        async syncOldThreads () {
            this.set('syncingOldThreads', true)
            this.get('api').syncOldThreads()
            setTimeout(() => {
                this.set('syncingOldThreads', false)
            }, 30000)
        }

    }

})