describe('createChangeStream', function () {
  'use strict';

  // this should be dynamic :(
  // but how to pass from grunt + karma to tests?
  var LB_PORT = 4558;

  var scope, createChangeStream;

  beforeEach(module('ls.ChangeStream'));
  beforeEach(inject(function (_createChangeStream_) {
    createChangeStream = _createChangeStream_;
  }));

  describe('with an EventSource', function() {
    var changes;
    var eventSource;
    beforeEach(function() {
      var url = 'http://localhost:' + LB_PORT + '/todos/change-stream?_format=event-stream';
      eventSource = new EventSource(url);
      changes = createChangeStream(eventSource);
    });

    it('should get some events', function(done) {
      changes.on('data', function(data) {
        changes.end();
        done();
      });
    });
  });
});
