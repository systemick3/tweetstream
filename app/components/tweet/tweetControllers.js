var app = angular.module('twitterapp');

app.controller('tweetCtrl', ['$scope', 'tweetFactory', function ($scope, tweetFactory) {
  $scope.formSuccess = false;
  $scope.formSubmitError = false;
  $scope.origin = location.hostname;

  $scope.sendStatusUpdate = function (newTweet) {

    if (angular.isDefined(newTweet.message)) {
      newTweet.origin = location.hostname;
      newTweet.userId = $scope.user.id_str;

      tweetFactory.sendStatusUpdate(newTweet)
        .success(function (data) {
          if (data.msg === 'Success') {
            $scope.formSuccess = true;
          }
        })
        .error(function (error) {
          $scope.formSubmitError = true;
        });
    }

  };

}]);