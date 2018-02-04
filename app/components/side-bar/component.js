import Ember from 'ember';
import MessageMixin from '../../mixins/messaging'

export default Ember.Component.extend(MessageMixin, {
    tagName: 'side-bar',
    classNames: ['color-secondary'],


    bus: Ember.inject.service(),
    api: Ember.inject.service(),
    notifications: Ember.inject.service(),

    activeThread: null,
    threads: [],
    sortedThreads: Ember.computed.sort('threads.[]', 'threadOrdering'),
    threadOrdering: ['last:desc'],

    async init () {
        this._super(...arguments)

        this.set('isLoading', true)
        const threads = await this.get('api').getThreads()
        this.set('threads', threads)
        if (this.get('sortedThreads').length > 0) {
            this.setActiveThread(this.get('sortedThreads')[0])
        }

        this.set('isLoading', false)

        this.get('bus').register(this)

        // User has no threads. Show no-messages dialog
        if (threads.length === 0) {
            this.sendAction('no-messages')
        }
    },

    willDestroyElement () {
        this._super(...arguments)
        this.get('bus').unregister(this)
    },

    setActiveThread (thread) {
        let currentlyActive = this.get('activeThread')
        if (currentlyActive && (currentlyActive && thread._id === currentlyActive._id)) return
        if (currentlyActive) this.set('activeThread.active', false)
        this.set('activeThread', thread)
        this.set('activeThread.active', true)
        this.sendAction('select-thread', thread)
    },

    onSelectThread(threadId) {
        const thread = this.get('threads').find((t) => t.androidId === threadId)
        this.setActiveThread(thread)
    },

    attachContactToMessage(msg) {
        if (msg.sender === 'me') return
        const thread = this.get('threads').find(t => msg.threadId === t.androidId)
        if (thread) {
            msg.contact = thread.contacts.find((c) =>{
                return (c.address === msg.sender)
            })
        }
    },

    // ================== Websocket events =========================

    onNewThread (payload) {
        const thread = payload.thread
        this.get('threads').unshiftObject(thread)
        if (this.get('threads.length') === 1) {
            this.setActiveThread(thread)
        }
    },

    onNewMessage (payload) {
        const message = payload.message
        const snippet = this.getMessageSnippet(message)
        if (!snippet) return
        let thread = this.get('threads').find((thread) => {
            return (thread.androidId === message.threadId)
        })
        if (!thread || thread.last > message.date) return
        Ember.set(thread, 'snippet', snippet)
        Ember.set(thread, 'last', message.date)

        // display notification
        if (message.sender !== 'me') {
            this.attachContactToMessage(message)
            const image = (message.contact) ? message.contact.image : undefined
            const title = (message.contact && message.contact.name) ? message.contact.name : message.sender
            const body = this.getMessageSnippet(message)
            this.get('notifications').displayNotification(title, body, image)
        }

    },

    // TODO maybe do this when a scheduled messages is actually sent
    onNewScheduledMessage () {
        $('.threads').animate({scrollTop: 0}, 300)
    },

    onNewMessages () {
        if (!this.disableRequests) {
            this.onWebsocketReconnected()
        }
    },

    // TODO move to mixin
    // IF this is missed.... tons of unneccessary requests
    // TODO 1
    onStartInitialSync () {
        console.log('Starting sync')
        this.disableRequests = true
    },

    onEndInitialSync () {
        this.disableRequests = false
        this.onWebsocketReconnected()
    },

    onContactsUpdated () {
        this.onWebsocketReconnected()
    },

    onDeviceChanged () {
        this.onWebsocketReconnected()
    },

    async onWebsocketReconnected () {
        const activeThreadId = this.get('activeThread._id')
        const threads = await this.get('api').getThreads()
        this.set('activeThread', null)
        this.set('threads', threads)
        const activeThread = threads.find(t => t._id === activeThreadId)
        this.setActiveThread(activeThread)
    },

    actions: {

        onThreadClick(thread) {
            this.setActiveThread(thread)
        },

        delete (thread) {
            if (confirm('Are you sure you want to delete this thread?')) {
                this.get('threads').removeObject(thread)

                if (this.get('activeThread') === thread) {
                    if (this.get('threads').length === 0) {
                        this.sendAction('no-messages')
                    } else {
                        this.setActiveThread(this.get('threads').objectAt(0))
                    }
                }

                this.get('api').deleteThread(thread._id)
                    .then(() => console.log('deleted thread'))
                    .catch(() => console.error('error deleting thread'))

            }

        }
    }

})