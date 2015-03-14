var app = angular.module('twitterapp');

app.factory('tweetFactory', ['$http', 'tConfig', function ($http, tConfig) {

  return {

    sendNewTweet: function (newTweet) {
      var apiData = tConfig.apiData,
        newTweetUrl = apiData.server + '/tweetapp/auth/tweet/new';

      return $http.post(newTweetUrl, newTweet);
    }

  };

}]);