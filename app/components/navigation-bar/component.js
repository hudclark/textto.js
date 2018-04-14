import Ember from 'ember'

export default Ember.Component.extend({

    classNames: ['nav-bar'],

    useDropdown: ($(window).width() < 1000),

    didInsertElement () {
        this._super(...arguments)

        Ember.run.scheduleOnce('afterRender', this, function () {
            setTimeout( () => {
                $('#nav-dropdown-trigger').dropdown({})

            }, 1000)
        })
    }

})