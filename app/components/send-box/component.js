import Ember from 'ember';

export default Ember.Component.extend({

    bus: Ember.inject.service(),
    api: Ember.inject.service(),

    tagName: 'send-box',
    enabled: true,

    placeholder: Ember.computed('to', 'enabled', function () {

        if (!this.get('enabled')) {
            return 'Sign into the Textto Android app to send messages.'
        }

        let to = this.get('to');
        if (to) {
            return 'Message ' + this.get('to') + '...';
        } else {
            return 'Send a message...';
        }
    }),

    init () {
        this._super(...arguments)
        this.get('bus').register(this)
    },

    willDestoryElement () {
        this._super(...arguments)
        this.get('bus').unregister(this)
    },

    sendMessage (body) {
        const now = (new Date()).getTime()
        let scheduledMessage = {
            body: body,
            threadId: this.get('threadId'),
            uuid: now
        }
        this.get('api').sendScheduledMessage(scheduledMessage)
        scheduledMessage.uuid = "" + scheduledMessage.uuid // using biginteger
        this.get('bus').post('newScheduledMessage', {scheduledMessage: scheduledMessage})
    },

    focusOnEnd () {
        const el = this.$('send-box-input')[0]
        el.focus()
        if (typeof window.getSelection != 'undefined' &&
            typeof document.createRange != 'undefined') {
                const range = document.createRange()
                range.selectNodeContents(el)
                range.collapse(false)
                const selection = window.getSelection()
                selection.removeAllRanges()
                selection.addRange(range)
        } else if (typeof document.body.createTextRange != 'undefined') {
            const range = document.body.createTextRange()
            range.moveToElementText(el)
            range.collapse()
            range.select()
        }
    },

    onAndroidLogin () {
        this.set('enabled', true)
    },

    onNoAndroidDevice () {
        console.log('No android')
        this.set('enabled', false)
    },

    actions: {

        keyDown (e) {
            // enter pressed
            if (e.keyCode == 13 && !e.shiftKey) {
                let el = this.$('send-box-input')[0];
                const nodes = [...el.childNodes]
                const text = nodes.map((node) => {
                    if (node.alt) {
                        return node.alt
                    } else if (node.textContent.length) {
                        return node.textContent
                    } else if ($(node).is('br')) {
                        return '\n'
                    } else {
                        return ''
                    }
                }).join('')
                if (text.length) this.sendMessage(text)
                el.textContent = ''
                return false;
            } else if (e.keyCode === 8) {
                // check to see if only a single br left
                let el = this.$('send-box-input')[0];
                const nodes = [...el.childNodes]
                if (nodes.length === 1 && $(nodes[0]).is('br')) {
                    el.textContent = ''
                }
            }
        },

        paste (e) {
            e.preventDefault()
            const text = e.clipboardData.getData('text/plain')
            document.execCommand('insertHTML', false, text)
        },

        attachFile () {
            this.get('bus').post('openModal', {componentName: 'upload-modal', data: { threadId: this.get('threadId')}})
        },

        openEmojis () {
            this.set('emojisOpen', true)
        },

        closeEmojis () {
            this.set('emojisOpen', false)
            this.focusOnEnd()
        },

        emojiClick (emoji) {
            const input = this.$('send-box-input')[0].appendChild(emoji.cloneNode(true))
        }

    }

})