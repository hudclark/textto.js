import Ember from 'ember'

export default Ember.Component.extend({

    classNames: 'ad-banner',

    ads: [],
    currentAd: 'remove_ads',
    api: Ember.inject.service(),

    bus: Ember.inject.service(),

    async didInsertElement () {
        this._super(...arguments)

        const ads = await this.get('api').getBannerAds()
        this.set('ads', ads)

        this.startAdRotation()
    },

    startAdRotation () {
        let counter = 0
        setInterval(() => {
            const numberOfAds = this.get('ads.length')

            let currentAd = null

            if (counter === 0) currentAd = 'remove_ads'
            else if (counter === 1) currentAd = 'advertise_on_textto'
            else {
                currentAd = this.get('ads')[counter - 2]
            }

            counter = (counter + 1) % (numberOfAds + 2)

            this.set('currentAd', currentAd)
        }, 8000)
    },

    actions: {

        removeAds () {
            this.get('bus').post('openModal', {
                componentName: 'remove-ads-modal',
                data: null
            })
        }

    }

})