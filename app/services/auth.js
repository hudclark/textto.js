import Ember from 'ember';
import config from '../config/environment';

export default Ember.Service.extend({

    AUTH_TOKEN_KEY: 'ajwt',
    REFRESH_TOKEN_KEY: 'rjwt',

    _authToken: null,
    _refreshToken: null,

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
        return this.getAuthToken() != null;
    },

    logOut() {
        this.setAuthToken(null);
        this.setRefreshToken(null);
    },

    refreshToken() {
        let token = this.getRefreshToken();
        let url = config.host + "/refreshToken"
        let options = {
            method: 'post',
            contentType: 'application/json',
            data: JSON.stringify({token: token})
        };
        return new Ember.RSVP.Promise((resolve, reject) => {
            Ember.$.ajax(url, options)
                .then((result) => {
                    if (result.token) {
                        this.setAuthToken(result.token);
                        resolve("Refreshed.");
                    }
                    reject("Unable to refresh token.");
                })
                .catch((error) => {
                    if (error.status == 401) {
                        this.logOut();
                    }
                    console.log("Error refreshing token");
                    reject(error);
                });
        });
    }

});