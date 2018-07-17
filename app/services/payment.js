import Ember from 'ember'
import config from '../config/environment'

export default Ember.Service.extend({

    api: Ember.inject.service(),

    createDonation (amount) {
        return new Ember.RSVP.Promise((resolve, reject) => {
            const handler = StripeCheckout.configure({
                key: config.STRIPE_KEY,
                image: 'https://sendleap.com/images/logo.png',
                locale: 'US',
                token: (token) => resolve(this.get('api').donate(token, amount)),
                closed: () => reject()
            })

            handler.open({
                name: 'SendLeap',
                description: 'Donate and help keep SendLeap Alive!',
                amount: Math.round(amount * 100)
            })
        })
    },

    removeAds () {
        return new Ember.RSVP.Promise((resolve, reject) => {
            const handler = StripeCheckout.configure({
                key: config.STRIPE_KEY,
                image: 'https://sendleap.com/images/logo.png',
                locale: 'US',
                token: (token) => resolve(this.get('api').removeAds(token)),
                closed: () => reject()
            })

            handler.open({
                name: 'SendLeap',
                description: 'Remove Ads',
                amount: 399
            })
        })
    },

    upgradeSyncLimits () {
        return new Ember.RSVP.Promise((resolve, reject) => {
            const handler = StripeCheckout.configure({
                key: config.STRIPE_KEY,
                image: 'https://sendleap.com/images/logo.png',
                locale: 'US',
                token: (token) => resolve(this.get('api').upgradeSyncLimits(token)),
                closed: () => reject()
            })

            handler.open({
                name: 'SendLeap',
                description: 'Upgrade Sync Limits',
                amount: 499
            })
        })
    }

})