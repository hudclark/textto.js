import Ember from 'ember'

export default Ember.Component.extend({

    classNames: ['encryption-setup'],
    settings: Ember.inject.service(),
    encryption: Ember.inject.service(),
    api: Ember.inject.service(),
    stage: null,

    title: Ember.computed('stage', function () {
        const stage = this.get('stage')
        switch (stage) {
            case 0:
                return 'Set a Master Password'
            case 1:
                return 'Important Information!'
            case 2:
                return 'Enter Master Password'
            case 3:
                return "You're Set!"
            case 4:
                return 'Not supported.'
        }
    }),

    description: Ember.computed('stage', function () {
        const stage = this.get('stage')
        switch (stage) {
            case 0:
                return 'Setting a master password will enable end-to-end encryption. For more information, visit <a target="_blank" href="https://textto.io/e2e">https://textto.io/e2e</a>.'
            case 1:
                return 'You <i><strong>must</strong></i> have the same master password in the Android app\'s settings screen.<br><br><strong>If they do not match, your messages <i>will not</i> send.</strong>'
            case 3:
                return 'The content of your messages will now be encrypted.<br><br>Messages not sending? Make sure you\'ve set the same master password in the Android application.'
            case 4:
                return 'Your browser does not support encryption. Please change to Safari, Chrome, or Firefox.'
        }

    }),


    showNext: Ember.computed('stage', function () {
        const stage = this.get('stage')
        return (stage === 0 || stage === 1)
    }),

    showBack: Ember.computed('stage', function () {
        const stage = this.get('stage')
        return (stage === 1 || stage === 2)
    }),

    async didInsertElement () {
        this._super(...arguments)

        // Wait for encryption to finish initialization
        try {
            const encryption = this.get('encryption')
            await encryption.finishInit()

            // Is encryption already enabled?
            const enabled = encryption.enabled()
            console.log(enabled)
            this.set('stage', (enabled) ? 3 : 0)

            // Does this browser support encryption?
            const browserSupported = encryption.browserSupported()
            if (!browserSupported) {
                this.set('stage', 4)
            }
        } catch (e) {
            console.error(e)
        }
    },

    advanceStage () {
        this.set('stage', this.get('stage') + 1)
    },

    decrementStage () {
        this.set('stage', this.get('stage') - 1)
    },

    actions: {

        decrementStage () {
            this.decrementStage()
        },

        advanceStage () {
            this.advanceStage()
        },

        skip () {
            this.sendAction('on-skip')
        },

        async setPassword () {
            this.set('passwordError', null)
            const password = this.get('password')
            this.set('isDerivingPassword', true)
            try {
                const user = await this.get('api').getUser()
                await this.get('encryption').setPassword(password, user.email)
                // Success!
                this.set('password', null)
                this.set('stage', 3)

                setTimeout( () => {
                    this.sendAction('on-enabled')
                }, 500)

            } catch (e) {
                this.set('passwordError', e)
            }
            this.set('isDerivingPassword', false)
        },

        changePassword () {
            if (confirm('Are you sure you want to change your master password? If you do, you\'ll have to update your password on the Android app')) {
                this.set('stage', 2)
            }
        },

        disable () {
            if (confirm('Are you sure you want to disable end-to-end encryption? You\'ll also need to disable it on the Android app.')) {
                this.get('encryption').disable()
                this.set('stage', 0)
            }
        }

    }

})