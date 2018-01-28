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
    "icon": "icons/png/icon.png"
  },
  "electronWinstallerConfig": {
    "name": "Textto",
    "title": "Textto",
    "authors": "Modulo Apps LLC",
    "loadingGif": path.join(__dirname, '../icons/installing.gif'),
    "iconUrl": "https://textto.io/images/icon.ico",
    "setupIcon": path.join(__dirname, '../icons/win/icon.ico'),
    "icon": path.join(__dirname, '../icons/win/icon.ico')
  },
  "electronInstallerDebian": {
    "name": "Textto",
    "homepage": "https://textto.io",
    "genericName": "Text from your computer",
    "bin": "Textto",
    "icon": path.join(__dirname, '../icons/png/icon.png')
  },
  "electronInstallerRedhat": {},
};
