import Ember from 'ember'

export default Ember.Service.extend({
    encryption: Ember.inject.service(),

    _decryptMessage (message) {
        if (message.type === 'mms' && message.parts) {
            return Promise.all(
                message.parts
                    .map(part => {
                        let promise = null
                        if (part.contentType.indexOf('text') !== -1) {
                            promise = this.get('encryption').decrypt(part.data)
                                .then(plaintext => part.data = plaintext)
                        } else if (part.thumbnail && part.thumbnail.length) {
                            promise = this.get('encryption').decrypt(part.thumbnail)
                                .then(plaintext => part.thumbnail = plaintext)
                        }
                        if (promise && promise.catch) {
                            promise.catch(e => message.encryptionError = true)
                        }
                        return promise
                    })
            )
        }
        else if (message.body) {
            return this.get('encryption').decrypt(message.body)
                .then(plaintext => message.body = plaintext)
                .catch(e => message.encryptionError = true )
        }

        return null
    },

    _decryptMessages (messages) {
        return Promise.all(
            messages
                .filter(message => (message.encrypted == true))
                .map(message => this._decryptMessage(message))
        )
    },

    _decryptThread (thread) {
        return this.get('encryption').decrypt(thread.snippet)
            .then(plaintext => thread.snippet = plaintext)
            .catch(e => thread.snippet = 'Unable to decrypt message.')
    },

    _decryptThreads (threads) {
        return Promise.all(
            threads
                .filter(thread => (thread.encrypted &&
                     (thread.snippet.indexOf('You sent') === -1 && thread.snippet.indexOf('You received') === -1)))
                .map(thread => this._decryptThread(thread))
        )
    },

    async _encryptionEnabled() {
        await this.get('encryption').finishInit()
        return this.get('encryption').enabled()
    },

    // REST middleware ====================

    async getMessages (response) {
        try {
            await this._decryptMessages(response.messages)
        } catch (e) {
            console.log(e)
        }
        return response
    },

    async getAllMessages (response) {
        try {
            await Promise.all([
                this._decryptMessages(response.messages),
                this._decryptMessages(response.scheduledMessages)
            ])
        } catch (e) {
            console.log(e)
        }
        return response
    },

    async getThreads (response) {
        try {
            await this._decryptThreads(response.threads)
        } catch (e) {
            console.log(e)
        }
        return response
    },


    /**
     * 'Pre' middleware
     * @param {*} scheduledMessage 
     */
    async postScheduledMessage (scheduledMessage) {
        const enabled = await this._encryptionEnabled()

        const postBody = {
            encrypted: scheduledMessage.encrypted || false,
            body: scheduledMessage.body,
            threadId: scheduledMessage.threadId,
            uuid: scheduledMessage.uuid,
            filename: scheduledMessage.filename
        }

        if (enabled && scheduledMessage.body) {
            const body = await this.get('encryption').encrypt(scheduledMessage.body)
            postBody.encrypted = true
            postBody.body = body
        }

        return {
            method: 'post',
            contentType: 'application/json',
            data: JSON.stringify(postBody)
        }
    },

    // Websocket events =============

    async decryptWebsocketEvent(type, payload) {
        try {
            // Messages
            if (type === 'newMessage' || type === 'updateMessage' && payload.message.encrypted) {
                await this._decryptMessage(payload.message)
            }

            else if (type === 'newScheduledMessage' || type === 'updateScheduledMessage' || type === 'deleteScheduledMessage' && payload.scheduledMessage.encrypted) { 
                await this._decryptMessage(payload.scheduledMessage)
            }

            else if (type === 'newThread' && payload.thread.encrypted) {
                await this._decryptThread(payload.thread)
            }
        } catch (e) {
            console.log(e)
        }

        return payload


    }

})