var app = angular.module('twitterapp');

var favouriteTweet = function (div, $rootScope) {
  var id_str,
    destroy = div.data('is-favourite');

  id_str = div.data('id-str');

  $rootScope.favouriteTweet(id_str, destroy, function (err, data) {
    if (err) {
      $rootScope.addStreamMessage({'type': 'error', 'msg': 'Unable to reach Twitter'});
    }

    if (!destroy) {
      div.css('color', 'yellow');
      div.data('is-favourite', true);
      syncFavourites(id_str, true);
      $rootScope.addStreamMessage({'type': 'info', 'msg': 'Tweet favourited'});
    } else {
      div.css('color', '#5E6D70');
      div.data('is-favourite', false);
      syncFavourites(id_str, false);
      $rootScope.addStreamMessage({'type': 'info', 'msg': 'Favourite cancelled'});
    }

  });
};

var replyToTweet = function (clicked, scope, tweetFactory, tweetList) {
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
    i,
    found = false,
    screenNames = [];

  tweetFactory.getReplyForm().then(function (promise) {

    parentDiv = clicked.parents('.tweet');
    screenName = parentDiv.find('.screen-name').text();
    //tweetId = parentDiv.find('.tweet-id').text();
    tweetId = clicked.data('id-str');
    screenNames.push(screenName);

    for (i = 0; i < tweetList.length; i++) {
      if (tweetList[i].id_str === tweetId) {
        selectedTweet = tweetList[i];
      }
    }

    if (selectedTweet && selectedTweet.user_mentions && selectedTweet.user_mentions.length > 0) {
      for (i = 0; i < selectedTweet.user_mentions.length; i++) {
        screenNames.push('@' + selectedTweet.user_mentions[i].screen_name);
      }
    }

    formDiv = parentDiv.find('.reply-form');
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
        scope.addStreamMessage({'type': 'info', 'msg': 'Reply sent'});
      });

    });

  });

};

var retweetTweet = function (div, scope, tweetFactory, tweetList) {
  var i,
    selectedTweet,
    retweet = {},
    destroy = div.data('is-retweeted'),
    tweetId = div.data('id-str');

    for (i = 0; i < tweetList.length; i++) {
      if (tweetList[i].id_str === tweetId) {
        selectedTweet = tweetList[i];
        break;
      }
    }

    if (destroy) {
      scope.removeStatus(div.data('retweet-id'));

      scope.$on('removeSuccess', function (event, args) {
        div.css('color', '#5E6D70');
        div.data('is-retweeted', false);
        div.data('retweet-id', false);
        syncRetweets(tweetId, false, false);
        scope.addStreamMessage({'type': 'info', 'msg': 'Tweet removed.'});
      });

    } else {
      tweetFactory.getRetweetForm().then(function (promise) {
        parentDiv = div.parents('.tweet');
        tweetId = parentDiv.find('.tweet-id').text();
        formDiv = parentDiv.find('.retweet-form');
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
            if (args.originalTweetId === tweetId) {
              div.css('color', 'yellow');
              div.data('is-retweeted', true);
              div.data('retweet-id', args.retweetId);
              syncRetweets(tweetId, true, args.retweetId);
              scope.addStreamMessage({'type': 'info', 'msg': 'Retweet sent'});
              formDiv.slideUp();
            }
          });

        });

      }, function (err) {
        scope.addStreamMessage({'type': 'error', 'msg': 'Failed to send retweet.'});
      });
    }
};

var syncFavourites = function (tweetId, isFavourite) {
  var i, str, list, ids = ['#stream', '#favouriteTweets', '#userTweets'];

  for (i = 0; i < ids.length; i++) {
    str = '' + ids[i] + ' .tweet';
    list = $(str);

    if (angular.isDefined(list)) {
      list.each(function (index) {
        var tweet = $(this),
          colour = (isFavourite) ? 'yellow' : '#5E6D70',
          favouriteDiv;

        if (tweet.find('.tweet-id').text() === tweetId) {
          favouriteDiv = tweet.find('.favourite-icon');
          favouriteDiv.css('color', colour);
          favouriteDiv.data('is-favourite', isFavourite);
          return false;
        }
      });
    }

  }

};

var syncRetweets = function (tweetId, isRetweeted, retweetId) {
  var i, str, list, ids = ['#stream', '#favouriteTweets'];

  for (i = 0; i < ids.length; i++) {
    str = '' + ids[i] + ' .tweet';
    list = $(str);

    if (angular.isDefined(list)) {
      list.each(function (index) {
        var tweet = $(this),
          colour = (isRetweeted) ? 'yellow' : '#5E6D70',
          retweetDiv;

        if (tweet.find('.tweet-id').text() === tweetId) {
          retweetDiv = tweet.find('.retweet-icon');
          retweetDiv.css('color', colour);
          retweetDiv.data('is-retweeted', isRetweeted);
          retweetDiv.data('retweet-id', retweetId);
          return false;
        }
      });
    }

  }

};

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

      // Can we refactor this as we use this code in 2 different places
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

app.directive('tweetIconPanel', ['$compile', function ($compile) {

  return {
    replace: false,
    link: function (scope, element, attrs) {
      var panelDiv,
        iconsDiv,
        favouriteDiv,
        replyDiv,
        retweetDiv,
        replyFormDiv,
        retweetFormDiv,
        idDiv,
        newTweet;

      scope.$on('newTweetInStream', function (event, args) {
        newTweet = scope.streamtweets[0];
        panelDiv = angular.element(document.getElementById(newTweet.id_str));
        panelDiv.append($compile('<icon-panel context="stream"></icon-panel>')(scope));
        panelDiv.append(angular.element('<div class="clearfix">'));
      });
    }
  };

}]);

app.directive('iconPanel', ['$rootScope', 'tweetFactory', function ($rootScope, tweetFactory) {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: "components/tweet/views/tweetIconPanel.html",
    link: function (scope, element, attrs) {
      var favouriteDiv = element.find('.favourite-icon'),
        retweetDiv = element.find('.retweet-icon'),
        replyDiv = element.find('.reply-icon'),
        parentDiv = replyDiv.parents('.tweet'),
        tweetId = parentDiv.attr('id'),
        tweetList;

      favouriteDiv.data('id-str', tweetId);
      retweetDiv.data('id-str', tweetId);
      replyDiv.data('id-str', tweetId);

      switch (attrs.context) {
        case 'userTweets':
          retweetDiv.hide();
          favouriteDiv.data('is-favourite', false);
          tweetList = $rootScope.userTweets;
          break;
        case 'favouriteTweets':
          favouriteDiv.data('is-favourite', true);
          favouriteDiv.css('color', 'yellow');
          tweetList = $rootScope.favouriteTweets;
          break;
        default:
          favouriteDiv.data('is-favourite', false);
          tweetList = scope.streamtweets;
          break;
      }

      favouriteDiv.on('click', function () {
        favouriteTweet($(this), $rootScope);
      });

      replyDiv.on('click', function () {
        replyToTweet($(this), scope, tweetFactory, tweetList);
      });

      retweetDiv.on('click', function () {
        retweetTweet($(this), scope, tweetFactory, tweetList);
      });

    }
  };
}]);