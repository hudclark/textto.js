import Ember from 'ember'

export default Ember.Component.extend({

    api: Ember.inject.service(),
    bus: Ember.inject.service(),
    encryption: Ember.inject.service(),

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

    async setFile (file) {

        // validate file
        if (!this.isValidContentType(file.type)) {
            this.set('error', 'Invalid file type.')
            return
        }

        this.set('file', file)
        if (!file) return

        const result = await this.readFile(file, 'dataUrl')
        this.set('preview', result)
        this.set('sendDisabled', false)
    },

    isValidContentType (ct) {
        return (
            ct === 'image/png' ||
            ct === 'image/gif' ||
            ct === 'image/jpeg' ||
            ct === 'image/jpg'
        )
    },

    readFile (file, format) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result)
            if (format == 'dataUrl') reader.readAsDataURL(file)
            else if (format == 'arrayBuffer') reader.readAsArrayBuffer(file)
            else reject('Inavlid format.')
        })
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
                    //data: file,
                }


                const encryption = this.get('encryption')
                if (encryption.enabled()) {
                    const plainBytes = await this.readFile(file, 'arrayBuffer')
                    const imageString = 'data:' + file.type + ';base64,' + encryption._bufferToBase64(new Uint8Array( plainBytes))
                    const cipherBytes = await encryption.encrypt(imageString)
                    opts.data = cipherBytes
                    opts.contentType = 'text/plain; charset=utf-8'
                } else {
                    opts.data = file
                    opts.contentType = file.type
                }

                await Ember.$.ajax(fileUrls.url, opts)
                const now = (new Date()).getTime()
                const scheduledMessage = {
                    threadId: this.get('data.threadId'),
                    uuid: now,
                    filename: fileUrls.filename,
                    encrypted: encryption.enabled()
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