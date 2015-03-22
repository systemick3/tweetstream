var app = angular.module('twitterapp');

app.controller('tweetCtrl', ['$scope', '$rootScope', 'tweetFactory', function ($scope, $rootScope, tweetFactory) {
  $scope.formSuccess = false;
  $scope.formSubmitError = false;
  $scope.origin = location.hostname;

  $rootScope.favouriteTweets = [];
  $rootScope.favouritesExist = false;
  $rootScope.showRetweet = false;
  $rootScope.retweetedTweet = false;

  $rootScope.sendStatusUpdate = function (tweet, callback) {
    var isRetweet = false;

    if (angular.isDefined(tweet.message)) {
      tweet.origin = location.hostname;
      tweet.userId = $scope.user.id_str;

      if (tweet.tweetId) {
        isRetweet = true;
      }

      tweetFactory.sendStatusUpdate(tweet)
        .success(function (data) {
          if (data.msg === 'Success') {
            if (isRetweet) {
              $rootScope.replyFormSuccess = true;
            } else {
              $rootScope.formSuccess = true;
            }
            callback({'msg': 'Success'});
          }
        })
        .error(function (error) {
          $scope.formSubmitError = true;
          callback({'msg': 'Error'});
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
          console.log('ERROR');
          console.log(err);
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
          $rootScope.$broadcast('retweetSuccess', { tweetId: tweetId });
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