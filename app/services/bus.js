import Ember from 'ember';

export default Ember.Service.extend({

    _subscribers: [],

    register(subscriber) {
        this._subscribers.pushObject(subscriber);
    },

    unregister(subscriber) {
        this._subscribers.removeObject(subscriber);
    },

    post(event, data) {
        // eventName 'event' => 'onEvent'
        let eventName = "on" + event.capitalize();
        this._subscribers.forEach((sub) => {
            let func = sub[eventName];
            if (typeof func === 'function') {
                func.bind(sub)(data);
            }
        });
    },

});