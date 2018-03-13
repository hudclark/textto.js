import Ember from 'ember';
import config from '../config/environment';
import require from 'require'

export default Ember.Service.extend({

    api: Ember.inject.service(),
    websocket: Ember.inject.service(),
    bus: Ember.inject.service(),
    encryption: Ember.inject.service(),


    AUTH_TOKEN_KEY: 'ajwt',
    REFRESH_TOKEN_KEY: 'rjwt',

    _authToken: null,
    _refreshToken: null,

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

    getBrowser () {
        let browser = ['Chrome', 'Firefox', 'MISE', 'Safari', 'Opera']
            .find((b) => navigator.userAgent.search(b) > 0)

        if (browser != null && $(window).width() < 800) {
            browser = browser + ' Mobile'
        }
        
        return (browser != null) ? browser : navigator.platform
    },

    async logOut() {
        const refreshToken = this.getRefreshToken()
        const authToken = this.getAuthToken()

        // Clear master password
        this.get('encryption').disable()

        this.setAuthToken(null);
        this.setRefreshToken(null);
        this.get('websocket').close()
        this.get('bus').post('logout')

        const options = {
            method: 'post',
            headers: { 'x-access-token': authToken }
        }

        if (refreshToken == null || refreshToken == 'null') {
            return
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
            platform = "Desktop";
        } else {
            platform = this.getBrowser();
        }
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

    async signIn() {
        let code = null;
        let postMessage = false;
        if (window.ELECTRON) {
            code = await this.electronLogin()
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

    // used with electron
    async electronLogin() {
        const { BrowserWindow } = require('electron').remote
        const loginWindow = new BrowserWindow({
            width: 600,
            height: 800,
            show: false,
            'node-integration': false,
            'web-security': false
        })
        const googleUrl = 'https://accounts.google.com/o/oauth2/v2/auth'
        const clientId = '447535604738-jp8o5if9nhl2v2b4ba5o425up9gmn7kr.apps.googleusercontent.com'
        const redirectUri = config.host + '/redirect'
        const url = `${googleUrl}?response_type=code&scope=profile email&prompt=select_account&client_id=${clientId}&redirect_uri=${redirectUri}`

        loginWindow.loadURL(url)
        loginWindow.show()

        return new Ember.RSVP.Promise((resolve, reject) => {
            const callback = (url) => {
                const error = /\?error=(.+)$/.exec(url)
                if (error && error.length) return reject(error)
                const code = /code=([^&]*)/.exec(url)[1]
                if (code && code.length) {
                    loginWindow.destroy()
                    resolve(code)
                }
            }
            loginWindow.webContents.on('will-navigate', (event, url) => callback(url))
            loginWindow.webContents.on('did-get-redirect-request',
                (event, oldUrl, newUrl) => callback(newUrl))
        })
    },


});