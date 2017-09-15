import Ember from 'ember';
import config from '../config/environment';

export default Ember.Service.extend({

    PING_TIMEOUT: 2 * 1000,
    PING_INTERVAL: 5 * 1000,
    _pingTimeout: null,
    _pongTimeout: null,
    _ws: null,

    auth: Ember.inject.service(),
    bus: Ember.inject.service(),

    hasRetried: false,

    _ping() {
        if (!this.isConnected()) {
            this._pingFailed()
            return
        }
        this._ws.send('ping');
        this._pingTimeout = setTimeout(() => {
            this._pingFailed()
        }, this.PING_TIMEOUT);
    },

    _pingFailed() {
        console.log('ping failed')
        this._pingTimeout = null;
        this.hasLostConnection = true
        if (this._ws !== null) this._ws.close()
        this._ws = null
        this.connect()
    },

    // Called when server sends 'pong'
    _pong () {
        console.log('pong')
        clearTimeout(this._pingTimeout);
        this._pongTimeout = setTimeout(() => {
            this._ping();
        }, this.PING_INTERVAL)
    },

    _onMessage(event) {
        if (event.data === 'pong') {
            this._pong();
            return;
        }
        let message = null
        try {
            message = JSON.parse(event.data);
        } catch (err) {
            console.error("Error parsing ws event " + err);
        }
        if (message) this.get('bus').post(message.type, message.payload);
    },

    _onOpen() {
        console.log("WS opened");
        this._ws.onmessage = (event) => { this._onMessage(event); };
        this._ws.onclose = () => { this._onClose(); };
        this.hasRetried = false;
        // start pinging
        this._ping();

        if (this.hasLostConnection) {
            console.log('Sending reconnection event')
            this.get('bus').post('websocketReconnected')
        }
        this.hasLostConnection = false
    },

    async _onCloseWithRetry(err) {
        console.log('retrying')
        try {
            // TODO need a way to find out if it was an auth error or something else
            await this.get('auth').refreshToken();
            let url = this._getUrl();
            this._ws = new WebSocket(url);
            this._ws.onopen = () => { this._onOpen(); };
            this._ws.onclose = (err) => { this._onClose(err); };
        } catch (err) {
            this.get('bus').post('websocketConnectionLost');
        }
    },

    _onClose(err) {
        console.log('Websocket closed', err)
        this.hasLostConnection = true
        this._ws = null;
    },

    _getUrl() {
        return config.wsHost + "?token=" + this.get('auth').getAuthToken();
    },

    isConnected() {
        return (this._ws && (this._ws.readyState === this._ws.OPEN || this._ws.readyState == this._ws.CONNECTING))
    },

    ensureConnected () {
        if (this.isConnected()) return
        this.connect()
    },

    connect () {
        console.log("Attempting to establish websocket connection");
        this._ws = new WebSocket(this._getUrl());
        this._ws.onopen = () => { this._onOpen(); };
        this._ws.onclose = (err) => { this._onCloseWithRetry(err); };
    },

    close () {
        clearTimeout(this._pingTimeout)
        clearTimeout(this._pongTimeout)
        if (this.isConnected()) this._ws.close()
        this.hasLostConnection = false
    }

});