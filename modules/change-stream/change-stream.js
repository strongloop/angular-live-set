angular.module('ls.ChangeStream',[]).factory('createChangeStream', ['$rootScope', function($rootScope) {
  function createChangeStream(eventSource, $scope) {
    var str = new stream.PassThrough({objectMode: true});

    if(eventSource) {
      eventSource.addEventListener('data', function(msg) {
        var data = msg.data;

        if(!str.ended) {
          try {
            data = JSON.parse(data);
          } catch (e) {
            str.emit('error', e);
            return;
          }
          str.write(data);
          if (!$rootScope.$$phase) $rootScope.$apply();
        }
      });

      str.on('close', function() {
        eventSource.close();
      });
    }

    return str;
  }


  return createChangeStream;
}]);
