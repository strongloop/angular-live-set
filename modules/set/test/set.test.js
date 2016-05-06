// Copyright IBM Corp. 2015. All Rights Reserved.
// Node module: angular-live-set
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

describe('LiveSet', function () {
  'use strict';

  var scope, LiveSet, createChangeStream;

  beforeEach(module('ls.LiveSet'));
  beforeEach(module('ls.ChangeStream'));
  beforeEach(inject(function (_LiveSet_, _createChangeStream_) {
    LiveSet = _LiveSet_;
    createChangeStream = _createChangeStream_;
  }));

  it('should be a function', function() {
    expect(LiveSet.name).to.equal('LiveSet');
  });

  describe('created with a change stream', function() {
    var set;
    var data;
    var changeStream;
    var changes;

    beforeEach(function() {
      changeStream = createChangeStream();
    });

    describe('when an object is created', function() {
      beforeEach(function() {
        var test = this;
        data = [];
        set = new LiveSet(data, changeStream);
        test.data = {id: 1, val: 'bar'};
        changeStream.write({data: test.data, type: 'create'});
      });

      it('should be inserted into the set', function() {
        expect(set.toArray()).to.eql([this.data]);
      });
    });

    describe('when an object is updated', function() {
      beforeEach(function() {
        var test = this;
        data = [{id: 1, val: 'bar'}];
        test.data = {id: 1, val: 'foo'};
        set = new LiveSet(data, changeStream);
        changeStream.write({target: test.data.id, data: test.data, type: 'update'});
      });

      it('should be updated in the set', function() {
        expect(set.toArray()).to.eql([this.data]);
      });
    });

    describe('when an object is optmimistically updated', function() {
      beforeEach(function() {
        var test = this;
        data = [{id: 1, val: 'bar'}];
        test.originalData = data.slice();
        test.data = {id: 1, val: 'foo'};
        set = new LiveSet(data, changeStream, {
          optimisticWindow: 10
        });
        changeStream.write({
          target: test.data.id,
          data: test.data,
          type: 'update',
          optimistic: true
        });
      });

      it('should be updated in the set', function() {
        expect(set.toArray()).to.eql([this.data]);
      });

      describe('and then succesfully updated', function() {
        beforeEach(function() {
          var test = this;
          changeStream.write({
            target: test.data.id,
            data: test.data,
            type: 'update'
          });
        });

        it('should be updated in the set', function() {
          expect(set.toArray()).to.eql([this.data]);
        });
      });

      describe('and never succesfully updated', function() {
        beforeEach(function(done) {
          setTimeout(done, 100);
        });

        it('should not be updated in the set', function() {
          expect(set.toArray()).to.eql(this.originalData);
        });
      });
    });

    describe('when an object is deleted', function() {
      beforeEach(function() {
        var test = this;
        test.expected = [{id: 1, val: 'foo'}, {id: 3, val: 'bat'}];
        data = test.expected.slice();
        test.toDelete = {id: 2, val: 'bar'};
        data.push(test.toDelete);
        set = new LiveSet(data, changeStream);
        changeStream.write({target: test.toDelete.id, type: 'remove'});
      });

      it('should be removed from the set', function() {
        expect(set.toArray()).to.eql(this.expected);
      });
    });
  });
});
