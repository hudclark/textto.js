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
            const func = (window.ELECTRON) ? this.displayElectronNotification : this.displayWebNotification
            func(title, body, image)
        }
    },

    displayWebNotification (title, body, image) {
        if (Notification.permission === 'granted') {
            image = (image === undefined) ? 'TODO' : 'data:image/png;base64,' + image
            const notification = new Notification(title, {
                icon: image,
                body: body,
                tag: 1 // at most 1 notification at a time
            })
            setTimeout(notification.close.bind(notification), 4000)
            notification.onclick = function () {
                notification.close()
            }
        } else {
            Notification.requestPermission()
        }
    }

})