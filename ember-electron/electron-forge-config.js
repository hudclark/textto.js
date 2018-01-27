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
	"authors": "Hudson Clark",
    "icon": path.join(__dirname, '../icons/win/icon.ico'),
	"noMsi": "false",
	"setupExe": "texttosetup.exe",
	"setupIcon": path.join(__dirname, '../icons/win/icons'),
	"exe": "textto.exe"
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
