import Ember from 'ember'
import config from '../config/environment'

export default Ember.Service.extend({

    auth: Ember.inject.service(),
    bus: Ember.inject.service(),
    eMiddleware: Ember.inject.service('encryption-middleware'),

    RECONNECT_INTERVAL: 1000,
    PING_INTEVAL: 5000,
    PING_FAIL_TIMEOUT: 8000,
    CLOSE_CODE: 3022, // specific to this app only

    ws: null,

    pingTimeout: null,
    reconnectionTimeout: null,
    reconnectionAttempts: 0,

    isConnected () {
        const ws = this.ws
        return (ws == null) ? false : (ws.readyState < 2)
    },

    ping () {
        if (!this.isConnected()) {
            console.log('Not connected to send ping')
            return this.reconnect()
        }
        this.ws.send('ping')
        this.pingTimeout = setTimeout( () => {
            console.log('Ping failed')
            this.reconnect()
        }, this.PING_FAIL_TIMEOUT)
    },

    reconnect () {
        this.reconnectionTimeout = setTimeout( async () => {
            console.log('Reconnecting...')
            this.ws.onerror = null
            this.ws.onmessage = null
            this.ws.onopen = null
            this.ws.onclose = null
            this.get('auth').refreshToken()
                .then(() => this.connect(true))
                .catch(e => {
                    console.log('Refreshing token failed.')
                    this.reconnect() // wait agin
                })
        }, this.RECONNECT_INTERVAL)
    },

    connect (isReconnect) {
        console.log('Attemping to connect to ws...')
        const url = config.wsHost + '?token=' + this.get('auth').getAuthToken()
        this.ws = new WebSocket(url)

        const ws = this.ws

        ws.onopen = () => {
            if (isReconnect) {
                this.get('bus').post('websocketReconnected')
            }
            this.onOpen()
        }

        ws.onmessage = (msg) => {
            if (msg.data === 'pong') {
                this.onPong()
            } else {
                this.onMessage(msg)
            }
        }

        ws.onclose = (e) => {
            console.log('WS closed: ', e)
            ws.onerror = null
            ws.onmessage = null
            ws.onopen = null
            ws.onclose = null
            this.clearTimeouts()
            if (e.code !== this.CLOSE_CODE) this.reconnect()
        }

        ws.onerror = (e) => {
            console.log('WS error: ', e)
        }
    },

    clearTimeouts () {
        clearTimeout(this.pingTimeout)
        clearTimeout(this.reconnectionTimeout)
        clearTimeout(this.pongTimeout)
    },

    close () {
        console.log('Closing WS...')
        this.clearTimeouts()
        this.ws.close(this.CLOSE_CODE)
    },

    onOpen () {
        console.log('WS opened')
        // Start pinging
        this.ping()
    },

    onMessage (event) {
        try {
            const message = JSON.parse(event.data)
            const type = message.type
            this.get('eMiddleware').decryptWebsocketEvent(type, message.payload)
                .then(payload => {
                    this.get('bus').post(type, payload)
                })
        } catch (err) {
            console.log('Error decoding ws event: ', err)
        }
    },

    onPong () {
        console.log('pong')
        clearTimeout(this.pingTimeout)
        this.pongTimeout = setTimeout( () => {
            this.ping()
        }, this.PING_INTEVAL)
    }

})