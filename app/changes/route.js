import BaseRoute from 'textto/application/base-route'

export default BaseRoute.extend({

    title: 'Change Log | Textto',

    model () {
        // TODO put this on server eventually
        // api.textto.io/change-log returns last 50 changes or something

        return [
            {
                date: 'March 12, 2018',
                description: 'Add end-to-end encryption!',
            }, {
                date: 'March 5, 2018',
                description: 'Add change log!',
            }, {
                date: 'March 5, 2018',
                description: 'Web:\n- Add drag and drop attachment of images.\n- Add pasting images directly into the text box.',
            }, {
                date: 'March 5, 2018',
                description: 'Stop adding default country codes to outgoing messages.'
            }, {
                date: 'March 5, 2018',
                description: 'Textto for Linux updated to v1.2.2.'
            }, {
                date: 'March 2, 2018',
                description: 'Textto for Windows updated to v1.2.2.'
            }, {
                date: 'Feburary 28, 2018',
                description: 'Various fixes for contact matching in group conversations.'
            }, {
                date: 'Feburary 27, 2018',
                description: 'Various fixes for international numbers and contacts.'
            }, {
                date: 'Feburary 25, 2018',
                description: 'Add support for sending messages to short codes.'
            }, {
                date: 'Feburary 22, 2018',
                description: 'Add privacy setting for notification content.'
            }, {
                date: 'Feburary 20, 2018',
                description: 'Add link previews.'
            }

        ]

    }

})
