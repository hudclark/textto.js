import Ember from 'ember'

export default Ember.Route.extend({

    auth: Ember.inject.service(),

    setMeta () {
        const title = this.title || 'SendLeap | Text From Your Computer'
        const description = this.description || 'Sync your Android device with SendLeap and text from your computer for free!'
        document.title = title
        $('meta[name=description]').attr('content', description)
    },

    afterModel () {
        this.setMeta()
    },

    redirect () {
        if (this.get('protected') && !this.get('auth').isLoggedIn()) {
            this.replaceWith('login')
        }
    },

    actions: {

        setPageTitle (text) {
            document.title = text + ' | SendLeap'
        }

    }

})