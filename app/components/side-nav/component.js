import Ember from 'ember'

export default Ember.Component.extend({

    classNames: 'side-nav',
    elementId: 'side-nav',
    tagName: 'ul',
    api: Ember.inject.service(),
    settings: Ember.inject.service(),
    auth: Ember.inject.service(),

    isWeb: (!window.ELECTRON),

    init() {
        this._super(...arguments)

        this.set('notifications', this.get('settings').getSetting('notifications', true))

        this.get('api').getUser()
            .then((user) => {
                this.set('user', user)
            })
            .catch(e => console.log(e))
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
        }
    }

})