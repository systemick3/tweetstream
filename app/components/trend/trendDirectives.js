var app = angular.module('twitterapp');

app.directive('filterChange', ['$rootScope', function ($rootScope) {

  return {
    link: function (scope, element, attrs) {

      scope.$watch(function () { return $rootScope.streamFilters; }, function () {
        if (angular.isDefined(scope.streamFilters) && scope.streamFilters.length === 1) {
          element.parent().find('a').each(function (index) {
            if ($(this).text() === scope.streamFilters[0]) {
              $(this).addClass('selected-filter');
              $(this).attr('title', 'Remove ' + $(this).text() + ' filter');
            }
          })
        } else {
          element.parent().find('a').removeClass('selected-filter');
          $(this).attr('title', 'Filter by ' + $(this).text());
        }
      });

      scope.$on('trendsSuccess', function (event, args) {
        var msg = 'New trends loaded.';

        $rootScope.addStreamMessage({'type': 'info', 'msg': msg});
      });

      scope.$on('trendsError', function (event, args) {
        $rootScope.addStreamMessage({'type': 'error', 'msg': 'Unable to get latest trends from Twitter. Please try again later.'});
      });
    }
  }

}]);

