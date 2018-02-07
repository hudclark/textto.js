const path = require('path')
module.exports = {
  "make_targets": {
    "win32": [
      "squirrel"
    ],
    "darwin": [
      "zip"
    ],
    "linux": [
      "deb",
      "rpm"
    ]
  },
  "electronPackagerConfig": {
    "appCopyright": "Copyright (c) 2018 Textto",
    "name": "Textto",
    "overwrite": true,
    "icon": 'icons/win/icon.ico'
  },
  "electronWinstallerConfig": {
        icon: 'icons/win/icon.ico',
        noMsi: true,
        authors: 'Modulo Apps LLC',
        iconUrl: `https://textto.io/images/icon.ico`,
        setupIcon: path.join(__dirname, '../icons/win/icon.ico'),
        noMsi: true,
        exe: 'Textto.exe',
        loadingGif: path.join(__dirname, '../icons/installing.gif'),
        certificateFile: path.join(__dirname, '../moduloappscert.p12'),
        certificatePassword: process.env.CERT_PASSWORD
  },
  "electronInstallerDebian": {
    "name": 'app',
    "homepage": "https://textto.io",
    "genericName": "Text from your computer",
    "bin": "Textto"
  },
  "electronInstallerRedhat": {},
};
