import Ember from 'ember'

const SETTINGS_KEY = 'ekey'
const ENCRYPTION_ALG = 'AES-CBC'

export default Ember.Service.extend({

    /* Current Cryptokey or null if not set */
    _key: null,

    /* Whether or not this service has finished initalizing */
    _initializing: false,

    settings: Ember.inject.service(),

    async init () {
        this._super(...arguments)
        this._initializing = true

        // Make sure that crypto is supprted before continuting
        if (!this.browserSupported()) return

        const sKey = this.get('settings').getSetting(SETTINGS_KEY, null)
        if (sKey == null) {
            this._key = null
        } else {
            this._key = await this._importKey(sKey)
        }
        this._initializing = false
    },

    /**
     * Returns true if this browser supports encryption.
     */
    browserSupported () {
        return (
            crypto                  &&
            crypto.subtle           &&
            crypto.subtle.deriveKey &&
            TextEncoder             &&
            TextDecoder
        )
    },

    /**
     * Returns true if a key is present.
     * 
     * @returns boolean
     */
    enabled () {
        return (this._key != null)
    },

    /**
     * Removes the old key.
     */
    disableEncryption () {
        this.get('settings').putSetting(SETTINGS_KEY, null)
        this._key = null
    },

    /**
     * 
     * Validates the password and derives and sets a new encrytion password
     * 
     * @argument password a plaintext password
     * 
     * @returns promise<string>
     */
    async setPassword (password, salt = 'textto') {
        if (!password || password.length < 4) {
            throw 'Password must be at least 4 characters long'
        }

        // Derive key
        const key = await this.deriveKey(password, salt)

        // Set current key
        this._key = key

        // Save current key
        const buffer = await crypto.subtle.exportKey('raw', key)
        this.get('settings').putSetting(SETTINGS_KEY, this._bufferToHex(buffer))

        return 'Success!'
    },

    /**
     * Encrypts the plaintext with the saved key.
     * 
     * Throws an exception is encryption is not enabled.
     * 
     * @returns Promise<ciphertext>
     */
    async encrypt (plaintext) {
        await this.finishInit()

        if (!this.enabled()) {
            throw 'Encryption is not enabled'
        }

        const iv = this._generateIv()
        const alg = {name: ENCRYPTION_ALG, iv}

        return crypto.subtle.encrypt(alg, this._key, this._stringToBuffer(plaintext))
            .then(buffer => this._bufferToHex(iv) + this._bufferToHex(buffer))
    },

    /**
     * Decrypts the ciphertext with the saved key.
     * 
     * Throws an exception000 is encryption is not enabled.
     * 
     * @returns Promise<plaintext>
     */
    async decrypt (ciphertext) {
        await this.finishInit()

        if (!this.enabled()) {
            throw 'Encryption is not enabled'
        }

        // First 32 bytes are hex-encoded iv
        const ivPart = ciphertext.slice(0, 32)
        const cipherPart = ciphertext.slice(32)

        const iv = this._hexToBuffer(ivPart)
        const alg = {name: ENCRYPTION_ALG, iv}

        return crypto.subtle.decrypt(alg, this._key, this._hexToBuffer(cipherPart))
            .then(buffer => this._bufferToString(buffer))
    },

    // Helpers

    /**
     * Resolves when initialization has completed.
     * 
     * @returns Promise
     */
    async finishInit () {
        if (this._initializing == false) return true
        else {
            await this._wait(10)
            return this.finishInit()
        }
    },

    /**
     * Derives a key using PBKDF2 from a password and salt.
     * 
     * @returns Promise<string>
     */
    async _deriveKey (password, salt) {
        const base = await crypto.subtle.importKey(
            'raw',
            this._stringToBuffer(password),
            {name: 'PBKDF2'},
            false,
            ['deriveKey']
        )
        return crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                iterations: 3747,
                hash: 'SHA-256',
                salt: this._stringToBuffer(salt)
            },
            base,
            {name: ENCRYPTION_ALG, 'length': 128},
            true,
            ['encrypt', 'decrypt']
        )
    },

    /**
     * Imports a CryptoKey from a buffer.
     * 
     * @returns Promise
     */
    _importKey (hexKey) {
        const buffer = this._hexToBuffer(hexKey)
        return crypto.subtle.importKey('raw', buffer, {name: ENCRYPTION_ALG}, false, ['encrypt', 'decrypt'])
    },

    /**
     * Generates a new, random IV
     */
    _generateIv () {
        return new Uint8Array(
            window.crypto.getRandomValues(new Uint8Array(16))
        )
    },

    /**
     * Prommisifys a timeout
     * 
     * @returns Promise
     */
    _wait (length) {
        return new Promise((resolve) => {
            setTimeout(() => resolve(), length)
        })
    },

    // String utilities

    _stringToBuffer (str) {
        return new TextEncoder('utf-8').encode(str)
    },
    
    _bufferToString (buff) {
        return new TextDecoder('utf-8').decode(buff)
    },

    _bufferToHex (buffer) {
        return Array.prototype.map.call(new Uint8Array(buffer), byte => {
            const str = byte.toString(16)
            const ret = (str.length < 2) ? '0' + str : str
            return ret
        }).join('')
    },

    _hexToBuffer (hex) {
        const bytes = []
        for (let i = 0; i < hex.length; i += 2) {
            bytes.push(Number.parseInt(hex.slice(i, i + 2), 16))
        }
        return new Uint8Array(bytes)
    }

})