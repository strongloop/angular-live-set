// Copyright IBM Corp. 2015. All Rights Reserved.
// Node module: angular-live-set
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var loopback = require('loopback');
var app = loopback();

var ds = app.dataSource('db', {connector: 'memory'});
var Todo = app.registry.createModel('Todo', {}, {
  base: 'PersistedModel',
  public: true
});
app.model(Todo, {dataSource: 'db'});

app.use(function(req, res, next) {
  console.log(req.method, req.url);
  next();
});
app.use(loopback.rest());

module.exports = function(port, cb) {
  return app.listen(port, cb);
};

var i = 1;
setInterval(function() {
  Todo.create({txt: 'todo ' + i++});
}, 1000);
