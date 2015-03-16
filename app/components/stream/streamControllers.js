var app = angular.module('twitterapp');

app.controller('streamCtrl', ['$scope', '$rootScope', 'socket', 'userFactory', 'streamFactory', function ($scope, $rootScope, socket, userFactory, streamFactory) {
  var oldTweets = [],
    newTweets,
    i,
    j,
    shuffled,
    defaultStreamState = 'not paused',
    defaultButtonText = 'Pause stream',
    defaultStreamFilterText = 'No filter set.'
    MAX_TWEETS = 20;

  $scope.streamtweets = [];
  $rootScope.favouriteTweets = [];
  $rootScope.favouritesExist = false;

  userFactory.userSessionData().then(function (response) {

    var shuffle = function (o) {
      for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
      return o;
    };

    var getFilteredTweets = function (tweets, filters, results) {
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

      console.log($rootScope.streamFilters);
    };

    $rootScope.setFilterText = function() {
      $rootScope.streamFilterText = $rootScope.streamFilters.length > 0 ? 'Current filters:' : defaultStreamFilterText;
    };

    $scope.favouriteTweet = function (id_str, destroy, callback) {
      var userId = $scope.user.id_str,
        i,
        removeIndex = -1,
        params = {};

      params.tweetId = id_str;
      params.userId = userId;

      streamFactory.postStatusFavourite(params, destroy).then(function (data) {

        if (destroy) {
          for (i = 0; i < $rootScope.favouriteTweets.length; i++) {
            if ($rootScope.favouriteTweets[i].id_str === id_str) {
              removeIndex = i;
              break;
            }
          }

          if (removeIndex > -1) {
            $rootScope.favouriteTweets.splice(removeIndex, 1);
            callback(null, data);
          }

        } else {
          for (i = 0; i < $scope.streamtweets.length; i++) {
            if ($scope.streamtweets[i].id_str === id_str) {
              $rootScope.favouriteTweets = $rootScope.favouriteTweets.concat(streamFactory.processTweets([$scope.streamtweets[i]]));
              callback(null, data);
              break;
            }
          }
        }

        $rootScope.favouritesExist = $scope.favouriteTweets.length > 0;

      }, function (err) {
        callback(err);
        console.log('FAVOURITE ERROR')
      })

    };

  });

}]);