import Ember from 'ember';

export default Ember.Helper.helper(function(params, hash) {
    let contacts = hash.contacts;
    let addresses = hash.addresses;
    if (!contacts || !addresses) return null;

    // Want: a list of contact names or addresses
    const normalize = (addr) => addr.replace(/\D/g, '')

    const recipients = addresses.map(address => {
        const regex = new RegExp(`${normalize(address)}$`)
        const matchedContact = contacts.find(contact => {
            const normalizedContact = normalize(contact.address)
            return regex.test(normalizedContact)
        })

        if (matchedContact && matchedContact.name) {
            return matchedContact.name
        } else {
            return address
        }
    })

    return recipients.join(', ')
});