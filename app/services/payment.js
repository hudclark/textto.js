import Ember from 'ember'
import config from '../config/environment'

export default Ember.Service.extend({

    api: Ember.inject.service(),

    createDonation (amount) {
        return new Ember.RSVP.Promise((resolve, reject) => {
            const handler = StripeCheckout.configure({
                key: config.STRIPE_KEY,
                image: 'https://textto.io/images/logo.png',
                locale: 'US',
                token: (token) => resolve(this.get('api').donate(token, amount)),
                closed: () => reject()
            })

            handler.open({
                name: 'Textto',
                description: 'Donate and help keep Textto Alive!',
                amount: Math.round(amount * 100)
            })
        })
    },

    removeAds () {
        return new Ember.RSVP.Promise((resolve, reject) => {
            const handler = StripeCheckout.configure({
                key: config.STRIPE_KEY,
                image: 'https://textto.io/images/logo.png',
                locale: 'US',
                token: (token) => resolve(this.get('api').removeAds(token)),
                closed: () => reject()
            })

            handler.open({
                name: 'Textto',
                description: 'Remove Ads',
                amount: 399
            })
        })
    },

    upgradeSyncLimits () {
        return new Ember.RSVP.Promise((resolve, reject) => {
            const handler = StripeCheckout.configure({
                key: config.STRIPE_KEY,
                image: 'https://textto.io/images/logo.png',
                locale: 'US',
                token: (token) => resolve(this.get('api').upgradeSyncLimits(token)),
                closed: () => reject()
            })

            handler.open({
                name: 'Textto',
                description: 'Upgrade Sync Limits',
                amount: 399
            })
        })
    }

})