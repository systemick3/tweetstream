var app = angular.module('twitterapp');

app.directive('streamTweetList', ['$rootScope', 'userFactory', function ($rootScope, userFactory) {
  return {
    replace: true,
    link: function (scope, element, attrs) {
      var MAX_TWEETS = 20;

      scope.$watch('streamtweets', function () {
        if (scope.streamtweets.length > 0) {
          var newTweet = scope.streamtweets[0],
            panelDiv = angular.element('<div>').attr('class', 'panel').addClass('tweet').addClass('ngFade').attr('id', newTweet.id_str),
            nameDiv = angular.element('<div>').attr('class', 'name'),
            link = angular.element('<a>').attr('href', 'https://twitter.com/' + newTweet.user.screen_name),
            nameSpan = angular.element('<span>').text(newTweet.user.name),
            screenNameSpan = angular.element('<span class="screen-name">').text('@' + newTweet.user.screen_name),
            textDiv = angular.element('<div>').attr('class', 'text').html(newTweet.display_text);

          link.append(nameSpan).append(screenNameSpan);
          nameDiv.append(link);
          link.after(newTweet.short_date);
          panelDiv.append(nameDiv);
          panelDiv.append(textDiv);
          panelDiv.hide();
          panelDiv.css('opacity', 0);
          element.prepend(panelDiv);
          panelDiv.slideDown('fast');
          $rootScope.$broadcast('newTweetInStream', {tweetId: newTweet.id_str});

          if (scope.streamtweets.length > MAX_TWEETS) {
            element.find('.tweet:last-child').fadeOut().remove();
          }

          panelDiv.animate({
            opacity: 1,
          }, 600);
        }

      });

    }
  };

}]);