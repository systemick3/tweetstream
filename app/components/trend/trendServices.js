var app = angular.module("twitterapp");

app.factory('trendFactory', ['$http', 'tConfig', function ($http, tConfig) {
  var apiData = tConfig.apiData;

  return {
    getTrends: function () {
      var trendsUrl = apiData.server + apiData.trends.url;
      return $http.get(trendsUrl);
    },
  };

}]);