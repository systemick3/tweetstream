var app = angular.module('twitterapp');

app.controller('streamCtrl', ['$scope', 'socket', 'homeFactory', function ($scope, socket, homeFactory) {
  var oldTweets = [],
    MAX_TWEETS = 20;

  $scope.streamtweets = [];

  socket.on('tweets', function (data) {
    console.log('DATA');
    console.log(data);

    // Display a maximum of 12 tweets
    if ($scope.streamtweets.length >= 12) {
      // If we already have 12 tweets lose the oldest
      $scope.streamtweets.pop();
      oldTweets = $scope.streamtweets;
    }
    else {
      oldTweets = $scope.streamtweets;
    }

    // Make the new tweet the 1st item in the array
    $scope.streamtweets = homeFactory.processTweets(data.slice(0, 1).concat(oldTweets));

    console.log('STREAM TWEETS')
    console.log($scope.streamtweets);
  });

  $scope.$on('socket:error', function (ev, data) {
    $scope.streamError = 'Unable to stream latest tweets from Twitter. Please try again later.'
  });

  $scope.selectTrends = function (trend) {
    return trend.name.length <= 30;
  };

}]);