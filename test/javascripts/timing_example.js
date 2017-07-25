var test = require('tape');
var undoEngine = require('../../lib/crossbeams/label_designer/assets/javascripts/undo_engine.js');
var undoModule = require('../../lib/crossbeams/label_designer/assets/javascripts/undo_redo_module.js');


test('timing test', function (t) {
    console.log(undoEngine);
    console.log(undoModule);
    t.plan(2);

    t.equal(typeof Date.now, 'function');
    var start = Date.now();

    setTimeout(function () {
        t.equal(Date.now() - start, 100);
    }, 100);
});
