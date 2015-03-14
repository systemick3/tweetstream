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