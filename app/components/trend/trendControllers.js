var app = angular.module('twitterapp');

app.controller('trendCtrl', ['$scope', 'trendFactory', function ($scope, trendFactory) {
  trendFactory.getTrends()
    .success(function (data) {
      $scope.trends = data.data[0].trends;
    })
    .error(function (err) {
      $scope.trendsError = 'Unable to get latest trends from Twitter. Please try again later.';
    });
}]);