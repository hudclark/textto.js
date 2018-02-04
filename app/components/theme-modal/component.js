import ModalComponent from '../modal'

export default ModalComponent.extend({

    theme: Ember.inject.service(),
    classNames: ['theme-modal'],
    currentTab: 'all',

    didReceiveAttrs () {
        this.set('themes', this.get('theme').getAllThemes(false))
        this.set('current', this.get('theme').getCurrentThemeName())

        console.log (this.get('theme').getAllThemes(false))
        console.log(this.get('theme').getCurrentThemeName())
    },

    actions: {

        changeTheme (theme) {
            this.get('theme').setCurrentTheme(theme)
            this.set('current', theme)
        },

        openTab (tab) {
            this.set('currentTab', tab)
            if (tab === 'create') {
                let newTheme = this.get('theme').getCurrentTheme()
                this.set('newTheme', newTheme)
            }
        },

        removeTheme (theme) {
            this.get('theme').removeTheme(theme)
            if (theme == this.get('theme').getCurrentThemeName()) {
                this.get('theme').setCurrentTheme('Default')
            }
            this.set('themes', this.get('theme').getAllThemes(false))
            this.set('current', this.get('theme').getCurrentThemeName())
        },

        saveTheme () {
            const theme = this.get('newTheme')

            const validateHex = (color) => {
                if (!(theme[color] && theme[color].length === 6)) {
                    throw color + ' color is not a valid hex color.'
                }
            }

            try {
                if (!theme.name) throw 'Your theme needs a name!'
                validateHex('primary')
                validateHex('secondary')
                validateHex('primaryText')
                validateHex('secondaryText')
                validateHex('accent')
                validateHex('secondaryAccent')
                validateHex('active')
                if (!this.get('theme').isValidName(theme.name)) {
                    throw 'This is not a valid theme name.'
                }
            } catch (err) {
                this.set('error', err)
                return
            }

            // theme is valid. Save, apply, go to all themes
            this.get('theme').saveTheme(theme.name, theme)
            this.get('theme').setCurrentTheme(theme.name)

            this.set('themes', this.get('theme').getAllThemes(false))
            this.set('current', this.get('theme').getCurrentThemeName())

            this.set('currentTab', 'all')
        }

    }

})