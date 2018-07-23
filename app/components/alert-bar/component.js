import config from '../../config/environment';

export default Ember.Component.extend({

    api: Ember.inject.service(),
    settings: Ember.inject.service(),

    classNames: ['alert-bar'],

    async didInsertElement () {
        this._super(...arguments)

        try {
            const lastSeen = this.get('settings').getSetting('lastSeenAlert', 0)
            const platform = (window.ELECTRON) ? 'desktop' : 'web'
            const version = config.APP_VERSION
            const { alert } = await this.get('api').getAlerts(platform, version, lastSeen)
            if (alert != null) {
                this.set('alert', alert)
            }
        } catch (e) {
            console.error(e)
        }
    },

    actions: {

        dismissAlert() {
            this.get('settings').putSetting('lastSeenAlert', this.get('alert.id'))
            this.set('alert', null)
        }

    }

})