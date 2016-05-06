// Copyright IBM Corp. 2015. All Rights Reserved.
// Node module: angular-live-set
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

angular.module('ls.LiveSet',[]).factory('LiveSet', ['$rootScope', function($rootScope) {
  function LiveSet(data, changes, options) {
    var set = this;

    if(!Array.isArray(data) && typeof data === 'object') {
      changes = data;
      data = [];
    }

    // shallow copy of the array
    this._data = data.slice();
    this.changes = changes;
    this.options = options || {};
    this._pending = [];

    this.options.id = this.options.id || 'id';
    this.options.optimisticWindow = this.options.optimisticWindow || 2000;

    changes.on('readable', function() {
      var change = changes.read();
      if(change) {
        set._applyChange(change);
      }
    });
  }

  LiveSet.prototype.toArray = function() {
    return this._data.slice();
  };

  LiveSet.prototype.getIndexById = function(id) {
    var i = 0;
    var data = this._data;
    var length = data.length;
    var key = this.options.id;

    for(i; i < length; i++) {
      if (data[i] && data[i][key] === id) {
        return i;
      }
    }

    return -1;
  };

  LiveSet.prototype._applyChange = function(change) {
    var previous;
    var index = change.target ? this.getIndexById(change.target) : null;

    if (change.optimistic) {
      this._handleOptimisticChange(change, index);
    } else if(change.target) {
      this._clearPending(change.target);
    }

    switch(change.type) {
      case 'create':
        this._data.push(angular.copy(change.data));
        break;
      case 'update':
        this._data[index] = angular.copy(change.data);
        break;
      case 'remove':
      case 'delete':
        if(index !== -1) {
          this._data.splice(index, 1);
        }
        break;
    }

    if (!$rootScope.$$phase) $rootScope.$apply();
  };

  LiveSet.prototype._handleOptimisticChange = function(change, index) {
    var duration = this.options.optimisticWindow;
    var set = this;
    var previous = this._data[index];
    var id = change.target;

    var timer = setTimeout(function() {
      set._revert(id);
    }, duration);

    this._pending.push({
      target: id,
      data: previous,
      type: change.type,
      timer: timer
    });
  };

  LiveSet.prototype._clearPending = function(target) {
    var i = 0;
    var pending = this._pending;
    var length = pending.length;

    for(i; i < length; i++) {
      if(pending[i] && pending[i].target === target) {
        clearTimeout(pending.splice(i, 1).timer);
      }
    }
  };

  LiveSet.prototype._revert = function(target) {
    var index = this.getIndexById(target);
    var pending = this._pending;
    var previous;
    var i = 0;
    var length = pending.length;

    for(i; i < length; i++) {
      if(pending[i] && pending[i].target === target) {
        previous = pending[i].data;
        this._applyChange({
          target: target,
          type: previous ? 'update' : 'remove',
          data: previous
        });
      }
    }
  };

  LiveSet.prototype.toLiveArray = function() {
    return this._data;
  };

  return LiveSet;
}]);
