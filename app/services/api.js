import Ember from 'ember';
import config from '../config/environment';

export default Ember.Service.extend({

    auth: Ember.inject.service(),
    eMiddleware: Ember.inject.service('encryption-middleware'),

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
    getThreads() {
        return this._authenticatedRequest('/threads')
            .then(response => this.get('eMiddleware').getThreads(response))
            .then(response => response.threads)
    },

    deleteThread(threadId) {
        return this._authenticatedRequest('/threads/' + threadId, {method: 'delete'})
    },

    loadMoreMessages(threadId, after) {
        let url = '/messages?threadId=' + threadId + '&after=' + after
        return this._authenticatedRequest(url)
            .then(response => this.get('eMiddleware').getMessages(response))
            .then(response => response.messages)
    },

    async getAllMessages(threadId) {
        return this._authenticatedRequest(`/messages/all?threadId=${threadId}`)
            .then(response => this.get('eMiddleware').getAllMessages(response))
    },

    async getMmsImages(partId) {
        const response = await this._authenticatedRequest('/mmsparts/' + partId + '/images')
        return response.images
    },

    // scheduled messages
    async sendScheduledMessage(message) {
        return this.get('eMiddleware').postScheduledMessage(message)
            .then(options => this._authenticatedRequest('/scheduledMessages', options))
    },

    retryFailedMessage(id) {
        let options = { method: 'post' }
        return this._authenticatedRequest('/scheduledMessages/' + id + '/retry', options)
    },

    deleteFailedMessage(id) {
        let options = { method: 'delete' }
        return this._authenticatedRequest('/scheduledMessages/' + id, options)
    },

    getUploadImageUrl () {
        return this._authenticatedRequest('/scheduledMessages/upload')
    },

    // user
    async getUser() {
        let response = await this._authenticatedRequest('/user');
        return response.user;
    },

    async getRefreshTokens () {
        const currentToken = this.get('auth').getRefreshToken()
        const response = await this._authenticatedRequest('/refreshTokens?refreshToken=' + currentToken)
        return response.tokens
    },

    textAppLink (address) {
        return this._authenticatedRequest('/user/text-link', {
            method: 'post',
            contentType: 'application/json',
            data: JSON.stringify({address: address})
        })
    },

    revokeRefreshToken (id) {
        const options = { method: 'post' }
        return this._authenticatedRequest('/revokeToken?id=' + id, options)
    },

    // contacts
    async searchContacts(q) {
        const response = await this._authenticatedRequest('/contacts/suggest?q=' + q)
        return response.contacts
    },

    syncContacts () {
        const options = { method: 'post' }
        return this._authenticatedRequest('/user/sync-contacts', options)
    },

    // admin

    getDailyStats () {
        return this._authenticatedRequest('/admin/stats/daily')
    },

    startCleaning () {
        return this._authenticatedRequest('/admin/startCleaning', {method: 'post'})
    },

    stopCleaning () {
        return this._authenticatedRequest('/admin/stopCleaning', {method: 'post'})
    },

    // news
    getNewsStory (story) {
        return this.request('/news/' + story)
    },

    // link previews
    getLinkPreview (link) {
        return this._authenticatedRequest('/link-preview?link=' + link)
    },


    donate (token, amount) {
        const options = {
            method: 'post',
            contentType: 'application/json',
            data: JSON.stringify({
                token,
                amount
            })
        }
        return this.request('/donate', options)
    }




})