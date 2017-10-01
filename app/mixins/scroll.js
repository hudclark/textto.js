import Ember from 'ember'

export default Ember.Mixin.create({

    selector: null,
    eventName: null,

    /*
    {
        debounce: number,
        selector: string,
        namespace: string
    }
    */
    bindScrolling (options) {
        this.selector = (options.selector) ? options.selector : window
        this.eventName = (options.namespace) ? `scroll.${options.namespace}` : 'scroll'
        const onScroll = (options.debounce) ?
            () => Ember.run.debounce(this, this.scrolled, options.debounce) : () => this.scrolled
        $(this.selector).on(this.eventName, onScroll)
    },

    unbindScrolling () {
        $(this.selector).off(this.eventName)
    }

})