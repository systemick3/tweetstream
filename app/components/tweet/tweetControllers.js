var app = angular.module('twitterapp');

app.controller('tweetCtrl', ['$scope', '$rootScope', 'tweetFactory', function ($scope, $rootScope, tweetFactory) {
  $scope.formSuccess = false;
  $scope.formSubmitError = false;
  $scope.origin = location.hostname;

  $rootScope.userTweets = [];
  $rootScope.useTweetsExist = false;
  $rootScope.favouriteTweets = [];
  $rootScope.favouritesExist = false;
  $rootScope.showRetweet = false;
  $rootScope.retweetedTweet = false;

  $scope.$on('testingTweet', function (event, args) {
    $rootScope.userTweets.push(args.tweet);
    $rootScope.userTweetsExist = true;
  });

  $rootScope.sendStatusUpdate = function (tweet) {
    // This function is used for new tweets and replies
    // If a reply the id of the original tweet is attached to the tweet param
    var isReply = false;

    if (angular.isDefined(tweet.message)) {
      tweet.origin = location.hostname;
      tweet.userId = $scope.user.id_str;

      if (tweet.tweetId) {
        isReply = true;
      }

      tweetFactory.sendStatusUpdate(tweet)
        .success(function (data) {
          var statusType = (isReply) ? 'Reply' : 'Tweet';

          if (data.msg === 'Success') {

            if (isReply) {
              $rootScope.$broadcast('replySuccess', { tweetId: data.tweet.id_str });
            } else {
              $rootScope.$broadcast('tweetSuccess', { tweetId: data.tweet.id_str });
            }

            $rootScope.userTweets = $rootScope.userTweets.concat(tweetFactory.processTweets([data.tweet]));
            $rootScope.userTweetsExist = $scope.userTweets.length > 0;

          }
        })
        .error(function (error) {
          if (isReply) {
            $rootScope.$broadcast('replyFailure');
          } else {
            $rootScope.$broadcast('tweetFailure');
          }
        });
    }

  };

  $rootScope.sendStatusRetweet = function (tweetId) {
    var retweetData = {};

    if (angular.isDefined(tweetId)) {
      retweetData.tweetId = tweetId;
      retweetData.userId = $scope.user.id_str;

      tweetFactory.sendStatusRetweet(retweetData)
        .success(function (data) {
          $rootScope.$broadcast('retweetSuccess', { retweetId: data.tweet.id_str, originalTweetId: tweetId });
          $rootScope.userTweets = $rootScope.userTweets.concat(tweetFactory.processTweets([data.tweet]));
          $rootScope.userTweetsExist = $scope.userTweets.length > 0;
        })
        .error(function (err) {
          $rootScope.$broadcast('retweetFailure');
        });
    }
  };

  $rootScope.removeStatus = function (tweetId) {
    var i,
      removeIndex,
      list,
      statusData = {};

    if (angular.isDefined(tweetId)) {
      statusData.tweetId = tweetId;
      statusData.userId = $scope.user.id_str;

      tweetFactory.removeStatus(statusData)
        .success(function (data) {
          $rootScope.$broadcast('removeSuccess', { tweetId: tweetId });

          for (i = 0; i < $rootScope.userTweets.length; i++) {
            if ($rootScope.userTweets[i].id_str === tweetId) {
              removeIndex = i;
              break;
            }
          }

          if (removeIndex > -1) {
            // If found - remove it
            $rootScope.userTweets.splice(removeIndex, 1);
            $rootScope.userTweetsExist = $scope.userTweets.length > 0;
          }

        })
        .error(function (err) {
          $rootScope.$broadcast('removeFailure');
        });
    }
  };

  $rootScope.favouriteTweet = function (id_str, destroy, callback) {
    var userId = $scope.user.id_str,
      found = false,
      i,
      removeIndex = -1,
      params = {};

    params.tweetId = id_str;
    params.userId = userId;

    tweetFactory.postStatusFavourite(params, destroy).then(function (data) {

      if (destroy) {
        // Find the tweet to be removed
        for (i = 0; i < $rootScope.favouriteTweets.length; i++) {
          if ($rootScope.favouriteTweets[i].id_str === id_str) {
            removeIndex = i;
            break;
          }
        }

        if (removeIndex > -1) {
          // If found - remove it
          $rootScope.favouriteTweets.splice(removeIndex, 1);
          $rootScope.favouritesExist = $scope.favouriteTweets.length > 0;
          callback(null, data);
        }

      } else {
        // Attempt to find the tweet in the stream
        for (i = 0; i < $scope.streamtweets.length; i++) {
          if ($scope.streamtweets[i].id_str === id_str) {
            $rootScope.favouriteTweets = $rootScope.favouriteTweets.concat(tweetFactory.processTweets([$scope.streamtweets[i]]));
            $rootScope.favouritesExist = true;
            found = true;
            callback(null, data);
            break;
          }
        }

        // If the tweet wasn't in the stream it will be in the user's tweets
        if (!found) {
          for (i = 0; i < $rootScope.userTweets.length; i++) {
            if ($rootScope.userTweets[i].id_str === id_str) {
              $rootScope.favouriteTweets = $rootScope.favouriteTweets.concat(tweetFactory.processTweets([$rootScope.userTweets[i]]));
              $rootScope.favouritesExist = true;
              callback(null, data);
              break;
            }
          }
        }
      }
    }, function (err) {
      callback(err);
    });

  };

}]);