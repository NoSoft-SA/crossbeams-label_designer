module.exports = {
  "extends": "airbnb-base",
  "plugins": [
    "import"
  ],
  "parserOptions": {
    "sourceType": 'script',
    "ecmaFeatures": {
      "impliedStrict": true
    }
  },
  "rules": {
    "no-param-reassign": [ "error", { "props": false } ]
  },
  "env": {
    "browser": true,
    "jquery": true,
  },
  "globals": {
    "swal": false,
    "agGrid": false,
    "Konva": false,
    "Clipboard": false,
    "MyLabel": false,
    "Library": false,
    "Canvas": false,
    "Clipboard": false,
    "DrawApp": false,
    "Positioner": false,
    "UndoEngine": false,
    "UndoRedoModule": false,
    "LabelOptions": false,
    "Shortcuts": false,
    "ImageUploader": false,
    "MyImages": false,
    "VariableSettings": false,
    "TextSettings": false,
    "Shape": false,
    "Label": true,
    "labelConfig": false,
    "labelSizes": false,
    "fontSizes": false,
    "labelVariableTypes": false,
    "pxPerMm": false,
    "sizeConfig": false,
    "MyLabelSize": false,
    "drawEnv": false,
    "Jackbox": false,
    "crossbeamsUtils": false,
    "crossbeamsLocalStorage": false
  }
};


