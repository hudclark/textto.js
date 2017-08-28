import Ember from 'ember'

export default Ember.Component.extend({

    classNames: ['modal', 'send-modal'],
    searchTerm: null,
    api: Ember.inject.service(),
    bus: Ember.inject.service(),

    didInsertElement () {
        Ember.run.scheduleOnce('afterRender', this, () => {
            $('.modal').modal({
                complete: () => {
                    this.get('bus').post('closeModal')
                }
            })
            $('.modal').modal('open')
        })
    },

    async keyUp () {
        const query = this.get('searchTerm')
        if (query.length > 1) {
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

    validateAddress(address) {
        return /^(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?$/.test(address)
    },

    actions: {

        select (contact) {
            if (!this.get('to')) this.set('to', [])
            let to = this.get('to')
            to.pushObject(contact)
            this.set('searchTerm', null)
            this.set('searchResults', null)
        },

        remove (contact) {
            this.get('to').removeObject(contact)
        }

    }

})