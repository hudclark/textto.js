import Ember from 'ember'

export default Ember.Component.extend({

    classNames: ['setting-item'],

    settings: Ember.inject.service(),

    didInsertElement () {
        this._super(...arguments)

        // Get current value of setting
        const value = this.getSetting()
        this.set('value', value)
    },

    changeSetting (name, value) {
        console.log('Updating ' + name + ' to ' + value)
        this.get('settings').putSetting(name, value)
        this.set('value', value)
    },

    getSetting () {
        const name = this.getName()
        return this.get('settings').getSetting(name, this.get('default'))
    },

    getName () {
        return this.get('setting')
    },

    actions: {

        changeBooleanSetting () {
            const newValue = !this.getSetting()
            const name = this.getName()
            this.changeSetting(name, newValue)
        },

        changeNumberSetting () {
            const name = this.getName()
            const newValue = this.get('value')
            this.changeSetting(name, newValue)
        },

        changeTextSetting () {
            const name = this.getName()
            const newValue = this.get('value')
            this.changeSetting(name, newValue)
        }

    }

})