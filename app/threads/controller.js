import Ember from 'ember';

export default Ember.Controller.extend({

    api: Ember.inject.service(),
    bus: Ember.inject.service(),

    _threads: [],
    threads: Ember.computed.sort('_threads.[]', 'threadOrdering'),
    threadOrdering: ['last:desc'],
    activeThread: null,
    activeThreadTitle: Ember.computed('activeThread.contact.name', function() {
        return twemoji.parse(this.get('activeThread.contact.name'));
    }),


    init() {
        this._super(...arguments);
        this.get('bus').register(this);
    },

    async load() {
        let threads = await this.get('api').getThreads();
        this.set('_threads', threads);
        if (threads.length) {
            this.setActiveThread(this.get('threads')[0].androidId);
        } else {
            // TODO show empty state.
            // Maybe just show modal with a send message button?
        }
    },

    async setActiveThread(androidId) {
        let activeId = this.get('activeThread.androidId');
        if (androidId !== activeId) {
            let newActiveThread = null;
            this.get('_threads').forEach((thread) => {
                if (thread.androidId === activeId) {
                    Ember.set(thread, 'active', false);
                } else if (thread.androidId === androidId) {
                    Ember.set(thread, 'active', true);
                    newActiveThread = thread;
                }
            });
            this.set('activeThread', newActiveThread);

            $('send-box').focus();
        }
    },

    onNewMessage(payload) {
        let message = payload.message;
        this.updateThread(message.threadId, message, message.date)
    },

    onNewThread(payload) {
        let thread = payload.thread;
        this.get('threads').unshiftObject(thread);
    },

    updateThread (threadId, msg, time) {
        const snippet = this._getSnippetForMessage(msg)
        this.get('threads').forEach((thread) => {
            if (thread.androidId == threadId && (time > thread.last || msg.type === 'mms')) { // TODO this is a hack to fix mms rounding
                if (snippet) Ember.set(thread, 'snippet', snippet);
                Ember.set(thread, 'last', time);
            }
        });
    },

    _getSnippetForMessage(msg) {
        if (msg.body) return msg.body;
        let snippet = null;
        if (msg.parts) {
            for (let i = 0; i < msg.parts.length; i++) {
                const part = msg.parts[i]
                if (part.contentType === 'text/plain') {
                    snippet = part.data
                    break
                } else if (part.contentType.includes('image')) {
                    snippet = ((msg.sender === 'me') ? 'You sent an ' : 'You received an ') + 'picture';
                }
            }
        }
        return snippet
    },

    actions: {

        onThreadClick(threadId) {
            this.setActiveThread(threadId);
        },

    }

});