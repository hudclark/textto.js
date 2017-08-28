import Ember from 'ember';

export default Ember.Component.extend({
    tagName: 'side-bar',

    bus: Ember.inject.service(),
    api: Ember.inject.service(),

    activeThread: null,
    threads: [],
    sortedThreads: Ember.computed.sort('threads.[]', 'threadOrdering'),
    threadOrdering: ['last:desc'],

    async init () {
        this._super(...arguments)

        const threads = await this.get('api').getThreads()
        this.set('threads', threads)
        if (this.get('sortedThreads').length > 0) {
            this.setActiveThread(this.get('sortedThreads')[0])
        }

        this.get('bus').register(this)
    },

    willDestroyElement () {
        this._super(...arguments)
        this.get('bus').unregister(this)
    },

    setActiveThread (thread) {
        let currentlyActive = this.get('activeThread')
        if (currentlyActive && (thread._id === currentlyActive._id)) return
        if (currentlyActive) this.set('activeThread.active', false)
        this.set('activeThread', thread)
        this.set('activeThread.active', true)
        this.sendAction('select-thread', thread)
    },

    getSnippetForMessage (message) {
        if (message.body) return message.body
        let snippet = null
        if (message.parts) {
            for (let i = 0; i < message.parts.length; i++) {
                const part = message.parts[i]
                if (part.contentType === 'text/plain') {
                    snippet = part.data
                    break
                } else if (part.contentType.includes('image')) {
                    snippet = ((message.sender === 'me') ? 'You sent an ' : 'You received an ') + 'image'
                }
            }
        }
        return snippet
    },

    // ================== Websocket events =========================

    onNewThread (payload) {
        const thread = payload.thread
        this.get('threads').unshiftObject(thread)
    },

    onNewMessage (payload) {
        const message = payload.message
        const snippet = this.getSnippetForMessage(message)
        if (!snippet) return
        let thread = this.get('threads').find((thread) => {
            return (thread.androidId === message.threadId)
        })
        if (!thread || thread.last > message.date) return
        Ember.set(thread, 'snippet', snippet)
        Ember.set(thread, 'last', message.date)
    },


    actions: {

        onThreadClick(thread) {
            this.setActiveThread(thread)
        }
    }

})