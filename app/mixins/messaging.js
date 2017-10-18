import Ember from 'ember'

export default Ember.Mixin.create({

    messageReplacesScheduledMessage (message, scheduled) {
        if (!(scheduled.sent || scheduled.isDeleted)) return false

        // TODO could verify addresses

        // TODO no good way to verify this
        if (scheduled.filename && message.parts && message.parts[0] && message.parts[0].contentType.includes('image')) {
            return true
        }

        const messageBody = this.getMessageBody(message)
        return (scheduled.body === messageBody)
    },

    getMessageBody (message) {
        let body = message.body
        if (!body && message.parts) {
            const part = message.parts.find(p => (p.contentType === 'text/plain'))
            if (part) body = part.data
        }
        return body
    },

    getMessageSnippet (message) {
        let snippet = this.getMessageBody(message)
        if (!snippet && message.parts) {
            const image = messages.parts.find(p => (p.contentType.includes('image')))
            if (image) {
                snippet = 'You' + ((message.sender === 'me') ? 'sent ' : 'received') + ' an image'
            }
        }
        return snippet
    }

})