var app = angular.module('twitterapp');

app.directive('streamTweetList', ['socket', function (socket) {
  return {
    replace: true,
    link: function (scope, element, attrs) {

      scope.$watch('streamtweets', function () {
        if (scope['streamtweets'].length > 0) {
          var i,
            id_str,
            tweetFavourited = false,
            newTweet = scope.streamtweets[0],
            panelDiv = angular.element('<div>').attr('class', 'panel').addClass('tweet').addClass('ngFade')
            nameDiv = angular.element('<div>').attr('class', 'name'),
            link = angular.element('<a>').attr('href', 'https://twitter.com/' + newTweet.user.screen_name),
            nameSpan = angular.element('<span>').text(newTweet.user.name),
            screenNameSpan = angular.element('<span>').text(newTweet.user.screen_name),
            textDiv = angular.element('<div>').attr('class', 'text').html(newTweet.display_text),
            iconsDiv = angular.element('<div class="icons">'),
            favouriteIcon = angular.element('<div>').addClass('action-icon').data('id-str', newTweet.id_str).data('is-favourite', false).append(angular.element('<i class="fa fa-star">')),
            replyIcon = angular.element('<div>').addClass('action-icon').data('id-str', newTweet.id_str).append(angular.element('<i class="fa fa-reply">')),
            retweetIcon = angular.element('<div>').addClass('action-icon').data('id-str', newTweet.id_str).append(angular.element('<i class="fa fa-retweet">'));

          favouriteIcon.on('click', function () {
            var div = $(this),
              destroy = div.data('is-favourite');

            id_str = div.data('id-str');
            scope.favouriteTweet(id_str, destroy, function (err, data) {
              if (err) {
                console.log('FAVOURITE ERROR');
                console.log(err);
              }

              if (!destroy) {
                div.css('color', 'yellow');
                div.data('is-favourite', true);
              } else {
                div.css('color', '#5E6D70');
                div.data('is-favourite', false);
              }
            });
          });

          replyIcon.on('click', function () {
            alert('Hello ' + $(this).data('id-str'));
          });

          retweetIcon.on('click', function () {
            alert('Hello ' + $(this).data('id-str'));
          });

          link.append(nameSpan).append(screenNameSpan);
          nameDiv.append(link);
          link.after(newTweet.short_date);
          panelDiv.append(nameDiv);
          panelDiv.append(textDiv);
          iconsDiv.append(replyIcon);
          iconsDiv.append(retweetIcon);
          iconsDiv.append(favouriteIcon);
          panelDiv.append(iconsDiv);
          panelDiv.hide();
          panelDiv.css('opacity', 0);
          element.prepend(panelDiv);
          panelDiv.slideDown('fast');

          if (scope.streamtweets.length > 10) {
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