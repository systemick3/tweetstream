var app = angular.module('twitterapp');

app.factory('tweetFactory', ['$http', 'tConfig', function ($http, tConfig) {

  return {

    sendStatusUpdate: function (newTweet) {
      var apiData = tConfig.apiData,
        newTweetUrl = apiData.server + '/tweetapp/auth/tweet/new';

      return $http.post(newTweetUrl, newTweet);
    }

  };

}]);