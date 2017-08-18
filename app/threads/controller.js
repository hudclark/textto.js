import Ember from 'ember';

export default Ember.Controller.extend({

    api: Ember.inject.service(),
    bus: Ember.inject.service(),

    threads: [],
    activeThread: null,
    activeThreadTitle: Ember.computed('activeThread.contact.name', function() {
        return twemoji.parse(this.get('activeThread.contact.name'));
    }),

    _messages: [], // unsorted. This is what should be read/modified
    _scheduledMessages: [], // unsorted. This is what should be read/modified

    messages: Ember.computed.sort('_messages.[]', 'messageOrdering'),
    messageOrdering: ['date:desc'],
    scheduledMessages: Ember.computed.sort('_scheduledMessages.[]', 'scheduledMessageOrdering'),
    scheduledMessageOrdering: ['uuid:desc'],

    init() {
        this._super(...arguments);
        this.get('bus').register(this);
        this.startScrollListener()
    },

    async load() {
        let threads = await this.get('api').getThreads();
        this.set('threads', threads);
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
            this.get('_messages').clear();
            this.get('_scheduledMessages').clear();
            this.get('threads').forEach((thread) => {
                if (thread.androidId === activeId) {
                    Ember.set(thread, 'active', false);
                } else if (thread.androidId === androidId) {
                    Ember.set(thread, 'active', true);
                    newActiveThread = thread;
                }
            });
            this.set('activeThread', newActiveThread);

            let api = this.get('api');
            let request = await this.get('api').getAllMessages(androidId);
            // check if request is cancelled and have moved to a different thread
            if (this.get('activeThread.androidId') !== androidId) {
                return
            }
            this.set('_messages', request.messages);
            this.set('_scheduledMessages', request.scheduledMessages);
            $('send-box').focus();

            this.isLoadingMore = false
            this.hasMoreMessages = true
        }
    },

    onNewMessage(payload) {
        let message = payload.message;
        this.updateThread(message.threadId, message, message.date)
        if (!this._isCurrentThread(message.threadId)) return
        // TODO needs to be cleaned up
        this.set('_scheduledMessages', this.get('_scheduledMessages').filter((msg) => {
            return !this.messageReplacesScheduledMessage(message, msg)
        }))
        this.unshiftOrReplace('_messages', message, (msg) => {
            return (msg._id === message._id)
        })
    },

    onNewScheduledMessage (payload) {
        let message = payload.scheduledMessage;
        this.updateThread(message.threadId, message, message.createdAt);
        if (!this._isCurrentThread(message.threadId)) return
        this.unshiftOrReplace('_scheduledMessages', message, (msg) => {
            return (msg.uuid === message.uuid)
        })
    },

    onUpdateScheduledMessage (payload) {
        let message = payload.scheduledMessage;
        if (!this._isCurrentThread(message.threadId)) return
        const array = this.get('_scheduledMessages')
        for (let i = 0; i < array.length; i++) {
            if (message.uuid === array[i].uuid) {
                array[i] = message
                break
            }
        }
    },

    onDeleteScheduledMessage (payload) {
        let message = payload.scheduledMessage;
        if (!this._isCurrentThread(message.threadId)) return
        this.get('_scheduledMessages').forEach((msg) => {
            if (msg.uuid === message.uuid) {
                msg.isDeleted = true
            }
        });
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

    _isCurrentThread(androidId) {
        return (androidId === this.get('activeThread.androidId'));
    },

    startScrollListener() {
        this._scrollInterval = setInterval(() => {
            const $messages = $('.messages')
            if (!$messages[0]) return

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
        }, 200)
    },

    async loadMore() {
        console.log('loading more...')
        this.isLoadingMore = true
        try {
            const messages = this.get('messages')
            const after = messages[messages.length - 1].date
            const newMessages = await this.get('api').loadMoreMessages(this.get('activeThread.androidId'), after)
            this.get('_messages').pushObjects(newMessages)
            this.isLoadingMore = false
            this.hasMoreMessages = (newMessages.length > 0)
        } catch (err) {
            console.log(err)
        }
    },

    stopScrollListener() {
        clearInterval(this._scrollInterval)
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
        if (index !== -1) {
            array[index] = value
        } else {
            array.unshiftObject(value)
        }
    },

    messageReplacesScheduledMessage(message, scheduled) {
        if (!(scheduled.sent || scheduled.isDeleted)) return false
        let body = message.body
        if (!body && message.parts) {
            const part = message.parts.find((part) => {
                return (part.contentType === 'text/plain')
            })
            if (part) body = part.data
        }
        return scheduled.body === body
    },
    
    actions: {

        onThreadClick(threadId) {
            this.setActiveThread(threadId);
        },

        onSend(body) {
            let now = (new Date()).getTime();
            let scheduledMessage = {
                body: body,
                threadId: this.get('activeThread.androidId'),
                uuid: now,
                createdAt: now
            };
            this.get('api').sendScheduledMessage(scheduledMessage);
            this.onNewScheduledMessage({scheduledMessage: scheduledMessage})
        },

    }

});