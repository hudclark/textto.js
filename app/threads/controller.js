import Ember from 'ember';

export default Ember.Controller.extend({

    api: Ember.inject.service(),

    threads: [],
    messages: [],
    activeThread: null,

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
            this.get('messages').clear();
            this.get('threads').forEach((thread) => {
                if (thread.androidId === activeId) {
                    Ember.set(thread, 'active', false);
                } else if (thread.androidId === androidId) {
                    Ember.set(thread, 'active', true);
                    newActiveThread = thread;
                }
            });
            this.set('activeThread', newActiveThread);
            let messages = await this.get('api').getAllMessages(androidId);
            this.set('messages', messages);
        }
    },
    
    actions: {

        onThreadClick(threadId) {
            this.setActiveThread(threadId);
        },

        onSend(message) {
            console.log(message);
        }

    }


});