import Ember from 'ember'
import MessageMixin from '../../mixins/messaging'

export default Ember.Component.extend(MessageMixin, {

    api: Ember.inject.service(),
    bus: Ember.inject.service(),

    classNames: ['modal', 'send-modal'],
    searchTerm: '',
    message: '',

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

            this.$('#to').focus()
        })
    },

    willDestoryElement () {
        this._super(...arguments)
        this.get('bus').unregister(this)
    },

    validateAddress (address) {
        return /\d/.test(address)
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
        this.set('scheduledMessage', scheduledMessage)
    },

    onNewMessage (payload) {
        if (!this.get('isLoading')) return
        const message = payload.message

        if (this.messageReplacesScheduledMessage(message, this.get('scheduledMessage'))) {
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
            if (!(this.get('to.length') > 0)) {
                this.set('error', 'Please select a contact or phone number.')
                return
            } else if (!(this.get('message.length') > 0)) {
                this.set('error', 'Please enter a message.')
                return
            }

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
                if (query.length > 3 && this.validateAddress(query)) {
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