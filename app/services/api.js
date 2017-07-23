import Ember from 'ember';
import config from '../config/environment';

export default Ember.Service.extend({

    auth: Ember.inject.service(),

    _request(url, options) {
        url = config.host + url;
        console.log("Requesting " + url);

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

        let result;
        try {
            result = await this._request(url, options);
        } catch (err) {
            if (err.status === 401) {
                console.log("Refreshing token and trying again...");
                await this.get('auth').refreshToken();
                options.headers = { 'x-access-token': this.get('auth').getAuthToken() };
                result = await this._request(url, options);
            }
        }
        // attempt to refresk token and try request.
        return result;
    },

    // Endpoints ==================
    // All requests (except from auth) should go through here.

    ping() {
        return this._request('/ping')
    },

    // thread
    getThreads() {
        return this._authenticatedRequest('/threads');
    },

    // messages
    getMessages(threadId) {
        return this._authenticatedRequest('/messages?threadId=' + threadId);
    },

    // scheduled messages
    getScheduledMessages(threadId) {
        return this._authenticatedRequest('/scheduledMessages?threadId=' + threadId);
    },

    createScheduledMessage(message) {
        let options = {
            method: 'post',
            data: JSON.stringify({scheduledMessage: message})
        };
        return this._authenticatedRequest('/scheduledMessages', options);
    },

    // user
    getUser() {
        return this._authenticatedRequest('/user');
    }

    // refresh tokens TODO

});