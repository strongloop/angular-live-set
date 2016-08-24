// Copyright IBM Corp. 2015. All Rights Reserved.
// Node module: angular-live-set
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

describe('createChangeStream', function () {
  'use strict';

  // see gulpfile.js where it pipes args to karma
  // then passes through in the window object
  /*jslint browser: true*/
  var LB_PORT = window.__karma__.config.LB_PORT;

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
