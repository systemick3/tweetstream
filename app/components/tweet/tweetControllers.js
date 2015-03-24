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
              $rootScope.addStreamMessage({'type': 'info', 'msg': 'Reply has been sent.'});
            } else {
              $rootScope.$broadcast('tweetSuccess', { tweetId: data.tweet.id_str });
              $rootScope.addStreamMessage({'type': 'info', 'msg': 'Tweet has been sent.'});
            }

            $rootScope.userTweets = $rootScope.userTweets.concat(tweetFactory.processTweets([data.tweet]));
            $rootScope.userTweetsExist = $scope.userTweets.length > 0;

          }
        })
        .error(function (error) {
          $rootScope.addStreamMessage({'type': 'error', 'msg': 'Unable to send ' + (isReply) ? 'reply' : 'tweet'});
        });
    }

  };

  $rootScope.toggleRetweet = function () {
    $rootScope.showRetweet = !$rootScope.showRetweet;
  };

  $rootScope.sendStatusRetweet = function (tweetId) {
    var retweetData = {};

    if (angular.isDefined(tweetId)) {
      retweetData.tweetId = tweetId;
      retweetData.userId = $scope.user.id_str;

      tweetFactory.sendStatusRetweet(retweetData)
        .success(function (data) {
          $rootScope.toggleRetweet();
          $rootScope.$broadcast('retweetSuccess', { tweetId: data.tweet.id_str });
        })
        .error(function (err) {
          $rootScope.addStreamMessage({'type': 'error', 'msg': 'Unable to send retweet'});
        });
    }
  };

  $rootScope.removeStatus = function (tweetId) {
    var statusData = {};

    if (angular.isDefined(tweetId)) {
      statusData.tweetId = tweetId;
      statusData.userId = $scope.user.id_str;

      tweetFactory.removeStatus(statusData)
        .success(function (data) {
          $rootScope.$broadcast('removeSuccess', { tweetId: tweetId });
        })
        .error(function (err) {
          console.log('ERROR');
          console.log(err);
        });
    }
  };

  $rootScope.favouriteTweet = function (id_str, destroy, callback) {
    var userId = $scope.user.id_str,
      i,
      removeIndex = -1,
      params = {};

    params.tweetId = id_str;
    params.userId = userId;

    tweetFactory.postStatusFavourite(params, destroy).then(function (data) {

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
            $rootScope.favouriteTweets = $rootScope.favouriteTweets.concat(tweetFactory.processTweets([$scope.streamtweets[i]]));
            callback(null, data);
            break;
          }
        }
      }

      $rootScope.favouritesExist = $scope.favouriteTweets.length > 0;

    }, function (err) {
      callback(err);
      console.log('FAVOURITE ERROR')
    });

  };

}]);