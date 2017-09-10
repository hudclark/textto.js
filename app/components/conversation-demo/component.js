import Ember from 'ember'

export default Ember.Component.extend({

    tagName: 'conversation-demo',

    index: 0,
    messages: [],

    threads: [
        { image: '/images/jane.png', name: 'Jane Smith', snippet: 'Let\'s catch up!' },
        { image: '/images/rob.png', name: 'Rob Moore', snippet: 'When are you leaving?' },
        { image: '/images/ellice.png', name: 'Ellice Anderson', snippet: 'It was so great catching up!' },
        { image: '/images/harrison.png', name: 'Harrison Campbell', snippet: 'You sent an image' }
    ],

    conversation: [
        {
            class: 'received',
            length: 'small',
            time: 500
        },
        {
            length: 'medium',
            body: 'Heard of Textto?',
            class: '',
            time: 1000
        },
        {
            length: 'long',
            class: 'received',
            time: 1000
        },
        {
            length: 'medium',
            class: 'received',
            time: 1000
        },
        {
            length: 'medium',
            body: 'It\'s great!',
            class: '',
            time: 1000
        },
        {
            length: 'long',
            class: 'received',
            time: 1000
        },
        {
            body: 'Yep, it\'s free!',
            length: 'medium',
            class: '',
        },
        {
            body: 'And easy to set up',
            length: 'medium',
            class: '',
        },


    ],

    didInsertElement () {
        this._super(...arguments)
        this.index = 0
        this.conversationTick()
    },

    async conversationTick() {
        if (this.isDestroyed || this.isDestroying) return
        if (this.index === this.conversation.length) {
            this.index = 0
            //this.get('messages').clear()
        }
        const messages = this.get('messages')
        const message = this.conversation[this.index]
        this.index++

        if (message.class !== 'received') {
            await this.autoType(message.body)
        }
        messages.length = (messages.length > 10) ? 10 : messages.length
        messages.unshiftObject({
            class: message.class,
            length: message.length,
        })
        setTimeout(this.conversationTick.bind(this), message.time)
    },

    autoType (input) {
        return new Ember.RSVP.Promise((resolve, reject) => {
            const letters = input.split('')
            const next = () => {
                const letter = letters.shift()
                $('send-box')[0].textContent = $('send-box')[0].textContent + letter
                if (letters.length === 0) {
                    setTimeout(() => {
                        $('send-box')[0].textContent = ''
                        resolve()
                    }, 500)
                } else {
                    setTimeout(next, 50)
                }
            }
            next()
        })
    },

})