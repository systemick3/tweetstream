var app = angular.module('twitterapp');

app.directive('messages', ['$rootScope', function ($rootScope) {
  return {
    restrict: 'E',
    replace: true,
    template: '<div class="messages" ng-controller="messageCtrl" style="display:none;"></div>',
    link: function (scope, element, attrs) {
      var i,
        INTERVAL = 3000;

      var hideMessage = function () {
        element.slideUp();
        element.html('');
      };

      var showMessage = function () {
        var messageDiv;

        if ($rootScope.streamMessages.length > 0) {
          message = $rootScope.streamMessages.shift();
          messageDiv = angular.element('<div class="message ' + message.type + '">' + message.msg + '</div>');
          element.append(messageDiv);
          element.slideDown();

          setTimeout(hideMessage, INTERVAL);
        }
      };

      scope.$on('newStreamMessage', function () {
        if ($rootScope.streamMessages.length > 0) {
          showMessage();
        }
      });
    }
  }
}]);