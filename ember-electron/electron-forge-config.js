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
    "name": "Textto Beta",
    "overwrite": true,
    "icon": 'icons/win/icon.ico'
  },
  "electronWinstallerConfig": {
        icon: 'icons/win/icon.ico',
        noMsi: true,
        authors: 'Modulo Apps LLC',
        iconUrl: `https://textto.io/images/icon.ico`,
        setupIcon: path.join(__dirname, '../icons/win/icon.ico'),
        title: 'Textto',
        noMsi: true,
        loadingGif: path.join(__dirname, '../icons/installing.gif')
  },
  "electronInstallerDebian": {
    "name": 'app',
    "homepage": "https://textto.io",
    "genericName": "Text from your computer",
    "bin": "Textto"
  },
  "electronInstallerRedhat": {},
};
