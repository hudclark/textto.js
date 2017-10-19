import Ember from 'ember'

export default Ember.Service.extend({

    settings: Ember.inject.service(),
    disable: false,

    init () {
        this._super(...arguments)
        if (Notification.permission !== 'granted') {
            Notification.requestPermission()
        }
    },

    disable () {
        console.log('Disabling notifications')
        this.disable = true
    },

    enable () {
        console.log('Enabling notifications')
        this.disable = false
    },

    showNotifications () {
        if (this.disable) return false
        const enabled = this.get('settings').getSetting('notifications', true)
        return (enabled && !document.hasFocus())
    },

    displayNotification (title, body, image) {
        if (this.showNotifications()) {
            this._createNotification(title, body, image)
        }
    },

    _createNotification (title, body, image) {
        if (Notification.permission === 'granted') {
            // TODO app icons
            image = (image === undefined) ? '/images/logo.png' : 'data:image/png;base64,' + image
            const notification = new Notification(title, {
                icon: image,
                body: body,
            })
            setTimeout(notification.close.bind(notification), 3000)
            notification.onclick = function () {
                notification.close()
            }
        } else {
            Notification.requestPermission()
        }
    },
})