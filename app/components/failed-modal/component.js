export default Ember.Component.extend({

    bus: Ember.inject.service(),

    classNames: ['modal', 'failed-modal'],
    api: Ember.inject.service(),

    failureCodes: {
        1: {
            error: 'Your phone carrier has reported a generic failure. This can happen if more than 30 messages are sent over a 30 minute period.',
            solution: 'Try sending this message again in a minute -- Android may be limiting the messages sent.'
        },
        2: {
            error: 'You phone serivce is turned off.',
            solution: 'Ensure your mobile service is on and active.'
        },
        3: {
            error: 'Your phone was unable to send a mms message.',
            solution: 'Ensure your current plan allows for mms messages to be sent.'
        },
        4: {
            error: 'Your phone does not have service',
            solution: 'Ensure your phone has service and attempt to send the message again.'
        }, 
        'not-sent': {
            error: 'Textto timed out attempting to connect to your phone.',
            solution: 'Ensure your phone is connected to the internet and you are signed into the Textto Android application.'
        },
        'unknown': {
            error: 'We were unable to send your message',
            solution: 'Ensure your phone is connected to the internet and is in service.'
        }
    },

    didInsertElement () {
        this._super(...arguments)
        this.get('bus').register(this)
        Ember.run.scheduleOnce('afterRender', this, () => {
            $('.modal').modal({
                complete: () => {
                    this.get('bus').post('closeModal')
                }
            })
            $('.modal').modal('open')
        })
    },

    didReceiveAttrs () {
        const message = this.get('data.scheduledMessage')

        if (!message.sent) {
            this.set('problem', this.failureCodes['not-sent'])
        } else {
            const failureCode = message.failureCode
            let problem = this.failureCodes[failureCode]
            if (!problem) {
                problem = this.failureCodes['unknown']
            }
            this.set('problem', problem)
        }

        this.set('snippet', (message.body) ? message.body : 'You sent an image.')
    },

    willDestoryElement () {
        this._super(...arguments)
        this.get('bus').unregister(this)
    },

    actions: {

        retry: function () {
            const id = this.get('data.scheduledMessage._id')
            this.get('api').retryFailedMessage(id)
            this.get('bus').post('retryScheduledMessage', {id})
            $('.modal').modal('close')
        },

        delete: function () {
            const id = this.get('data.scheduledMessage._id')
            this.get('api').deleteFailedMessage(id)
            this.get('bus').post('removeScheduledMessage', {id})
            $('.modal').modal('close')
        },
    }

})