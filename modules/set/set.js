/**
 * General-purpose validator for ngModel.
 * angular.js comes with several built-in validation mechanism for input fields (ngRequired, ngPattern etc.) but using
 * an arbitrary validation function requires creation of a custom formatters and / or parsers.
 * The ui-validate directive makes it easy to use any function(s) defined in scope as a validator function(s).
 * A validator function will trigger validation on both model and input changes.
 *
 * @example <input ui-validate=" 'myValidatorFunction($value)' ">
 * @example <input ui-validate="{ foo : '$value > anotherModel', bar : 'validateFoo($value)' }">
 * @example <input ui-validate="{ foo : '$value > anotherModel' }" ui-validate-watch=" 'anotherModel' ">
 * @example <input ui-validate="{ foo : '$value > anotherModel', bar : 'validateFoo($value)' }" ui-validate-watch=" { foo : 'anotherModel' } ">
 *
 * @param ui-validate {string|object literal} If strings is passed it should be a scope's function to be used as a validator.
 * If an object literal is passed a key denotes a validation error key while a value should be a validator function.
 * In both cases validator function should take a value to validate as its argument and should return true/false indicating a validation result.
 */
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
  }

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
  }

  LiveSet.prototype._applyChange = function(change) {
    var previous;
    var index = change.target ? this.getIndexById(change.target) : undefined;

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
        this._data.splice(this.getIndexById(change.target), 1);
        break;
    }

    if (!$rootScope.$$phase) $rootScope.$apply();
  }

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
      if(pending[i].target === target) {
        clearTimeout(pending.splice(i, 1).timer);
      }
    }
  }

  LiveSet.prototype._revert = function(target) {
    var index = this.getIndexById(target);
    var pending = this._pending;
    var previous;
    var i = 0;
    var length = pending.length;

    for(i; i < length; i++) {
      if(pending[i].target === target) {
        previous = pending[i].data;
        this._applyChange({
          target: target,
          type: previous ? 'update' : 'remove',
          data: previous
        });
      }
    }
  }

  LiveSet.prototype.toLiveArray = function() {
    return this._data;
  }

  return LiveSet;
}]);
