import Ember from 'ember'

export default Ember.Component.extend({

    classNames: ['side-nav', 'color-primary'],
    elementId: 'side-nav',
    tagName: 'ul',
    api: Ember.inject.service(),
    auth: Ember.inject.service(),
    bus: Ember.inject.service(),
    web: !window.ELECTRON,

    init() {
        this._super(...arguments)

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

        transitionToPath (path) {
            this.closeDrawer()
            setTimeout(() => {
                this.sendAction('transitionToPath', path)

            }, 200)
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
        },

        openThemes () {
            this.closeDrawer()
            const modal = {
                componentName: 'theme-modal',
                data: null
            }
            this.get('bus').post('openModal', modal)
        }
    }

})