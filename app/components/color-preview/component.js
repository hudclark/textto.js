import Ember from 'ember'

export default Ember.Component.extend({

    tagName: 'color-preview',

    hex: Ember.computed('color', function() {
        const color = '#' + this.get('color')
        return Ember.String.htmlSafe("background-color: " + color);
    })
})