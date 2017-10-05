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
  "electronPackagerConfig": {},
  "electronWinstallerConfig": {
    "name": ""
  },
  "electronInstallerDebian": {
    "name": "Textto",
    "homepage": "https://textto.io",
    "genericName": "Text from your computer",
    "bin": "Textto",
    "icon": path.join(__dirname, '../public/images/logo.png')
  },
  "electronInstallerRedhat": {},
  "github_repository": {
    "owner": "",
    "name": ""
  },
  "windowsStoreConfig": {
    "packageName": ""
  }
};