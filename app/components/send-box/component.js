import Ember from 'ember';

export default Ember.Component.extend({

    bus: Ember.inject.service(),
    api: Ember.inject.service(),

    tagName: 'send-box',
    enabled: true,
    oldThreadId: null,

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
        this.updateCharCounter()
    },

    didUpdateAttrs () {
        this._super(...arguments)

        if (this.get('threadId') !== this.get('oldThreadId')) {
            // clear the send box when changing threads
            this.$('send-box-input')[0].textContent = ''
        }

        this.set('oldThreadId', this.get('threadId'))
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

    updateCharCounter () {
        setImmediate(() => {
            const length = this.getTextContent().length
            if (length < 140) {
                this.set('chars', `${length}/140`)
                this.set('type', 'sms')
            } else {
                this.set('chars', null)
                this.set('type', 'mms')
            }
        })
    },

    getTextContent () {
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

        return text
    },

    actions: {

        keyDown (e) {
            // enter pressed

            let returnVal = true

            if (e.keyCode == 13 && !e.shiftKey) {
                const text = this.getTextContent()
                if (text.length) this.sendMessage(text)
                this.$('send-box-input')[0].textContent = ''
                returnVal = false
            } else if (e.keyCode === 8) {
                // check to see if only a single br left
                let el = this.$('send-box-input')[0];
                const nodes = [...el.childNodes]
                if (nodes.length === 1 && $(nodes[0]).is('br')) {
                    el.textContent = ''
                }
            }

            this.updateCharCounter()
            return returnVal
        },

        paste (e) {
            e.preventDefault()

            // Can we get an image?
            const items = (e.clipboardData || e.originalEvent.clipboardData).items

            // Was an image pasted?
            let file = null
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    file = items[i].getAsFile()
                    break
                }
            }

            // Just images right now
            if (file != null) {
                this.get('bus').post('openModal', {
                    componentName: 'upload-modal', data: {
                         threadId: this.get('threadId'),
                         file: file
                        }
                    })
            } else {
                const text = e.clipboardData.getData('text/plain')
                document.execCommand('insertHTML', false, text)
            }

            this.updateCharCounter()
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
            this.updateCharCounter()
        }

    }

})