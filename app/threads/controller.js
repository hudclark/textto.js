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
    scheduledMessageOrdering: ['createdAt:desc'],

    init() {
        this._super(...arguments);
        this.get('bus').register(this);
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

            this.set('_messages', request.messages);
            this.set('_scheduledMessages', request.scheduledMessages);
            $('send-box').focus();
        }
    },

    onNewMessage(payload) {
        let message = payload.message;
        this.updateThreadSnippet(message.threadId, message, message.date);
        if (this._isCurrentThread(message.threadId)) {
            this.set('_scheduledMessages', this.get('_scheduledMessages').filter((msg) => {
                if (msg.isDeleted) {
                    if ((msg.body && msg.body.includes(message.body)) || !msg.body && !message.body) {
                        return false;
                    }
                }
                return true;
            }));
            this.get('_messages').unshiftObject(message);
        }
    },

    onNewScheduledMessage(payload) {
        let message = payload.scheduledMessage;
        this.updateThreadSnippet(message.threadId, message, message.createdAt);
        if (this._isCurrentThread(message.threadId)) {
            let filtered = this.get('_scheduledMessages').filter((msg) => {
                return (message.uuid !== msg.uuid);
            });
            filtered.pushObject(message);
            this.set('_scheduledMessages', filtered);
        }
    },

    onDeleteScheduledMessage(payload) {
        let message = payload.scheduledMessage;
        if (this._isCurrentThread(message.threadId)) {
            this.get('_scheduledMessages').forEach((msg) => {
                if (msg.uuid === message.uuid) {
                    msg.isDeleted = true
                }
            });
        }
    },

    onNewThread(payload) {
        let thread = payload.thread;
        this.get('threads').unshiftObject(thread);
    },

    updateThreadSnippet(threadId, msg, time) {
        let snippet = this._getSnippetForMessage(msg);
        this.get('threads').forEach((thread) => {
            if (thread.androidId == threadId) {
                Ember.set(thread, 'snippet', snippet);
                Ember.set(thread, 'last', time);
            }
        });
    },

    _getSnippetForMessage(msg) {
        if (msg.body) return msg.body;
        let snippet = null;
        if (msg.parts) {
            msg.parts.forEach((part) => {
                if (!snippet && part.contentType.includes('image')) {
                    snippet = ((msg.sender == 'me') ? "You send an " : "You received an ") + "image";
                } else if (part.contentType == "text/plain") {
                    snippet = part.data;
                }
            });
        }
        return (snippet) ? snippet : "";
    },

    _isCurrentThread(androidId) {
        return (androidId === this.get('activeThread.androidId'));
    },
    
    actions: {

        onThreadClick(threadId) {
            this.setActiveThread(threadId);
        },

        onSend(body) {
            let now = new Date();
            let scheduledMessage = {
                body: body,
                threadId: this.get('activeThread.androidId'),
                uuid: now.getTime(),
				type: "sms"
            };
            this.get('api').sendScheduledMessage(scheduledMessage);
            this.get('_scheduledMessages').pushObject(scheduledMessage);
            this.updateThreadSnippet(scheduledMessage.threadId, scheduledMessage, now.getTime());
        },

    }

});
