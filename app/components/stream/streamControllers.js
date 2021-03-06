var app = angular.module('twitterapp');

app.controller('streamCtrl', ['$scope', '$rootScope', 'socket', 'userFactory', 'streamFactory', 'tweetFactory', function ($scope, $rootScope, socket, userFactory, streamFactory, tweetFactory) {
  var start = new Date().getTime(),
    defaultStreamState = 'not paused',
    defaultButtonText = 'Pause stream',
    defaultStreamFilterText = 'No filter set.',
    tweetBuffer = [],
    MAX_TWEETS = 20;

  var testingTweet = {
    created_at: 'Tue Mar 24 15:51:16 +0000 2015',
    display_text: 'Testing, testing 1 2 3',
    id_str: '123456789',
    short_date: 'Tue Mar 24 15:51'
  };
  //$rootScope.$broadcast('testingTweet', {tweet: testingTweet});

  $scope.streamtweets = [];

  userFactory.userSessionData().then(function (response) {

    if (angular.isDefined($rootScope.tweetapp) && $rootScope.tweetapp.authorised) {

      var getFilteredTweets = function (tweets, filters, results) {
        var i, j, filter = filters[0];

        for (i = 0; i < tweets.length; i++) {
          if (tweets[i].text.indexOf(filter) > -1) {
            results.push(tweets[i]);
            return results;
          }
        }

        $rootScope.$broadcast('noFilteredTweets', {'filter': filter});

        return false;
      };

      socket.on('tweets', function (data) {
        var oldTweets = [],
          now,
          INTERVAL = 10000,
          newTweets;

        if (!$rootScope.streamPaused) {

          now = new Date().getTime();

        // If we don't yet have any tweets then add one immediately
          if ($scope.streamtweets.length === 0) {
            if ($rootScope.streamFilters.length > 0) {
              newTweets = getFilteredTweets(data, $rootScope.streamFilters, []);
            } else {
              newTweets = data.slice(0, 1);
            }
          } else {
            tweetBuffer = tweetBuffer.concat(data);

            if (now - start > INTERVAL) {
              if ($scope.streamtweets.length >= MAX_TWEETS) {
                // If we already have max tweets lose the oldest
                $scope.streamtweets.pop();
                $rootScope.$broadcast('tweetRemovedFromStream');
              }

              oldTweets = $scope.streamtweets;

              if ($rootScope.streamFilters.length > 0) {
                newTweets = getFilteredTweets(tweetBuffer, $rootScope.streamFilters, []);
              } else {
                newTweets = data.slice(0, 1);
              }

              start = new Date().getTime();
              tweetBuffer = [];
            }
          }

          if (newTweets) {
            // Make the new tweet the 1st item in the array
            $scope.streamtweets = streamFactory.processTweets(newTweets.concat(oldTweets));
            $rootScope.streamtweets = $scope.streamtweets;
          }
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

      $rootScope.setStreamFilter = function (filter) {
        // Only one filter allowed
        if ($rootScope.streamFilters[0] === filter) {
          // Remove filter
          $rootScope.streamFilters = [];
          $rootScope.setFilterText();
        } else {
          // Add filter if we don't already have one
          if ($rootScope.streamFilters.length > 0) {
            alert('Only one filter allowed. Please remove the current filter before adding another one.')
          } else {
            $rootScope.streamFilters = [filter];
            $rootScope.setFilterText(filter);
          }
        }
      };

      $rootScope.setFilterText = function(currentFilter) {
        $rootScope.streamFilterText = $rootScope.streamFilters.length > 0 ? 'Current filter: ' + currentFilter : defaultStreamFilterText;
      };

    }

  });

}]);