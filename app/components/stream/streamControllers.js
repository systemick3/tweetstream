var app = angular.module('twitterapp');

app.controller('streamCtrl', ['$scope', '$rootScope', 'socket', 'userFactory', 'streamFactory', 'tweetFactory', function ($scope, $rootScope, socket, userFactory, streamFactory, tweetFactory) {
  var oldTweets = [],
    newTweets,
    shuffled,
    defaultStreamState = 'not paused',
    defaultButtonText = 'Pause stream',
    defaultStreamFilterText = 'No filter set.',
    MAX_TWEETS = 20;

  $scope.streamtweets = [];

  userFactory.userSessionData().then(function (response) {

    var shuffle = function (o) {
      var j,
        x,
        i;

      for (j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
      return o;
    };

    var getFilteredTweets = function (tweets, filters, results) {
      var i,
        j;

      for (i = 0; i < filters.length; i++) {
        for (j = 0; j < tweets.length; j++) {
          if (tweets[j].text.indexOf(filters[i]) > -1) {
            results.push(tweets[j]);
            return results;
          }
        }
      }

      return results;
    };

    socket.on('tweets', function (data) {

      if (!$rootScope.streamPaused) {

        if ($scope.streamtweets.length >= MAX_TWEETS) {
          // If we already have max tweets lose the oldest
          $scope.streamtweets.pop();
          oldTweets = $scope.streamtweets;
        } else {
          oldTweets = $scope.streamtweets;
        }

        if ($rootScope.streamFilters.length) {
          shuffled = shuffle($rootScope.streamFilters.slice());
          newTweets = getFilteredTweets(data, shuffled, []);

        } else {
          newTweets = data.slice(0, 1);
        }

        // Make the new tweet the 1st item in the array
        $scope.streamtweets = streamFactory.processTweets(newTweets.concat(oldTweets));
        $rootScope.streamtweets = $scope.streamtweets;
      }

    });

    $scope.$on('socket:error', function (ev, data) {
      $scope.streamError = 'Unable to stream latest tweets from Twitter. Please try again later.'
    });

    // Pause the stream
    $rootScope.streamPaused = false;
    $rootScope.streamState = defaultStreamState;
    $rootScope.buttonText = defaultButtonText;

    $scope.replyFormSuccess = false;

    $rootScope.toggleStreamPaused = function() {
      $rootScope.streamPaused = !$rootScope.streamPaused;

      if ($rootScope.streamState == defaultStreamState) {
        $rootScope.streamState = 'paused';
        $rootScope.buttonText = 'Start stream';
      } else {
        $rootScope.streamState = defaultStreamState;
        $rootScope.buttonText = defaultButtonText;
      }
    };

    // Set the stream filter
    $rootScope.streamFilters = [];
    $rootScope.streamFilterText = defaultStreamFilterText;

    $rootScope.addFilter = function(filter) {
      if ($rootScope.streamFilters.indexOf(filter) === -1) {
        $rootScope.streamFilters.push(filter);
        $rootScope.setFilterText();
      }
    };

    $rootScope.removeFilter = function(filter) {
      var index = $rootScope.streamFilters.indexOf(filter);

      if (index > -1) {
        $rootScope.streamFilters.splice(index, 1);
      }

      $rootScope.setFilterText();
    };

    $rootScope.setFilterText = function() {
      $rootScope.streamFilterText = $rootScope.streamFilters.length > 0 ? 'Current filters:' : defaultStreamFilterText;
    };

  });

}]);