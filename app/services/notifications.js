import Ember from 'ember'

export default Ember.Service.extend({

    settings: Ember.inject.service(),
    isDisabled: false,

    requestPermission () {
        console.log('requesting permission')
        console.log('1')
        console.log('N: ' + Notification)
        console.log('2')
        if (Notification !== undefined) {
            console.log('Notifications are available')
        } else {
            console.log('Notifications are not available')
        }
        if (Notification !== undefined && Notification.permission !== 'granted') {
            Notification.requestPermission()
        }
    },

    disable () {
        console.log('Disabling notifications')
        this.isDisabled = true
    },

    enable () {
        console.log('Enabling notifications')
        this.isDisabled = false
    },

    showNotifications () {
        if (this.isDisabled || !Notification) return false
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
            image = (image == null) ? '/images/logo.png' : 'data:image/png;base64,' + image
            const notification = new Notification(title, {
                icon: image,
                body: body,
            })
            setTimeout(notification.close.bind(notification), 3000)
            notification.onclick = function () {
                notification.close()
            }
        } else {
            this.requestPermission()
        }
    },
})