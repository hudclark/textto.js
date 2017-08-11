import Ember from 'ember';

export default Ember.Helper.helper(function(params, hash) {
    let contacts = hash.contacts;
    let addresses = hash.addresses;
    if (!contacts || !addresses) return null;
    let result = {};
    addresses.forEach((a) => result[a] = a);
    contacts.forEach((c) => {
        if (c.name && result[c.address]) {
            result[c.address] = twemoji.parse(c.name);
        }
    });
    let isFirst = true;
    let text;
    for (let address in result) {
        if (isFirst) {
            text = result[address];
            isFirst = false;
        } else {
            text += ", " + result[address];
        }
    }
    return text;
});