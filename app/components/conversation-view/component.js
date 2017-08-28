import Ember from 'ember'

export default Ember.Component.extend({

    tagName: 'conversation-view',

    bus: Ember.inject.service(),
    api: Ember.inject.service(),

    threadId: null,

    messages: [],
    sortedMessages: Ember.computed.sort('messages.[]', 'messageOrdering'),
    messageOrdering: ['date:desc'],

    scheduledMessages: [],
    sortedScheduledMessages: Ember.computed.sort('scheduledMessages.[]', 'scheduledMessageOrdering'),
    scheduledMessageOrdering: ['uuid:desc'],

    isLoadingMore: false,
    hasMoreMessages: true,

    init () {
        this._super(...arguments)
        this.get('bus').register(this)
    },

    didReceiveAttrs () {
        this._super(...arguments)
        this.get('messages').clear()
        this.get('scheduledMessages').clear()
        const threadId = this.get('threadId')
        if (threadId) {
            this.loadThread(threadId)
            this.isLoadingMore = false
            this.hasMoreMessages = true
        }
    },

    willDestoryElement () {
        this._super(...arguments)
        this.get('bus').unregister(this)
    },

    async loadThread (threadId) {
        const response = await this.get('api').getAllMessages(threadId)

        // make sure request is not cancelled
        if (threadId !== this.get('threadId')) return

        // add thread's contacts to each message
        const contacts = this.get('contacts')
        response.messages.forEach((msg) => {
            if (msg.sender !== 'me') {
                msg.contact = contacts.find((c) =>{
                    return (c.address === msg.sender)
                })
            }
        })

        this.set('messages', response.messages)
        this.set('scheduledMessages', response.scheduledMessages)

    },

    unshiftOrReplace (collectionName, value, func) {
        const array = this.get(collectionName)
        let index = -1
        for (let i = 0; i < array.length; i++) {
            if (func(array[i])) {
                index = i
                break
            }
        }
        if (index === -1) {
            array.unshiftObject(value)
        } else {
            array[index] = value
        }
    },

    messageReplacesscheduledMessage(message, scheduled) {
        if (!(scheduled.sent || scheduled.isDeleted)) return false
        let body = message.body
        if (!body && message.parts) {
            const part = message.parts.find((part) => {
                return (part.contentType === 'text/plain')
            })
            if (part) body = part.data
        }
        return (scheduled.body === body)
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
                if ($messages.scrollTop() < 600 && !this.isLoadingMore && this.hasMoreMessages) {
                    this.loadMore()
                }
            }
        })
    },

    async loadMore () {
        this.isLoadingMore = true
        try {
            const messages = this.get('messages')
            const after = messages[messages.length - 1].date
            const newMessages = await this.get('api').loadMoreMessages(this.get('threadId'), after)
            this.get('messages').pushObjects(newMessages)
            this.hasMoreMessages = (newMessages.length > 0)
            this.isLoadingMore = false
        } catch (err) {
            console.log('Error loading more messages', err)
        }
    },

    stopScrollListener () {
        clearInterval(this.scrollInterval)
    },




    // ============== Websocket events ====================

    onNewMessage (payload) {
        const message = payload.message
        // Don't include if message does not have a body
        if (!message.body && (!message.parts || message.parts.length === 0)) return
        if (message.threadId !== this.get('threadId')) return
        
        // check to see if any scheduled messages are replaced
        let scheduledMessages = this.get('scheduledMessages').filter((msg) => {
            return !this.messageReplacesscheduledMessage(message, msg)
        })
        this.set('scheduledMessages', scheduledMessages)

        // add message
        this.unshiftOrReplace('messages', message, m => (m._id === message._id))
    },

    onNewScheduledMessage (payload) {
        const scheduledMessage = payload.scheduledMessage
        if (this.get('threadId') !== scheduledMessage.threadId) return

        this.unshiftOrReplace('scheduledMessages', scheduledMessage, function (msg) {
            return (msg.uuid === scheduledMessage.uuid)
        })
    },

    onUpdateScheduledMessage (payload) {
        const scheduledMessage = payload.scheduledMessage
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
        const scheduledMessage = payload.scheduledMessage
        if (this.get('threadId') !== scheduledMessage.threadId) return

        const array = this.get('scheduledMessages')
        for (let i = 0; i < array.length; i++) {
            if (scheduledMessage.uuid === array[i].uuid) {
                array[i].isDeleted = true
                break
            }
        }
    }

})