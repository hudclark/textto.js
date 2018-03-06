import Ember from 'ember'

export default Ember.Component.extend({

    api: Ember.inject.service(),
    bus: Ember.inject.service(),

    classNames: ['modal', 'upload-modal'],

    sendDisabled: true,

    didInsertElement () {
        this._super(...arguments)
        this.get('bus').register(this)

        // Was this created with a file?
        if (this.get('data.file')) {
            this.setFile(this.get('data.file'))
        }

        Ember.run.scheduleOnce('afterRender', this, () => {
            $('.modal').modal({
                complete: () => {
                    this.get('bus').post('closeModal')
                }
            })
            $('.modal').modal('open')
        })
    },

    willDestoryElement () {
        this._super(...arguments)
        this.get('bus').unregister(this)
    },

    setFile (file) {

        // validate file
        if (!this.isValidContentType(file.type)) {
            this.set('error', 'Invalid file type.')
            return
        }

        this.set('file', file)
        if (!file) return
        const reader = new FileReader()
        reader.addEventListener('load', () => {
            this.set('preview', reader.result)
            this.set('sendDisabled', false)
        })
        reader.readAsDataURL(file)
    },

    isValidContentType (ct) {
        return (
            ct === 'image/png' ||
            ct === 'image/gif' ||
            ct === 'image/jpeg' ||
            ct === 'image/jpg'
        )
    },

    actions: {

        selectImage () {
            this.set('preview', null)
            this.set('sendDisabled', true)
            const file = $('#fileupload')[0].files[0]
            this.setFile(file)
        },

        async send () {
            this.set('error', null)
            try {
                const file = this.get('file')
                if (!file) return
                this.set('isSending', true)
                const fileUrls = await this.get('api').getUploadImageUrl()
                const opts = {
                    type: 'PUT',
                    processData: false,
                    data: file,
                    contentType: file.type
                }
                await Ember.$.ajax(fileUrls.url, opts)
                const now = (new Date()).getTime()
                const scheduledMessage = {
                    threadId: this.get('data.threadId'),
                    uuid: now,
                    filename: fileUrls.filename
                }
                await this.get('api').sendScheduledMessage(scheduledMessage)
                this.set('isSending', false)
                $('.modal').modal('close')
            } catch (err) {
                this.set('isSending', false)
                const errMsg = (err.message) ? err.message : err
                this.set('error', errMsg)
            }
        }

    }
})