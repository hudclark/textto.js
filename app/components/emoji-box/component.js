import Ember from 'ember'

export default Ember.Component.extend({

    classNames: ['emoji-box', 'color-primary'],
    api: Ember.inject.service(),
    q: null,

    didInsertElement () {
        this._super(...arguments)

        this.get('api').request('/emojis')
            .then((response) => {
                this.set('baseEmojis', response.emojis.map(e => twemoji.parse(e)))
            })

        $(window).on('click.emoji', (e) => {
            const target = e.target
            if (target.classList.contains('emoji')) {
                const emoji = target.getAttribute('alt')
                if (emoji) {
                    this.sendAction('emoji-click', target)
                }
                return
            }
            if (!$('.emoji-box')[0].contains(target)) {
                this.sendAction('on-close')
            }
        })

        this.$('input').focus()
    },

    willDestroyElement () {
        this._super(...arguments)
        $(window).off('click.emoji')
    },

    actions: {

        search () {
            const q = this.get('q')
            if (!q || q.length < 3) {
                this.set('showResults', false)
                return
            }
            this.get('api').request('/emojis/search?q=' + q)
                .then((response) => {
                    this.set('searchResults', response.emojis.map(e => twemoji.parse(e)))
                    this.set('showResults', true)
                })
        }

    }

})