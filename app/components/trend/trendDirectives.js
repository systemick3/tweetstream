var app = angular.module('twitterapp');

app.directive('filterChange', ['$rootScope', function ($rootScope) {

  return {
    link: function (scope, element, attrs) {

      scope.$watch(function () { return $rootScope.streamFilters; }, function () {
        if (angular.isDefined(scope.streamFilters) && scope.streamFilters.length === 1) {
          element.parent().find('a').each(function (index) {
            if ($(this).text() === scope.streamFilters[0]) {
              $(this).addClass('selected-filter');
            }
          })
        } else {
          element.parent().find('a').removeClass('selected-filter');
        }
      });
      
    }
  }

}]);

