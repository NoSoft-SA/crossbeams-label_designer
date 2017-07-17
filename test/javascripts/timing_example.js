var test = require('tape');
var LabelDesigner = require('../../lib/crossbeams/label_designer/assets/javascripts/label_design.js');


test('timing test', function (t) {
    console.log(LabelDesigner);
    t.plan(2);

    t.equal(typeof Date.now, 'function');
    var start = Date.now();

    setTimeout(function () {
        t.equal(Date.now() - start, 100);
    }, 100);
});
