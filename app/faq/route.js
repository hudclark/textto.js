import BaseRoute from 'textto/application/base-route'

export default BaseRoute.extend({
    title: 'FAQ | Textto',

    model () {
        return [
            {
                section: 'General',
                questions: [
                    {
                        title: 'How do I get started with Textto?',
                        answer: `
                        <ol>
                            <li>Download the <a href="https://play.google.com/store/apps/details?id=com.moduloapps.textto">Android app</a></li>
                            <li>Sign into the Android app with your Google account.</li>
                            <li>Visit <a href="https://textto.io/login">https://textto.io/login</a> and sign in with the same Google account.</li>
                            <li>You're all done! Enjoy texting!</li>
                        </ol>
                        `
                    }, {
                        title: 'How much does Textto cost?',
                        answer: 'Textto is free to use! Standard messaging rates from your carrier will still apply!'
                    }, {
                        title: 'How do I download the Mac desktop application?',
                        answer: 'The Mac application is almost ready! Hang on and we\'ll email you when it is available.'
                    }, {
                        title: 'I wish you would add this feature!',
                        answer: 'We want to make Textto the best texting app out there. <a href="mailto:help@moduloapps.com">Let us know</a> and we\'ll look into adding it!'
                    }, {
                        title: 'How do I send pictures?',
                        answer: 'Click on the <i class="material-icons">attach_file</i> icon on the send-box. Now, select an image from your computer and hit send.'
                    }, {
                        title: 'How do I send emojis?',
                        answer: 'Click on the <i class="material-icons">tag_faces</i> icon on the send-box. From there, you can search for emojis!'
                    }, {
                        title: 'How can I remove the \'Connected to Textto\' notification on my phone?',
                        answer: 'Try long pressing the notification, and then hiding the \'Sync\' notifications.'
                    }, {
                        title: 'How can I clear my Android phone\'s texting app\'s notifications.',
                        answer: 'Make sure you\'ve enabled \'Notification Access\' in the Textto Android application. Once you\'ve done that, Textto will clear your texting app\'s notifications whenever you send a message from your computer.'
                    }, {
                        title: 'I\'ve found a bug!',
                        answer: 'Uh oh, please <a href="mailto:help@moduloapps.com">let us know</a> so we can fix it!'
                    }]
            }, {
                section: 'Ads',
                questions: [{
                    title: 'What information is given to advertisors',
                    answer: '<strong>No</strong> personal information is given to advertisors.'
                }, {
                    title: 'How can I advertise with Textto?',
                    answer: 'Email <a href="mailto:ads@moduloapps.com">ads@moduloapps.com</a>'
                }, {
                    title: 'How can I remove ads?',
                    answer: 'You can remove ads for $3.99. This support helps us keep Textto\'s servers running!'
                }]
            }, {
                section: 'Security',
                questions: [{
                    title: 'Can Textto see my messages?',
                    answer: 'If you have set a master password, then Textto uses end-to-end encryption. This means that your messages are encrypted before they ever get to Textto\'s servers. <strong>Since your master password is never sent over the internet, even those with access to our servers can never decrypt your messages.</strong><br>Read more about it <a href="/e2e">here</a>.'
                }, {
                    title: 'Are my messages encrypted?',
                    answer: "Textto uses only secure connections to/from its servers. This means that all data is encrypted when it is sent over the internet to/from Textto's servers.<br>If you set a master password, messages will additionally be encrypted with your master password. Since this password is never sent to Textto's servers, it makes sure that your messages are safe from Textto. You can read more about end-to-end encryption <a href='/e2e/'>here</a>."
                }]
            },

            {
                section: 'Messaging',
                questions: [{
                        title: 'Texts I sent via Textto do not show up in my phone\'s messaging app.',
                        answer: 'To fix this issue, try going to Settings -> Applications -> Your texting app. Then clear your apps storage and cache. Note that this will <i>not</i> delete your text messages, it will just cause the app to rescan for sent texts.<br><br>If this still does not fix the issue, this seems to be an issue with Android messages. Textto uses the regular android api to send messages, and your phone\'s default sms app is supposed to update the phone\'s database with them. Since Textto is not the default app, it is unable to modify the database the default sms app uses to display messages. Your best bet is to try a 3rd party texting app.'
                    }, {
                        title: 'Why can\'t I see my old messages?',
                        answer: 'To save of storage fees and pass those savings onto you, we only sync your recent messages.'
                    }, {
                        title: 'My messages are not sending.',
                        answer:`
                        <ol>
                            <li>Is your computer and Android device connected to the internet?</li>
                            <li>Are you signed into the same Google account on both the computer and your Android device?</li>
                            <li>Is your phone in service?</li>
                            <li>If you still can't send messages, <a href="mailto:help@moduloapps.com">contact us</a> and we'll help you figure it out!</li>
                        </ol>
                        `
                    }, {
                        title: 'I deleted a thread on my phone, but it still appears in Textto.',
                        answer: 'On the website, hover over thread you wish to delete and click the \'x\' icon. Confirm you want to delete the thread and you\'re done!'
                    }
                ]
            },
            {
                section: 'Contacts',
                questions: [{
                    title: 'Some of my contacts aren\'t appearing.',
                    answer: 'Ensure that the contacts on your phone have an area and country code attached to them. After changing your phone\'s contacts, hit \'Sync Contacts\' in Textto.'
                }, {
                    title: 'I\'ve changed a contact but still see the old one online.',
                    answer: 'Open the side navigation bar on the Textto website and click on \'Sync Contacts\'.'
                }]
            },

            {
                section: 'Signing in',
                questions: [{
                    title: 'I\'m unable to sign into the Desktop app.',
                    answer: 'Sometimes when signing into a new application for the first time, you will get a Google security alert. Check your inbox and make sure you verify with Google that you have attempted to sign in.'
                }, {
                    title: 'I\'m unable to sign into the web app.',
                    answer: 'Please make sure that third-party cookies are enabled. These are used for Google Authenitication and must be enabled by your browser. If you are using other privacy browser addons, try disabling them to log in.'

                }]
            },
        ]
    },


    actions: {

        didTransition () {
            this._super(...arguments)

            Ember.run.scheduleOnce('afterRender', this, function () {

                $('.title').on('click', function () {
                    $(this).next().toggleClass('visible')
                    if ($(this).next().hasClass('visible')) {
                        $(this).next().slideDown()
                    } else {
                        $(this).next().slideUp()
                    }

                })

            })

        }

    }






})