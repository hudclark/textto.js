import BaseRoute from 'textto/application/base-route'

export default BaseRoute.extend({
    title: 'Downloads | Textto',

    getOs () {
        const userAgent = window.navigator.userAgent
        const platform = window.navigator.platform

        if ($(window).width() < 1000) {
            return 'mobile'
        }

        if (['Macintosh', 'MacIntel', 'MacPPC', 'Mac68k'].indexOf(platform) !== -1) {
            return 'mac'
        }
        if (['Win32', 'Win64', 'Windows', 'WinCE'].indexOf(platform) !== -1) {
            return 'windows'
        }
        if ([/Linux/.test(platform)]) {
            return 'linux'
        }
    },

    model () {
        const model = {}
        model[this.getOs()] = true
        return model
    },

    actions: {

        openWeb () {
            this.transitionTo('threads')
        }
    }

})