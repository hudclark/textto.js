import Ember from 'ember'

export default Ember.Service.extend({

    BASE_THEMES: {

        'Default': {
            default: true,
            name: 'Default',
            primary: 'ffffff',
            primaryText: '444444',
            secondary: '374d63',
            secondaryText: 'fdf6e3',
            accent: '03a9f4',
            secondaryAccent: 'bdc3c7',
            active: '405a73'
        },

        'Night': {
            default: true,
            name: 'Night',
            primary: '303030',
            primaryText: 'cccccc',
            secondary: '212121',
            secondaryText: 'bbbbbb',
            accent: '087099',
            secondaryAccent: '424242',
            active: '303030'
        }

    },

    init () {
        this._super(...arguments)
        // insert css file
        this.injectTheme(this.getCurrentTheme())
    },

    getTheme (name) {
        // first check to see if it is a base theme
        let theme = this.BASE_THEMES[name]
        if (theme != null) theme = Object.assign({}, theme)
        else theme = localStorage.getItem(name)
        if (theme != null) {
            try {
                theme = JSON.parse(theme)
            } catch (e) { }
        }
        return theme
    },

    isValidName (name) {
        return (this.BASE_THEMES[name] == null)
    },

    saveTheme (name, theme) {
        if (!this.isValidName(name)) {
            // cant save a theme with this name
            console.log('Invalid name')
            return
        }
        delete theme.default
        try {
            theme = JSON.stringify(theme)

            const allThemes = this.getAllThemes()
            if (!allThemes.includes(name)) allThemes.push(name)
            this.setAllThemes(allThemes)
        } catch (e) { }
        localStorage.setItem(name, theme)
    },

    removeTheme (name) {
        if (this.BASE_THEMES[name] != null) return
        try {
            let allThemes = this.getAllThemes()
            allThemes = allThemes.filter(t => name !== t)
            this.setAllThemes(allThemes)
        } catch (e) { }
    },

    getAllThemes (justNames = true) {
        let allThemes = localStorage.getItem('allThemes')
        if (allThemes == null) allThemes = ['Default', 'Night']
        else {
            allThemes = JSON.parse(allThemes)
        }

        if (!justNames) {
            allThemes = allThemes.map(name => this.getTheme(name))
        }

        return allThemes
    },

    setAllThemes (themes) {
        localStorage.setItem('allThemes', JSON.stringify(themes))
    },

    setCurrentTheme (name) {
        localStorage.setItem('currentTheme', name)
        this.injectTheme(this.getTheme(name))
    },

    getCurrentTheme () {
        let name = localStorage.getItem('currentTheme')
        if (name == null) name = 'Default'
        return this.getTheme(name)
    },

    getCurrentThemeName () {
        let name = localStorage.getItem('currentTheme')
        if (name == null) name = 'Default'
        return name
    },

    hexToRGBA (hex, a) {
        const bigint = parseInt(hex, 16)
        const r = (bigint >> 16) & 255
        const g = (bigint >> 8) & 255
        const b = bigint & 255
        return `rgba(${r},${g},${b},${a})`
    },

    injectTheme (theme) {
        if (theme == null) return
        const css = `
        .threads-page .color-primary {background-color: #${theme.primary};}
        .threads-page .color-secondary {background-color: #${theme.secondary};}
        .threads-page .color-accent {background-color: #${theme.accent};}
        .threads-page .text-color-accent {color: #${theme.accent};}
        .threads-page .color-text-primary {color: #${theme.primaryText};}
        .threads-page .color-text-secondary {color: #${theme.secondaryText};}
        .threads-page .color-text-background {background-color: #${theme.secondaryText};}


        .threads-page .color-scroll-bar::-webkit-scrollbar-thumb {
            border-radius: 4px;
            background-color: #${theme.secondary};
        }

        .threads-page message-bubble {background-color: #${theme.secondaryAccent};}
        .threads-page message-view.received message-bubble {background-color: #${theme.accent};}

        .threads-page thread-view:hover {background-color: #${theme.active};}
        .threads-page thread-view.active {background-color: #${theme.active};}

        .threads-page .btn { background-color: #${theme.accent} !important; }

        .threads-page .btn:hover {
            background-color: #${theme.accent} !important;
            box-shadow: 0 4px 8px 0 rgba(0,0,0,.26);
        }

        .threads-page .btn-floating {
            background-color: #${theme.accent} !important;
        }
        .threads-page .btn-floating:hover {
            background-color: #${theme.accent} !important;
            box-shadow: 0 4px 8px 0 rgba(0,0,0,.26);
        }

        .threads-page .snippet {
            color: ${this.hexToRGBA(theme.secondaryText, 0.5)};
        }

        .threads-page .snippet.dark {
            color: #${theme.primaryText};
        }

        .threads-page .modal {
            background-color: #${theme.primary};
        }

        .threads-page .emoji-text > a {
            color: #${theme.primaryText};
        }
        .threads-page send-box-input {
            background-color: ${this.hexToRGBA(theme.secondaryAccent, 0.6)};
        }

        .threads-page send-box-input:empty:before {
            color: ${this.hexToRGBA(theme.primaryText, 0.6)};
        }

        .side-nav .material-icons {
            color: #${theme.primaryText} !important;
        }

        .modal {
            color: #${theme.primaryText};
        }
        `

        let node = document.getElementById('theme')
        if (node != null) {
            node.innerHTML = css
        } else {
            node = document.createElement('style')
            node.innerHTML = css
            node.id = 'theme'
            document.body.appendChild(node)

        }
    }


})