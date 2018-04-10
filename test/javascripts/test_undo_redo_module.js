require('jsdom-global')();
const test = require('tape');
const sinon = require('sinon');
const tapDiff = require('tap-diff');

test.createStream()
  .pipe(tapDiff())
  .pipe(process.stdout);

// const undoButton = document.createElement('div');
// undoButton.className = 'label-designer-undo-button';
//
// const redoButton = document.createElement('div');
// redoButton.className = 'label-designer-redo-button';
//
// document.body.appendChild(undoButton);
// document.body.appendChild(redoButton);
//
// const undoModule = require('../../lib/crossbeams/label_designer/assets/javascripts/undo_redo_module.js');
