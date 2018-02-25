import Ember from 'ember';

const emojiRegex = new RegExp(
    '\ud83c[\udf00-\udfff]|\ud83d[\udc00-\ude4f]|\ud83d[\ude80-\udeff]| ', 'g'
)

export default Ember.Component.extend({

    tagName: 'message-view',
    classNameBindings: ['received', 'hidden'],
    bus: Ember.inject.service(),

    isLoading: Ember.computed('message', 'message.sent', 'message.failed', function () {
        if (!this.get('isScheduled')) return false
        const message = this.get('message')
        if (message.sent) return false
        if (message.failed) return false
        return true
    }),

    isSingleEmoji: Ember.computed('message', function () {
        // NOTE: space on end necessary to match spaces
        const body = this.get('message.body')
        const stripped = body.replace(emojiRegex, '')
        return (stripped.length === 0)
    }),

    didReceiveAttrs () {
        this._super(...arguments)

        const message = this.get('message')
        const received = (!this.get('isScheduled') && (message.sender !== 'me'))
        this.set('received', received)
        this.set('mms', (message.type === 'mms'))
    },

    didInsertElement () {
        this._super(...arguments)
        Ember.run.scheduleOnce('afterRender', this, () => {
            if (this.get('message.failed')) {
                $('.dropdown-button').dropdown({belowOrigin: true, alignment: 'right'})
            }
            if (this.get('message.animated') || this.get('isScheduled')) {
                const delay = (this.get('mms') || this.get('message.fileUrl')) ? 800 : 100
                setTimeout(() => this.animateDown(), delay)
            }
        })
    },

    animateDown () {
        if (this.isDestroyed || this.isDestroying) return

        const outerHeight = this.$().outerHeight(true) * 2

        const amount = this.get('isScheduled') ? $('.messages')[0].scrollHeight  + outerHeight:
                                                 `+=${outerHeight}px`
        $('.messages').animate({
            scrollTop: amount
        }, 200)
    },

    actions: {

        openFailedModal () {
            this.get('bus').post('openModal', {componentName: 'failed-modal', data: {scheduledMessage: this.get('message')}})
        },

        onLoad () {
            console.log('image loaded')
        }

    }
});