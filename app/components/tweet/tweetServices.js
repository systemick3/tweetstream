var app = angular.module('twitterapp');

app.factory('tweetFactory', ['$http', 'tConfig', function ($http, tConfig) {
  var favouritePromise,
    replyFormPromise;

  return {

    processTweets: function (tweets) {
      if (!angular.isArray(tweets)) {
        tweets = [tweets];
      }

      for (var i=0; i<tweets.length; i++) {
        tweets[i].display_text = this.processTweetLinks(tweets[i].text);
        tweets[i].short_date = tweets[i].created_at.substring(0, 16);
      }
      return tweets;
    },

    processTweetLinks: function (text) {
      var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/i;
      text = text.replace(exp, "<a href='$1' target='_blank'>$1</a>");
      exp = /(^|\s)#(\w+)/g;
      text = text.replace(exp, "$1<a href='https://twitter.com/hashtag/$2' target='_blank'>#$2</a>");
      exp = /(^|\s)@(\w+)/g;
      text = text.replace(exp, "$1<a href='http://www.twitter.com/$2' target='_blank'>@$2</a>");
      return text;
    },

    sendStatusUpdate: function (newTweet) {
      var apiData = tConfig.apiData,
        newTweetUrl = apiData.server + '/tweetapp/auth/tweet/new';

      return $http.post(newTweetUrl, newTweet);
    },

    getReplyForm: function () {
      var formUrl = 'components/tweet/views/replyForm.html';

      if (!replyFormPromise) {
        replyFormPromise = $http.get(formUrl).then(function (response) {
          return response;
        });
      }

      return replyFormPromise;
    },

    postStatusFavourite: function (params, destroy) {
      var apiData = tConfig.apiData,
        favouriteUrl;

      if (destroy) {
        favouriteUrl = apiData.server + '/tweetapp/auth/tweet/unfavourite';
      } else {
        favouriteUrl = apiData.server + '/tweetapp/auth/tweet/favourite';
      }

      return $http.post(favouriteUrl, params);
    },

    removeStatus: function (tweetData) {
      var apiData = tConfig.apiData,
        removeTweetUrl = apiData.server + '/tweetapp/auth/tweet/destroy';

      return $http.post(removeTweetUrl, tweetData);
    },

    sendStatusRetweet: function (retweetData) {
      var apiData = tConfig.apiData,
        retweetUrl = apiData.server + '/tweetapp/auth/tweet/retweet';

      return $http.post(retweetUrl, retweetData);
    }

  };

}]);