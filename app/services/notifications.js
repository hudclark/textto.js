import Ember from 'ember'

export default Ember.Service.extend({

    settings: Ember.inject.service(),
    isDisabled: false,
    bus: Ember.inject.service(),

    init () {
        this._super(...arguments)
        this.get('bus').register(this)
    },

    askPermission () {
        try {
            if (Notification && Notification.permission !== 'granted') {
                Notification.requestPermission()
            }
        } catch (err) {
            console.log('Error requesting notification access', err)
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
        try {
            if (this.isDisabled || !Notification) return false
            const enabled = this.get('settings').getSetting('notifications', true)
            return (enabled && !document.hasFocus())
        } catch (err) {
            console.log('Error with notifications', err)
            return false
        }
    },

    displayNotification (title, body, image) {
        if (this.showNotifications()) {
            this._createNotification(title, body, image)
        }
    },

    _createNotification (title, body, image) {
        if (Notification.permission === 'granted') {
            image = (image == null) ? '/images/logo.png' : 'data:image/png;base64,' + image
            const hideText = this.get('settings').getSetting('hideNotificationText', false)
            const notification = new Notification(title, {
                icon: image,
                body: (hideText) ? 'Contents Hidden' : body,
            })

            const duration = this.get('settings').getSetting('notificationLength', 3)

            setTimeout(notification.close.bind(notification), duration * 1000)
            notification.onclick = function () {
                notification.close()
            }
        } else {
            this.askPermission()
        }
    },


    // Websocket events -------------------------------------------------------------

    onNotificationReceived (payload) {
        if (!settings.getSetting('mirrorNotifications', true)) return

        // Mirroed notifications should show even if textto is in focus.
        if (this.isDisabled || !Notification) return
        const enabled = this.get('settings').getSetting('notifications', true)
        if (enabled) {
            const notification = payload.notification
            console.log(notification.thumbnail.length)
            this._createNotification(notification.title,
                notification.subtitle, notification.thumbnail)
        }
    },
})