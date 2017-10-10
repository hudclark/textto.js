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
	"appCopyright": "Copyright (c) 2017 Textto",
	"name": "Textto",
	"overwrite": true,
	"icon": "icons/png/icon.png"
},
  "electronWinstallerConfig": {
    "name": ""
  },
  "electronInstallerDebian": {
    "name": "Textto",
    "homepage": "https://textto.io",
    "genericName": "Text from your computer",
    "bin": "Textto",
    "icon": path.join(__dirname, '../icons/png/icon.png')
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
