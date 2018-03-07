import Ember from 'ember';
import { isMatch } from '../utils/address-utils'

export default Ember.Helper.helper(function(params, hash) {
    let contacts = hash.contacts;
    let addresses = hash.addresses;
    if (!contacts || !addresses) return null;

    const recipients = addresses.map(address => {
        const matchedContact = contacts.find(contact => isMatch(address, contact.address))
        if (matchedContact && matchedContact.name) {
            return matchedContact.name
        } else {
            return address
        }
    })

    return recipients.join(', ')
});