var app = angular.module('twitterapp');

app.controller('trendCtrl', ['$scope', '$rootScope', 'trendFactory', 'userFactory', function ($scope, $rootScope, trendFactory, userFactory) {

  var getTrends = function () {
    var msg = 'Loading new trends.';

    if ($rootScope.streamFilters.length > 0) {
      msg += ' Your filter will be reset.'
    }

    $rootScope.streamMessages.push({'type': 'info', 'msg': msg});

    $rootScope.streamFilters = [];
    $rootScope.streamFilterText = 'No filter set.'

    trendFactory.getTrends()
      .success(function (data) {
        $scope.trends = data.data[0].trends;
        setTimeout(getTrends, 3600000);
      })
      .error(function (err) {
        $scope.trendsError = 'Unable to get latest trends from Twitter. Please try again later.';
        setTimeout(getTrends, 60000);
      });
  };

  userFactory.userSessionData().then(function () {
    getTrends();
  })

}]);