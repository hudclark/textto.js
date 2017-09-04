import Ember from 'ember';
import config from '../config/environment';

export default Ember.Service.extend({

    PING_TIMEOUT: 10 * 1000,
    PING_INTERVAL: 10 * 1000,
    _pingTimeout: null,
    _ws: null,

    auth: Ember.inject.service(),
    bus: Ember.inject.service(),

    hasRetried: false,

    _ping() {
        this._ws.send('ping');
        this._pingTimeout = setTimeout(() => {
            console.log("websocket connection lost");
            this._pingTimeout = null;
            if (!this.hasRetried) {
                this.hasRetried = true;
                this.ensureConnected();
            } else {
                bus.post('websocketConnectionLost');
            }
        }, this.PING_TIMEOUT);
    },

    _pong() {
        clearTimeout(this._pingTimeout);
        setTimeout(() => {
            this._ping();
        }, this.PING_INTERVAL)
    },

    _onMessage(event) {
        if (event.data === 'pong') {
            this._pong();
            console.log('ping');
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
    },

    async _onCloseWithRetry(err) {
        try {
            // TODO need a way to find out if it was an auth error or something else
            await this.get('auth').refreshToken();
            let url = this._getUrl();
            this._ws = new WebSocket(url);
            this._ws.onopen = () => { this._onOpen(); };
            this._ws.onclose = () => { this._onClose(); };
        } catch (err) {
            this.get('bus').post('websocketConnectionLost');
        }
    },

    _onClose() {
        console.log("WS closed");
        this._ws = null;
    },

    _getUrl() {
        return config.wsHost + "?token=" + this.get('auth').getAuthToken();
    },

    isConnected() {
        return (this._ws && this._ws.readyState !== this._ws.CLOSED);
    },

    ensureConnected() {
        if (this.isConnected())  {
            return;
        }
        console.log("Attempting to establish websocket connection");
        this._ws = new WebSocket(this._getUrl());
        this._ws.onopen = () => { this._onOpen(); };
        this._ws.onclose = (err) => { this._onCloseWithRetry(err); };
    },

    close () {
        if (this._ws) this._ws.close()
    }

});