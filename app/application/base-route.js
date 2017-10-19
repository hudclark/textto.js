import Ember from 'ember'

export default Ember.Route.extend({

    setMeta: Ember.on('activate', function () {
        const title = this.title || 'Textto | Text From Your Computer'
        const description = this.description || 'Sync your Android device with Textto and text for free with the website and cross platform desktop applications.'
        document.title = title
        $('meta[name=description]').attr('content', description)
    }),

    actions: {

        setPageTitle (text) {
            document.title = text + ' | Textto'
        }

    }

})