import Ember from 'ember'

export default Ember.Component.extend({

    classNames: 'side-nav',
    elementId: 'side-nav',
    tagName: 'ul',
    api: Ember.inject.service(),
    settings: Ember.inject.service(),
    auth: Ember.inject.service(),
    bus: Ember.inject.service(),

    init() {
        this._super(...arguments)

        this.set('notifications', this.get('settings').getSetting('notifications', true))

        this.get('api').getUser()
            .then((user) => {
                this.set('user', user)
            })
            .catch(e => console.log(e))
    },

    didInsertElement () {
        this._super(...arguments)
        Ember.run.scheduleOnce('afterRender', this, () => {
            $('#coming-soon').tooltip()
        })
    },

    closeDrawer() {
        $('.hamburger').sideNav('hide')
    },

    actions: {

        onNotificationsChange () {
            this.set('notifications', !this.get('notifications'))
            const setting = this.get('notifications')
            this.get('settings').putSetting('notifications', setting)
        },

        logOut() {
            this.closeDrawer()
            this.get('auth').logOut()
        },

        manageDevices () {
            this.closeDrawer()
            const modal = {
                componentName: 'devices-modal',
                data: null
            }
            this.get('bus').post('openModal', modal)
        },

        syncContacts () {
            this.set('syncingContacts', true)
            this.get('api').syncContacts()
            Ember.run.later(this, () => {
                if (!this.isDestroyed && ! this.isDestroying) {
                    this.set('syncingContacts', false)
                }
            }, 15000)
        }
    }

})