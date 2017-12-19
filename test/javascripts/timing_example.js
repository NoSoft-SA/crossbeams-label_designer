const test = require('tape');
const undoEngine = require('../../lib/crossbeams/label_designer/assets/javascripts/undo_engine.js');
const undoModule = require('../../lib/crossbeams/label_designer/assets/javascripts/undo_redo_module.js');


test('timing test', (t) => {
  console.log(undoEngine);
  console.log(undoModule);
  t.plan(2);

  t.equal(typeof Date.now, 'function');
  const start = Date.now();

  setTimeout(() => {
    t.equal(Date.now() - start, 100);
  }, 100);
});
