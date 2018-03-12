import Ember from 'ember'

export default Ember.Service.extend({

    getSetting (name, defaultValue) {
        let setting = localStorage.getItem(name)
        if (setting === null) return defaultValue
        else if (setting === 'true') setting = true
        else if (setting === 'false') setting = false
        return setting
    },

    putSetting (name, value) {
        if (value == null) {
            localStorage.removeItem(name)
            return
        } 
        else if (value === true) value = 'true'
        else if (value === false) value = 'false'
        localStorage.setItem(name, value)
    }

})