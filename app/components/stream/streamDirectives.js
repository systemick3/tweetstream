var app = angular.module('twitterapp');

app.directive('streamTweetList', ['$rootScope', 'userFactory', function ($rootScope, userFactory) {
  return {
    replace: true,
    link: function (scope, element, attrs) {
      var lastTweet;

      scope.$watch('streamtweets', function () {
        if (scope.streamtweets.length > 0) {
          var newTweet = scope.streamtweets[0],
            panelDiv = angular.element('<div>').attr('class', 'panel').addClass('tweet').addClass('ngFade').attr('id', newTweet.id_str),
            imageDiv = angular.element('<div>').attr('class', 'image').addClass('hidden-xs'),
            contentDiv = angular.element('<div>').attr('class', 'tweet-content'),
            image = angular.element('<img>').attr('src', newTweet.user.image).attr('height', '50').attr('width', '50'),
            nameDiv = angular.element('<div>').attr('class', 'name'),
            link = angular.element('<a>').attr('href', 'https://twitter.com/' + newTweet.user.screen_name),
            nameSpan = angular.element('<span>').text(newTweet.user.name),
            screenNameSpan = angular.element('<span class="screen-name">').text('@' + newTweet.user.screen_name),
            textDiv = angular.element('<div>').attr('class', 'text').html(newTweet.display_text),
            idDiv = angular.element('<div class="tweet-id" style="display:none;">').text(newTweet.id_str);

          imageDiv.append(image);
          link.append(nameSpan).append(screenNameSpan);
          nameDiv.append(link);
          link.after(newTweet.short_date);
          panelDiv.append(imageDiv);
          contentDiv.append(nameDiv);
          contentDiv.append(textDiv);
          contentDiv.append(idDiv);
          panelDiv.append(contentDiv);
          panelDiv.hide();
          panelDiv.css('opacity', 0);
          element.prepend(panelDiv);
          panelDiv.slideDown('fast', function () {
            imageDiv.css('min-height', panelDiv.height());
          });
          $rootScope.$broadcast('newTweetInStream', {tweetId: newTweet.id_str});

          panelDiv.animate({
            opacity: 1,
          }, 600);
        }

      });

      // Current limit is 20.
      // Remove last tweet when we exceed that limit
      scope.$on('tweetRemovedFromStream', function (event, args) {
        lastTweet = element.find('.tweet:last-child');
        lastTweet.fadeOut().remove();
      });

      // Unable to find any tweets for the current filter
      scope.$on('noFilteredTweets', function (event, args) {
        scope.addStreamMessage({'type': 'info', 'msg': 'No tweets in the last few seconds tagged ' + args.filter});
      });

    }
  };

}]);