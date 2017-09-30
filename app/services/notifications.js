import Ember from 'ember'

export default Ember.Service.extend({

    settings: Ember.inject.service(),

    init () {
        this._super(...arguments)
        if (Notification.permission !== 'granted') {
            Notification.requestPermission()
        }
    },

    showNotifications () {
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
            image = (image === undefined) ? 'TODO' : 'data:image/png;base64,' + image
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