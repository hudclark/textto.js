const {autoUpdater, dialog} = require('electron')

module.exports = function startAutoUpdater (feedUrl) {
    autoUpdater.setFeedURL(feedUrl)

    // Handle events

    autoUpdater.on('error', err => console.log(err))
    autoUpdater.on('checking-for-update', () => console.log('checking for update...'))
    autoUpdater.on('update-available', () => console.log('update available'))
    autoUpdater.on('update-not-available', () => console.log('update not available'))

    // Display a success message on successful update
    autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
        let message = 'An update for Textto is now available. It will be installed the next time you restart the application.'

        if (releaseNotes) {
            message += '\n\nRelease notes:\n'
            notes.split(/[^\r]\n/).forEach((note) => {
                message += note + '\n\n'
            })
        }

        // Ask user to update now
        dialog.showMessageBox({
            type: 'question',
            buttons: ['Install and Relaunch', 'Later'],
            defaultId: 0,
            message: `A new version of Textto has been downloaded.`,
            detail: message
        }, (response) => {
            if (response === 0) {
                setTimeout(() => autoUpdater.quitAndInstall(), 1)
            }
        })
    })

    autoUpdater.checkForUpdates()

}