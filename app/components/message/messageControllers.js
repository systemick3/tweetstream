var app = angular.module('twitterapp');

app.controller('messageCtrl', ['$scope', '$rootScope', function ($scope, $rootScope) {
  $rootScope.streamMessages = [];

  $rootScope.addStreamMessage = function (message) {
    $rootScope.streamMessages.push(message);
    $rootScope.$broadcast('newStreamMessage', {'msg': message});
    console.log($rootScope.streamMessages);
  };

}]);