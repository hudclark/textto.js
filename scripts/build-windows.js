const electronInstaller = require('electron-winstaller')

const result = electronInstaller.createWindowsInstaller({
    appDirectory: './electron-out/SendLeap-win32-x64',
    outputDirectory: './electron-out/win-release',
    authors: 'Modulo Apps LLC',
    exe: 'SendLeap.exe'
})

result.then(() => {
    console.log('Created release successfully')
})

result.catch((error) => {
    console.log('Error occured')
    console.log(error)
})