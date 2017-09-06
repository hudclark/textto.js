import Ember from 'ember';
import config from '../config/environment';

export default Ember.Service.extend({

    api: Ember.inject.service(),
    websocket: Ember.inject.service(),

    AUTH_TOKEN_KEY: 'ajwt',
    REFRESH_TOKEN_KEY: 'rjwt',

    _authToken: null,
    _refreshToken: null,
    _onLogOutListeners: [],

    _refreshPromise: null,

    getAuthToken() {
        if (!this.get('_authToken')) {
            this.set('_authToken', window.localStorage.getItem(this.AUTH_TOKEN_KEY));
        }
        return this.get('_authToken');
    },

    setAuthToken(token) {
        this.set('_authToken', token);
        window.localStorage.setItem(this.AUTH_TOKEN_KEY, token);
    },

    getRefreshToken() {
        if (!this.get('_refreshToken')) {
            this.set('_refreshToken', window.localStorage.getItem(this.REFRESH_TOKEN_KEY));
        }
        return this.get('_refreshToken');
    },

    setRefreshToken(token) {
        this.set('_refreshToken', token);
        window.localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
    },

    isLoggedIn() {
        let token = this.getRefreshToken();
        return token != null && token != 'null';
    },

    async logOut() {
        const refreshToken = this.getRefreshToken()
        const authToken = this.getAuthToken()

        this.setAuthToken(null);
        this.setRefreshToken(null);
        this.get('websocket').close()
        this._onLogOutListeners.forEach((listener) => {
            listener.onLogOut();
        });

        const options = {
            method: 'post',
            headers: { 'x-access-token': authToken }
        }
        try {
            await this.get('api').request('/revokeToken?refreshToken=' + refreshToken, options)
        } catch (err) {
            console.log('Error logging out', err)
        }
    },

    refreshToken() {
        if (this._refreshPromise == null) {
            let token = this.getRefreshToken();
            let url = config.host + "/refreshToken"
            let options = {
                method: 'post',
                contentType: 'application/json',
                data: JSON.stringify({token: token})
            };
            this._refreshPromise = new Ember.RSVP.Promise((resolve, reject) => {
                Ember.$.ajax(url, options)
                    .then((result) => {
                        this._refreshPromise = null
                        if (result.token) {
                            this.setAuthToken(result.token);
                            resolve("Refreshed.");
                        } else {
                            reject("Unable to refresh token.");
                        }
                    })
                    .catch((error) => {
                        this._refreshPromise = null
                        if (error.status == 401 || error.status == 404) {
                            this.logOut();
                        }
                        console.log("Error refreshing token");
                        reject(error);
                    });
            });
        }
        return this._refreshPromise
    },

    async _postGoogleCode(code, postMessage) {
        let platform;
        if (window.ELECTRON) {
            platform = "Desktop - ";
        } else {
            platform = "Web - ";
        }
        platform += navigator.platform;
        let params = {
            code: code,
            platform: platform
        };
        if (postMessage) {
            params.postmessage = true;
        }
        let options = {
            method: 'post',
            contentType: 'application/json',
            data: JSON.stringify(params)
        };
        let response = await this.get('api').request('/googleCode', options);
        if (!response.tokens) {
            throw "Unable to Sign In. Try again in a minute.";
        }
        // success
        this.setAuthToken(response.tokens.access);
        this.setRefreshToken(response.tokens.refresh);
    },

    async getGoogleCode() {

    },

    async signIn() {
        let code = null;
        let postMessage = false;
        if (window.ELECTRON) {
            // TODO
        } else {
            let result = await auth2.grantOfflineAccess({
                redirect_uri: 'postmessage',
                prompt: 'select_account'
            });
            code = result.code;
            postMessage = true;
        }
        return this._postGoogleCode(code, postMessage);
    },

    addOnLogOutListener(listener) {
        this._onLogOutListeners.push(listener);
        // TODO no remove for now because only application should subscribe.
    }

});