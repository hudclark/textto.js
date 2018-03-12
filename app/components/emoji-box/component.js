import Ember from 'ember'

export default Ember.Component.extend({

    classNames: ['emoji-box', 'color-primary'],
    api: Ember.inject.service(),
    
    activeTab: 'faces',

    tabs: [
        {
            name: 'people',
            symbol: 'face',
            active: true
        },
        {
            name: 'animals_and_nature',
            symbol: 'pets',
            active: false
        },
        {
            name: 'food_and_drink',
            symbol: 'restaurant',
            active: false
        },
        {
            name: 'activity',
            symbol: 'directions_run',
            active: false
        },
        {
            name: 'travel_and_places',
            symbol: 'directions_car',
            active: false
        },
        {
            name: 'objects',
            symbol: 'work',
            active: false
        },
        {
            name: 'symbols',
            symbol: 'change_history',
            active: false
        },
        {
            name: 'flags',
            symbol: 'flag',
            active: false
        },
    ],

    q: null,

    didInsertElement () {
        this._super(...arguments)
        const tab = this.get('tabs').find((t) => t.active)
        this.send('changeTab', tab)

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
        },

        changeTab (tab) {
            this.get('tabs').forEach((t) => {
                if (t.active && t.name !== tab.name) Ember.set(t, 'active', false)
                else if (t.name === tab.name) Ember.set(t, 'active', true)
            })

            this.set('q', '')

            this.get('api').request(`/emojis/${tab.name}`)
                .then((response) => {
                    this.set('baseEmojis', response.emojis.map(e => twemoji.parse(e)))
                    this.set('showResults', false)
                    this.$('.results')[0].scrollTop = 0
                })
        }


    }

})