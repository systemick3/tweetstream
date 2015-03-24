var app = angular.module('twitterapp');

app.directive('tweetForm', [function () {

  return {
    restrict: 'E',
    replace: true,
    templateUrl: "components/tweet/views/tweetForm.html",
    link: function (scope, element, attrs) {
      var MAX_CHARS = 140,
        parentElement = element.parent(),
        charCountDiv = parentElement.find('.char-count'),
        tweetButton = parentElement.find('.send-tweet'),
        textarea = parentElement.find('textarea');

      var resetForm = function () {
        scope.newTweet.message = '';
        scope.newTweetForm.$setPristine();
        textarea.attr('rows', '1');
        charCountDiv.text(MAX_CHARS);
      };

      textarea.focus(function () {
        textarea.attr('rows', '4');
      });

      textarea.blur(function () {
        if (!angular.isDefined(scope.newTweet) || !angular.isDefined(scope.newTweet.message) || scope.newTweet.message === '') {
          textarea.attr('rows', '1');
        }
      });

      textarea.keyup(function () {
        var charsRemaining,
          charCount = textarea.val().length;

        charsRemaining = MAX_CHARS - charCount;
        charCountDiv.text(charsRemaining);

        if (charsRemaining < 0) {
          charCountDiv.css('color', 'red');
          tweetButton.attr('disabled', 'true');
        } else {
          charCountDiv.css('color', '#5E6D70');
          tweetButton.removeAttr('disabled');
        }

      });

      scope.$on('tweetSuccess', function (event, args) {
        resetForm();
      })

    }
  };

}]);

app.directive('tweetIconPanel', ['$rootScope', 'tweetFactory', function ($rootScope, tweetFactory) {

  return {
    restrict: 'E',
    replace: false,
    link: function (scope, element, attrs) {
      var panelDiv,
        iconsDiv,
        favouriteIcon,
        replyIcon,
        retweetIcon,
        replyFormDiv,
        idDiv,
        newTweet;

      scope.$on('newTweetInStream', function (event, args) {
        newTweet = scope.streamtweets[0];
        favouriteIcon = angular.element('<div>').addClass('action-icon').data('id-str', newTweet.id_str).data('is-favourite', false).append(angular.element('<i title = "Favourite" class="fa fa-star">'));
        replyIcon = angular.element('<div>').addClass('action-icon').data('id-str', newTweet.id_str).append(angular.element('<i title="Reply" class="fa fa-reply">'));
        retweetIcon = angular.element('<div>').addClass('action-icon').data('id-str', newTweet.id_str).append(angular.element('<i title="Retweet" class="fa fa-retweet">'));
        replyFormDiv = angular.element('<div class="reply-form" style="display:none;">');
        retweetFormDiv = angular.element('<div class="retweet-form" style="display:none;">');
        idDiv = angular.element('<div class="tweet-id" style="display:none;">').text(newTweet.id_str);
        panelDiv = angular.element(document.getElementById(newTweet.id_str));
        panelDiv.append(idDiv);
        iconsDiv = angular.element('<div class="icons">');
        iconsDiv.append(replyIcon);
        iconsDiv.append(retweetIcon);
        iconsDiv.append(favouriteIcon);
        panelDiv.append(iconsDiv);
        panelDiv.append(angular.element('<div class="clearfix">'))
        panelDiv.append(replyFormDiv);
        panelDiv.append(retweetFormDiv);

        favouriteIcon.on('click', function () {
          var div = $(this),
            id_str,
            destroy = div.data('is-favourite');

          id_str = div.data('id-str');
          $rootScope.favouriteTweet(id_str, destroy, function (err, data) {
            if (err) {
              $rootScope.addStreamMessage({'type': 'error', 'msg': 'Unable to reach Twitter'});
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
            textarea,
            charCountDiv,
            charsRemaining,
            MAX_CHARS = 140,
            parentDiv,
            screenName,
            tweetId,
            replyButton,
            replyTweet = {},
            selectedTweet,
            screenNames = [],
            clicked = $(this);

          tweetFactory.getReplyForm().then(function (promise) {
            var originalMessage,
              i;

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
            textarea = formDiv.find('textarea');
            textarea.text(screenNames.join(' '));
            charCountDiv = formDiv.find('.char-count');
            charsRemaining = MAX_CHARS - textarea.val().length;
            charCountDiv.text(charsRemaining);
            formDiv.find('.tweet-id').attr('value', selectedTweet.id_str);
            cancelButton = formDiv.find('.cancel-reply');
            replyButton = formDiv.find('.send-reply');
            formDiv.slideDown();

            // Increment/decrement the char count
            // when new chars are entered into the textarea
            textarea.keyup(function () {

              charsRemaining = MAX_CHARS - textarea.val().length;
              charCountDiv.text(charsRemaining);

              if (charsRemaining < 0) {
                charCountDiv.css('color', 'red');
                replyButton.attr('disabled', 'true');
              } else {
                charCountDiv.css('color', '#5E6D70');
                replyButton.removeAttr('disabled');
              }

            });

            // Cancel button click
            cancelButton.on('click', function () {
              formDiv.find('textarea').text('');
              formDiv.slideUp();
            });

            // Reply button click
            replyButton.on('click', function () {
              replyTweet.message = formDiv.find('textarea').val();
              replyTweet.tweetId = formDiv.find('.tweet-id').attr('value');

              scope.sendStatusUpdate(replyTweet);

              scope.$on('replySuccess', function (event, args) {
                formDiv.find('textarea').text('');
                formDiv.slideUp();
              });

            });

          });

        });

        retweetIcon.on('click', function () {
          var div = $(this),
            i,
            selectedTweet,
            retweet = {},
            destroy = div.data('is-retweeted'),
            tweetId = $(this).data('id-str');

          for (i = 0; i < scope.streamtweets.length; i++) {
            if (scope.streamtweets[i].id_str === tweetId) {
              selectedTweet = scope.streamtweets[i];
              $rootScope.retweetedTweet = selectedTweet;
              break;
            }
          }

          if (destroy) {

            scope.removeStatus(div.data('retweet-id'));

            scope.$on('removeSuccess', function (event, args) {
              div.css('color', '#5E6D70');
              div.data('is-retweeted', false);
              div.data('retweet-id', false);
            });

          } else {

            tweetFactory.getRetweetForm().then(function (promise) {
              parentDiv = div.parents('.tweet');
              tweetId = parentDiv.find('.tweet-id').text();
              formDiv = parentDiv.children('.retweet-form');
              formDiv.html(promise.data);
              formDiv.find('.tweet-id').attr('value', selectedTweet.id_str);
              cancelButton = formDiv.find('.cancel-retweet');
              retweetButton = formDiv.find('.send-retweet');
              formDiv.slideDown();

              // Cancel button click
              cancelButton.on('click', function () {
                formDiv.find('textarea').text('');
                formDiv.slideUp();
              });

              // Retweet button click
              retweetButton.on('click', function () {

                scope.sendStatusRetweet(tweetId);

                scope.$on('retweetSuccess', function (event, args) {
                  div.css('color', 'yellow');
                  div.data('is-retweeted', true);
                  div.data('retweet-id', args.tweetId);
                  formDiv.slideUp();
                });

              });

            });
          }

        });

      });
    }
  };

}]);