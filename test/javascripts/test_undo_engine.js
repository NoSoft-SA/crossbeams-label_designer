require('jsdom-global')();
const test = require('tape');
const sinon = require('sinon');
const tapDiff = require('tap-diff');

test.createStream()
  .pipe(tapDiff())
  .pipe(process.stdout);

require('../../lib/crossbeams/label_designer/assets/javascripts/undo_engine.js');

test('UndoEngine', (t) => {
  // t.plan(2);
  t.false(UndoEngine.canUndo());
  t.false(UndoEngine.canRedo());


  t.throws(UndoEngine.undo, /undo at this time/);
  t.throws(UndoEngine.redo, /redo at this time/);

  const undoFunction = sinon.spy();
  const redoFunction = sinon.spy();

  UndoEngine.addCommand({
    action: 'undoable',
    current: 'getCurrentState',
    previous: 'previous',
    executeUndo() {
      undoFunction();
    },
    executeRedo() {
      redoFunction();
    },
  });

  t.ok(UndoEngine.canUndo());
  UndoEngine.undo();
  t.ok(undoFunction.called);
  t.false(UndoEngine.canUndo());
  t.ok(UndoEngine.canRedo());
  UndoEngine.redo();
  t.ok(redoFunction.called);

  t.false(UndoEngine.canRedo());

  t.end();
});