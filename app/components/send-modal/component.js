import Ember from 'ember'

export default Ember.Component.extend({

    api: Ember.inject.service(),
    bus: Ember.inject.service(),

    classNames: ['modal', 'send-modal'],
    searchTerm: '',
    message: '',

    didInsertElement () {
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

    sendDisabled: Ember.computed('message', 'to', function () {
        return !(this.get('to.length') && this.get('message.length'))
    }),

    validateAddress(address) {
        return /^(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?$/.test(address)
    },

    updateTo () {
        $('#to').css('padding-left', $('.to-names').width() + 6)
    },

    onUpdateScheduledMessage (payload) {
        if (!this.get('isLoading')) return
        const scheduledMessage = payload.scheduledMessage
        if (scheduledMessage.uuid !== this.get('scheduledMessage.uuid')) return
        if (scheduledMessage.failed) {
            this.get('api').deleteFailedMessage(scheduledMessage._id)
                .then(() => {
                    this.set('error', 'Unable to send message. Try again in a minute.')
                    this.set('isLoading', false)
                }).catch((e) => {
                    this.set('error', e)
                    this.set('isLoading', false)
                })
        }
    },

    onNewMessage (payload) {
        if (!this.get('isLoading')) return
        const message = payload.message
        const addresses = this.get('scheduledMessage.addresses')
        if (message.addresses.find(a => (!addresses.includes(a)))) return
        if (this.get('scheduledMessage.body').includes(message.body)) {
            this.set('isLoading', false)
            setTimeout(() => {
                this.get('bus').post('selectThread', message.threadId)
                $('.modal').modal('close')
            }, 500)
        }
    },

    actions: {

        select (contact) {
            if (!this.get('to')) this.set('to', [])
            let to = this.get('to')
            if (to.find(c => (c.address === contact.address))) {
                this.set('searchTerm', null)
                this.set('searchResults', null)
                $('#to').focus()
                this.willDelete = true
                return
            }
            to.pushObject(contact)
            this.set('searchResults', null)
            $('#to').focus()

            setTimeout(() => {
                this.set('searchTerm', null)
                this.updateTo()
                this.willDelete = true
            }, 0)
        },

        remove (contact) {
            this.get('to').removeObject(contact)
        },
        
        send () {
            if (this.get('sendDisabled')) return
            this.set('error', null)
            this.set('isLoading', true)

            const addresses = this.get('to').map(c => c.address)
            const message = this.get('message')
            const scheduledMessage = {
                body: message,
                addresses: addresses,
                uuid: (new Date()).getTime()
            }

            this.get('api').sendScheduledMessage(scheduledMessage)
                .then((response) => {
                    this.set('scheduledMessage', response.scheduledMessage)
                })
        },

        async keyUp (e) {
            const query = this.get('searchTerm')
            if (e.keyCode === 8 && !query) {
                if (this.willDelete) {
                    let to = this.get('to')
                    if (to.length) to.removeAt(to.length - 1)
                    setTimeout(() => {
                        this.updateTo()
                    }, 0)
                }
                this.willDelete = true
                return
            }
            this.willDelete = false // non empty query
            if (query && query.length > 1) {
                let results = await this.get('api').searchContacts(query)
                if (query.length > 6 && this.validateAddress(query)) {
                    results.push({address: query})
                }
                if (results.length > 3) {
                    results = results.slice(0, 4)
                }
                this.set('searchResults', results)
            } else {
                this.set('searchResults', null)
            }
        },

    }

})