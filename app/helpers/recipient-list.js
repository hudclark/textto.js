import Ember from 'ember';

export default Ember.Helper.helper(function(params, hash) {
    let contacts = hash.contacts;
    let addresses = hash.addresses;
    let result = {};
    addresses.forEach((a) => result[a] = a);
    contacts.forEach((c) => {
        if (c.name && result[c.formattedNumber]) {
            result[c.formattedNumber] = twemoji.parse(c.name);
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