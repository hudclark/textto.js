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
        Ember.run.scheduleOnce('afterRender', this, () => {
            this.startScrollListener()
            this.initializeDragAndDrop()
        })
    },

    willDestoryElement () {
        this._super(...arguments)
        this.get('bus').unregister(this)
        this.stopScrollListener()
    },

    initializeDragAndDrop () {
        const $conversationView = $('conversation-view')
        $conversationView.on('drag dragstart dragend dragover dragcenter dragleave drop', (e) => {
            e.preventDefault()
            e.stopPropagation()
        })
        .on('dragover dragcenter', (e) => {
            const files = e.originalEvent.dataTransfer.files
            $conversationView.addClass('dragging-file')
        })
        .on('dragleave', (e) => {
            if (e.originalEvent.pageX != 0 || e.originalEvent.pageY != 0) return false
            $conversationView.removeClass('dragging-file')
        })
        .on('drop', (e) => {
            $conversationView.removeClass('dragging-file')
            const files = e.originalEvent.dataTransfer.files
            if (files.length === 1) {
                this.get('bus').post('openModal', {
                    componentName: 'upload-modal', data: {
                        threadId: this.get('threadId'),
                        file: files[0]
                    }
                })
            }
        })


    },

    async loadThread (threadId) {
        const response = await this.get('api').getAllMessages(threadId)
        if (this.isDestroyed || this.isDestroying) return

        if (!response.canSendMessages) {
            this.get('bus').post('noAndroidDevice')
        }

        // TODO
        // Add a handler for registeredDevice in side bar and send box to disable/enable
        // when a user gets/looses a device

        this.set('isLoading', false)

        // make sure request is not cancelled
        if (threadId !== this.get('threadId')) return
        this.matchContactsToMessages(this.get('contacts'), response.messages)

        this.set('messages', response.messages)
        this.set('scheduledMessages', response.scheduledMessages)

        this.set('canLoadMore', false)
        setTimeout(() => {
            this.set('canLoadMore', true)
        }, 160)

        Ember.run.scheduleOnce('afterRender', this, function () {
            this.scrollToBottom(0)
            this.scrollToBottom(150)
            $('send-box-input').focus()
        })

    },

    scrollToBottom (delay) {
        setTimeout(() => {
            const $messages = $('.messages')
            if (!$messages) {
                this.scrollToBottom(200)
            } else {
                $messages.scrollTop($messages[0].scrollHeight)
            }
        }, delay)
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
            const messages = this.get('sortedMessages')
            const last = messages[0]
            if (!last) {
                this.isLoadingMore = false
                return
            }
            const after = last.date
            const newMessages = await this.get('api').loadMoreMessages(this.get('threadId'), after)
            if (this.isDestroyed || this.isDestroying) return
            this.matchContactsToMessages(this.get('contacts'), newMessages)

            this.hasMoreMessages = (newMessages.length > 0)

            // save current scroll position
            const $messages = $('.messages')
            const scrollFromBottom = $messages[0].scrollHeight - $messages.scrollTop()

            // set the model
            this.get('messages').pushObjects(newMessages)

            // return to scroll position
            Ember.run.scheduleOnce('afterRender', this, function () {
                $messages.scrollTop($messages[0].scrollHeight - scrollFromBottom)
                // Do not allow another load for three seconds
                setTimeout(() => {
                    if (this.isDestroyed || this.isDestroying) return
                    this.isLoadingMore = false
                }, 1000)
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
        this.matchContactToMessage(this.get('contacts'), message)
        let didReplace = false
        // check to see if any scheduled messages are replaced
        let scheduledMessages = this.get('scheduledMessages').filter((msg) => {
            const replaced = this.messageReplacesScheduledMessage(message, msg)
            didReplace |= replaced
            return !replaced
        })
        this.set('scheduledMessages', scheduledMessages)

        if (didReplace) message.animated = true

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
            this.get('bus').post('openModal', {componentName: 'failed-modal', data: {scheduledMessage}})
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

    onRemoveScheduledMessage (payload) {
        if (this.isDestroyed || this.isDestroying) return
        const id = payload.id
        const array = this.get('scheduledMessages')
        const msg = array.find((msg) => id === msg._id)
        if (msg) {
            array.removeObject(msg)
        }
    },

    onRetryScheduledMessage (payload) {
        if (this.isDestroyed || this.isDestroying) return
        const id = payload.id
        const array = this.get('scheduledMessages')
        const msg = array.find((msg) => id === msg._id)
        if (msg) {
            Ember.set(msg, 'failed', false)
            Ember.set(msg, 'sent', false)
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