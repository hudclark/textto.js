import Ember from 'ember'

export default Ember.Component.extend({

    api: Ember.inject.service(),
    bus: Ember.inject.service(),

    classNames: ['modal', 'upload-modal'],

    sendDisabled: true,

    didInsertElement () {
        this._super(...arguments)
        this.get('bus').register(this)
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

    actions: {

        async upload () {
            this.set('preview', null)
            this.set('sendDisabled', true)
            this.set('error', null)
            this.set('filename', null)
            try {
                const file = $('#fileupload')[0].files[0]
                if (!file) return
                this.set('isLoading', true)
                const fileUrls = await this.get('api').getUploadImageUrl()
                const opts = {
                    type: 'PUT',
                    processData: false,
                    data: file
                }
                await Ember.$.ajax(fileUrls.url, opts)
                const reader = new FileReader()
                this.set('filename', fileUrls.filename)
                reader.addEventListener('load', () => {
                    this.set('preview', reader.result)
                    this.set('isLoading', false)
                    this.set('sendDisabled', false)
                }, false)
                reader.readAsDataURL(file)
            } catch (err) {
                this.set('isLoading', false)
                const errMsg = (err.message) ? err.message : err
                this.set('error', errMsg)
            }
        },

        send () {
            if (!this.get('filename') || !this.get('data.threadId')) return
            this.set('isSending', true)
            this.set('error', null)
            const now = (new Date()).getTime()
            const scheduledMessage = {
                threadId: this.get('data.threadId'),
                uuid: now,
                filename: this.get('filename')
            }
            this.get('api').sendScheduledMessage(scheduledMessage)
                .then( () => {
                    this.set('isSending', false)
                    $('.modal').modal('close')
                }).catch((err) => {
                    this.set('error', err.message)
                    this.set('isSending', false)
                })
        }

    }

})