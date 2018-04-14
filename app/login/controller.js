import Ember from 'ember'

export default Ember.Controller.extend({

    queryParams: ['redirect'],

    redirect: null,

    actions: {

        onLogin () {
            const redirect = this.get('redirect')
            if (redirect != null && redirect.length > 0) {
                this.transitionToRoute(redirect)
            } else {
                this.transitionToRoute('threads')
            }
        }

    }

})