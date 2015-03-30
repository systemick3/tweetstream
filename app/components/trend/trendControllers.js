var app = angular.module('twitterapp');

app.controller('trendCtrl', ['$scope', '$rootScope', 'trendFactory', 'userFactory', function ($scope, $rootScope, trendFactory, userFactory) {

  var getTrends = function () {

    trendFactory.getTrends()
      .success(function (data) {
        $rootScope.$broadcast('trendsSuccess');

        $scope.trends = data.data[0].trends;

        setTimeout(getTrends, 3600000);
      })
      .error(function (err) {
        $rootScope.$broadcast('trendsError');
        setTimeout(getTrends, 60000);
      });
  };

  userFactory.userSessionData().then(function () {
    getTrends();
  })

}]);