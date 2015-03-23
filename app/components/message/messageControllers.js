var app = angular.module('twitterapp');

app.controller('messageCtrl', ['$scope', '$rootScope', function ($scope, $rootScope) {
  $rootScope.streamMessages = [];

  $rootScope.addStreamMessage = function (message) {
    // Some messages in the stream get inserted twice
    // Hence this check to ensure no duplicate messages
    if ($rootScope.streamMessages.indexOf(message) === -1) {
      $rootScope.streamMessages.push(message);
      $rootScope.$broadcast('newStreamMessage', {'msg': message});
    }
  };

}]);