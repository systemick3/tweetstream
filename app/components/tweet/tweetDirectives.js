var app = angular.module('twitterapp');

app.directive('tweetForm', [function () {

  return {
    restrict: 'E',
    replace: true,
    templateUrl: "components/tweet/views/tweetForm.html",
    link: function (scope, element, attrs) {
      var parentElement = element.parent(),
        textarea = parentElement.find('textarea');

      textarea.focus(function () {
        textarea.attr('rows', '4');
      });

      textarea.blur(function () {
        if (!angular.isDefined(scope.newTweet) || !angular.isDefined(scope.newTweet.message) || scope.newTweet.message === '') {
          textarea.attr('rows', '1');
        }
      });

      scope.$watch('formSuccess', function (newValue) {
        if (newValue === true) {
          resetForm();
        }
      });

      var resetForm = function () {
        scope.newTweet.message = '';
        scope.newTweetForm.$setPristine();
        textarea.attr('rows', '1');
      };
    }
  };

}]);

app.directive('tweetIconPanel', [function () {

  return {
    restrict: 'E',
    replace: true,
    templateUrl: "components/tweet/views/tweetIconPanel.html",
    link: function (scope, element, attrs) {
      alert('adding icon panel');
    }
  };

}]);