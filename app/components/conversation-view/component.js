import Ember from 'ember'
import MessageMixin from '../../mixins/messaging'

export default Ember.Component.extend(MessageMixin, {

    tagName: 'conversation-view',

    bus: Ember.inject.service(),
    api: Ember.inject.service(),
    notifications: Ember.inject.service(),

    threadId: null,

    messages: [],
    sortedMessages: Ember.computed.sort('messages.[]', 'messageOrdering'),
    messageOrdering: ['date:asc'],

    scheduledMessages: [],
    sortedScheduledMessages: Ember.computed.sort('scheduledMessages.[]', 'scheduledMessageOrdering'),
    scheduledMessageOrdering: ['uuid:asc'],

    isLoadingMore: false,
    hasMoreMessages: true,

    init () {
        this._super(...arguments)
        this.set('isLoading', true)
        this.get('bus').register(this)
    },

    didReceiveAttrs () {
        this._super(...arguments)
        const threadId = this.get('threadId')
        let oldId = null
        if (this.get('messages').length) oldId = this.get('messages')[0].threadId
        if (!oldId && this.get('scheduledMessages').length) oldId = this.get('scheduledMessages')[0].threadId
        if (threadId != null && threadId !== oldId) {
            this.get('messages').clear()
            this.get('scheduledMessages').clear()
            this.loadThread(threadId)
            this.isLoadingMore = false
            this.hasMoreMessages = true
        }
    },

    didInsertElement () {
        this._super(...arguments)
        this.startScrollListener()
    },

    willDestoryElement () {
        this._super(...arguments)
        this.get('bus').unregister(this)
        this.stopScrollListener()
    },

    async loadThread (threadId) {
        const response = await this.get('api').getAllMessages(threadId)
        if (this.isDestroyed || this.isDestroying) return
        this.set('isLoading', false)

        // make sure request is not cancelled
        if (threadId !== this.get('threadId')) return
        this.attachContactsToMessages(response.messages)

        this.set('messages', response.messages)
        this.set('scheduledMessages', response.scheduledMessages)

        Ember.run.scheduleOnce('afterRender', this, function () {
            this.scrollToBottom(0)
            this.scrollToBottom(150)
        })
    },

    scrollToBottom (delay) {
        setTimeout(function () {
            const $messages = $('.messages')
            $messages.scrollTop($messages[0].scrollHeight)
        }, delay)
    },

    attachContactsToMessages(messages) {
        // add thread's contacts to each message
        const contacts = this.get('contacts')
        messages.forEach((msg) => {
            if (msg.sender !== 'me') {
                msg.contact = contacts.find((c) =>{
                    return (c.address === msg.sender)
                })
                if (!msg.contact) msg.contact = {address: msg.sender}
            }
        })
    },

    attachContactToMessage(msg) {
        const contacts = this.get('contacts')
        if (msg.sender !== 'me') {
            msg.contact = contacts.find((c) =>{
                return (c.address === msg.sender)
            })
            if (!msg.contact) msg.contact = {address: msg.sender}
        }
    },

    unshiftOrReplace (collectionName, value, func, animate) {
        const array = this.get(collectionName)
        let index = -1
        for (let i = 0; i < array.length; i++) {
            if (func(array[i])) {
                index = i
                break
            }
        }
        if (index === -1) {
            if (animate) value.animated = true
            array.pushObject(value)
        } else {
            array[index] = value
        }
    },

    startScrollListener () {
        this.scrollInterval = setInterval(() => {
            const $messages = $('.messages')
            if (!$messages[0]) return // not inserted yet
            
            const events = $._data($messages[0]).events
            if (!events || !events.scroll) {
                $messages.scroll(() => this.didScroll = true)
            }

            if (this.didScroll) {
                this.didScroll = false
                if ($messages.scrollTop() < 100 && !this.isLoadingMore && this.hasMoreMessages) {
                    this.loadMore()
                }
            }
        })
    },

    async loadMore () {
        this.isLoadingMore = true
        try {
            const messages = this.get('messages')
            const last = messages[messages.length - 1]
            if (!last) {
                this.isLoadingMore = false
                return
            }
            const after = last.date
            const newMessages = await this.get('api').loadMoreMessages(this.get('threadId'), after)
            if (this.isDestroyed || this.isDestroying) return
            this.attachContactsToMessages(newMessages)

            this.hasMoreMessages = (newMessages.length > 0)
            // Do not allow another load for three seconds
            setTimeout(() => {
                if (this.isDestroyed || this.isDestroying) return
                this.isLoadingMore = false
            }, 3000)

            // save current scroll position
            const $messages = $('.messages')
            const scrollFromBottom = $messages[0].scrollHeight - $messages.scrollTop()

            // set the model
            this.get('messages').pushObjects(newMessages)

            // return to scroll position
            Ember.run.scheduleOnce('afterRender', this, function () {
                $messages.scrollTop($messages[0].scrollHeight - scrollFromBottom)
            })
        } catch (err) {
            console.log('Error loading more messages', err)
        }
    },

    stopScrollListener () {
        clearInterval(this.scrollInterval)
    },

    // ============== Websocket events ====================

    onNewMessage (payload) {
        if (this.isDestroyed || this.isDestroying) return
        const message = payload.message
        // Don't include if message does not have a body
        if (!message.body && (!message.parts || message.parts.length === 0)) return
        if (message.threadId !== this.get('threadId')) return
        this.attachContactToMessage(message)
        let didReplace = false
        // check to see if any scheduled messages are replaced
        let scheduledMessages = this.get('scheduledMessages').filter((msg) => {
            const replaced = this.messageReplacesScheduledMessage(message, msg)
            didReplace |= replaced
            return !replaced
        })
        this.set('scheduledMessages', scheduledMessages)

        // add message
        this.unshiftOrReplace('messages', message, m => (m._id === message._id), !didReplace)
    },

    onNewScheduledMessage (payload) {
        if (this.isDestroyed || this.isDestroying) return
        const scheduledMessage = payload.scheduledMessage
        if (this.get('threadId') !== scheduledMessage.threadId) return

        this.unshiftOrReplace('scheduledMessages', scheduledMessage, function (msg) {
            return (msg.uuid === scheduledMessage.uuid)
        }, true)
    },

    onUpdateScheduledMessage (payload) {
        if (this.isDestroyed || this.isDestroying) return
        const scheduledMessage = payload.scheduledMessage

        // notify
        if (scheduledMessage.failed) {
            this.get('notifications').displayNotification('Failed sending message', 'Failed: ' + (scheduledMessage.body || 'Sending image'))
        }

        if (this.get('threadId') !== scheduledMessage.threadId) return

        const array = this.get('scheduledMessages')
        for (let i = 0; i < array.length; i++) {
            if (scheduledMessage.uuid === array[i].uuid) {
                array.replace(i, 1, scheduledMessage)
                break
            }
        }
    },

    onDeleteScheduledMessage (payload) {
        if (this.isDestroyed || this.isDestroying) return
        const scheduledMessage = payload.scheduledMessage
        if (this.get('threadId') !== scheduledMessage.threadId) return

        const array = this.get('scheduledMessages')
        for (let i = 0; i < array.length; i++) {
            if (scheduledMessage.uuid === array[i].uuid) {
                array[i].isDeleted = true
                break
            }
        }
    },

    // Should be very rare
    onDeviceChanged () {
        this.onWebsocketReconnected()
    },

    // TODO move to mixin
    onNewMessages () {
        if (!this.disableRequests) {
            this.onWebsocketReconnected()
        }
    },

    // IF this is missed.... tons of unneccessary requests
    onStartInitialSync () {
        console.log('Starting sync')
        this.disableRequests = true
    },

    onEndInitialSync () {
        this.disableRequests = false
        this.onWebsocketReconnected()
    },

    onWebsocketReconnected () {
        if (this.isDestroyed || this.isDestroying) return
        const threadId = this.get('threadId')
        if (threadId != null) this.loadThread(threadId)
    }

})