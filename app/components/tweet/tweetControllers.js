var app = angular.module('twitterapp');

app.controller('tweetCtrl', ['$scope', 'tweetFactory', function ($scope, tweetFactory) {
  $scope.formSuccess = false;
  $scope.formSubmitError = false;
  $scope.origin = location.hostname;

  $scope.sendNewTweet = function (newTweet) {
    console.log('NEW TWEET');
    console.log(newTweet);

    if (angular.isDefined(newTweet.message)) {
      newTweet.origin = location.hostname;
      newTweet.userId = $scope.user.id_str;

      console.log($scope.user);

      tweetFactory.sendNewTweet(newTweet)
        .success(function (data) {
          $scope.formSuccess = true;
          $scope.form.$setPristine();
        })
        .error(function (error) {
          $scope.formSubmitError = true;
          $scope.newTweetForm.$setPristine();
        });
    }
  };

}]);