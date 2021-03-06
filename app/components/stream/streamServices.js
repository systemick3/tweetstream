var app = angular.module("twitterapp")

app.factory('socket', function ($rootScope, tConfig) {
  var apiData = tConfig.apiData,
    socket = io.connect(apiData.streamServer);

  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },

  };

});

app.factory('streamFactory', ['$http', 'tConfig', function ($http, tConfig) {
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

  };

}]);