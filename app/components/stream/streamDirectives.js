var app = angular.module('twitterapp');

app.directive('streamTweetList', ['socket', 'streamFactory', '$rootScope', function (socket, streamFactory, $rootScope) {
  return {
    replace: true,
    link: function (scope, element, attrs) {

      scope.$watch('streamtweets', function () {
        if (scope['streamtweets'].length > 0) {
          var i,
            id_str,
            tweetFavourited = false,
            newTweet = scope.streamtweets[0],
            replyForm,
            panelDiv = angular.element('<div>').attr('class', 'panel').addClass('tweet').addClass('ngFade')
            nameDiv = angular.element('<div>').attr('class', 'name'),
            link = angular.element('<a>').attr('href', 'https://twitter.com/' + newTweet.user.screen_name),
            nameSpan = angular.element('<span>').text(newTweet.user.name),
            screenNameSpan = angular.element('<span class="screen-name">').text('@' + newTweet.user.screen_name),
            textDiv = angular.element('<div>').attr('class', 'text').html(newTweet.display_text),
            idDiv = angular.element('<div class="tweet-id" style="display:none;">').text(newTweet.id_str);
            iconsDiv = angular.element('<div class="icons">'),
            favouriteIcon = angular.element('<div>').addClass('action-icon').data('id-str', newTweet.id_str).data('is-favourite', false).append(angular.element('<i class="fa fa-star">')),
            replyIcon = angular.element('<div>').addClass('action-icon').data('id-str', newTweet.id_str).append(angular.element('<i class="fa fa-reply">')),
            retweetIcon = angular.element('<div>').addClass('action-icon').data('id-str', newTweet.id_str).append(angular.element('<i class="fa fa-retweet">'))
            replyFormDiv = angular.element('<div class="reply-form" style="display:none;">');

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
            var formDiv,
              parentDiv,
              screenName,
              tweetId,
              replyButton,
              originalMessage,
              replyTweet = {},
              selectedTweet,
              screenNames = [],
              i,
              clicked = $(this);

            streamFactory.getReplyForm().then(function (promise) {
              parentDiv = clicked.parents('.tweet');
              screenName = parentDiv.find('.screen-name').text();
              tweetId = parentDiv.find('.tweet-id').text();
              originalMessage = parentDiv.find('.text');
              screenNames.push(screenName);

              for (i = 0; i < scope.streamtweets.length; i++) {
                if (scope.streamtweets[i].id_str === tweetId) {
                  selectedTweet = scope.streamtweets[i];
                }
              }

              if (selectedTweet && selectedTweet.user_mentions && selectedTweet.user_mentions.length > 0) {
                for (i = 0; i < selectedTweet.user_mentions.length; i++) {
                  screenNames.push('@' + selectedTweet.user_mentions[i].screen_name);
                }
              }

              formDiv = parentDiv.children('.reply-form');
              formDiv.html(promise.data);
              formDiv.find('textarea').text(screenNames.join(' '));
              formDiv.find('.tweet-id').attr('value', selectedTweet.id_str);
              replyButton = formDiv.find('.send-reply');
              formDiv.slideDown();

              replyButton.on('click', function () {
                replyTweet.message = formDiv.find('textarea').val();
                replyTweet.tweetId = formDiv.find('.tweet-id').attr('value');
                scope.sendStatusUpdate(replyTweet, function (data) {
                  if (data.msg === 'Success') {
                    formDiv.find('textarea').text('');
                    formDiv.slideUp();
                  }
                });
              });

            });

          });

          retweetIcon.on('click', function () {
            var div = $(this),
              destroy = div.data('is-retweeted'),
              tweetId = $(this).data('id-str');

            for (i = 0; i < scope.streamtweets.length; i++) {
              if (scope.streamtweets[i].id_str === tweetId) {
                selectedTweet = scope.streamtweets[i];
                $rootScope.retweetedTweet = selectedTweet;

                if (destroy) {
                  scope.removeStatus(div.data('retweet-id'));
                } else {
                  scope.toggleRetweet();
                }
              }
            }

            scope.$on('retweetSuccess', function (event, args) {
              if (!destroy) {
                div.css('color', 'yellow');
                div.data('is-retweeted', true);
                div.data('retweet-id', args.tweetId);
              } else {
                div.css('color', '#5E6D70');
                div.data('is-retweeted', false);
                div.data('retweet-id', false);
              }
            });

          });

          link.append(nameSpan).append(screenNameSpan);
          nameDiv.append(link);
          link.after(newTweet.short_date);
          panelDiv.append(nameDiv);
          panelDiv.append(textDiv);
          panelDiv.append(idDiv);
          iconsDiv.append(replyIcon);
          iconsDiv.append(retweetIcon);
          iconsDiv.append(favouriteIcon);
          panelDiv.append(iconsDiv);
          panelDiv.append(replyFormDiv);
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

app.directive('retweetModal', [function () {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: "components/stream/views/retweet.html"
  };
}]);