import Ember from 'ember';

export default Ember.Service.extend({

    _subscribers: [],

    register(subscriber) {
        this._subscribers.pushObject(subscriber);
    },

    unRegister(subscriber) {
        this._subscribers.removeObject(subscriber);
    },

    post(event, data) {
        this._subscribers.forEach((sub) => {
            let func = sub[event];
            if (typeof func === 'function') {
                func.bind(sub)(data);
            }
        });
    },

});