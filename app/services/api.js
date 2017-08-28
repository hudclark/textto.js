import Ember from 'ember';
import config from '../config/environment';

export default Ember.Service.extend({

    auth: Ember.inject.service(),

    request(url, options) {
        url = config.host + url;
        options = options || {};
        return new Ember.RSVP.Promise((resolve, reject) => {
            Ember.$.ajax(url, options)
                .then((result) => resolve(result))
                .catch((error) => reject(error));
        });
    },

    async _authenticatedRequest(url, options) {
        options = options || {};
        options.headers = { 'x-access-token': this.get('auth').getAuthToken() };
        let result = null;

        try {
            result = await this.request(url, options);
        } catch (err) {
            // auth token expired
            // if unable to refresh tokens, throw an exception and auth will transition to login route.
            if (err.status === 401) {
                await this.get('auth').refreshToken();
                options.headers = { 'x-access-token': this.get('auth').getAuthToken() };
                result = await this.request(url, options);
            }
            // If error is not an expired token, throw original error.
             else {
                throw err;
            }
        }
        return result;
    },

    // Endpoints ==================
    // All requests (except from auth) should go through here.

    // general
    ping() {
        return this.request('/ping')
    },

    // thread
    async getThreads() {
        let response = await this._authenticatedRequest('/threads');
        return response.threads;
    },

    // messages
    async getMessages(threadId) {
        let response = await this._authenticatedRequest('/messages?threadId=' + threadId);
        return response.messages;
    },

    async loadMoreMessages(threadId, after) {
        let url = '/messages?threadId=' + threadId + '&after=' + after
        const response = await this._authenticatedRequest(url)
        return response.messages
    },

    getAllMessages(threadId) {
        return this._authenticatedRequest(`/messages/all?threadId=${threadId}`)
    },

    // scheduled messages
    async getScheduledMessages(threadId) {
        let response = await this._authenticatedRequest('/scheduledMessages?threadId=' + threadId);
        return response.scheduledMessages;
    },

    sendScheduledMessage(message) {
        let options = {
            method: 'post',
            contentType: 'application/json',
            data: JSON.stringify(message)
        };
        return this._authenticatedRequest('/scheduledMessages', options);
    },

    retryFailedMessage(id) {
        let options = { method: 'post' }
        return this._authenticatedRequest('/scheduledMessages/' + id + '/retry', options)
    },

    deleteFailedMessage(id) {
        let options = { method: 'delete' }
        return this._authenticatedRequest('/scheduledMessages/' + id, options)
    },

    // user
    async getUser() {
        let response = await this._authenticatedRequest('/user');
        return response.user;
    },

    // refresh tokens TODO

    // contacts
    async searchContacts(q) {
        const response = await this._authenticatedRequest('/contacts?suggest=true&q=' + q)
        return response.contacts
    }


    // TODO
    // can add subscribe and unsubscribe methods.
    // have event-bus style subscribers.
    // if (subscriber.onNewMessage) {...}
    // if (subscriber.onFailedScheduledMessage) {...}
    // etc.

});