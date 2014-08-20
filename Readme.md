# test_helper.js

A test helper sample for your node tests

## Nice and simple

No promises, just a single callback. "A sync" look.

    var t = require("./test_helper");

    before(function(done) {
      t.db();
      t.app();
      t.start(function() {
        t.dbcleaner(done);
      });
    });

    after(function(done) {
      t.stop(done);
    });

    afterEach(function(done) {
      t.dbcleaner(done);
    });

---

Just need one service

    before(function(done) {
      t.app();
      t.start(done);
    });

    after(function(done) {
      t.stop(done);
    });

