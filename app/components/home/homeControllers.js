var app = angular.module('twitterapp');

app.controller('homeCtrl', ['$scope', '$window', '$rootScope', 'ipCookie', 'userFactory', 'tConfig', '$sce', '$location', function ($scope, $window, $rootScope, ipCookie, userFactory, tConfig, $sce, $location) {

  var userId;

  // If the user refreshes a page retrieve the token from sessionStorage
  if (angular.isDefined($window.sessionStorage.token) && (!angular.isDefined($rootScope.tweetapp) || $rootScope.tweetapp.authorised == false)) {
    $rootScope.tweetapp = {};
    $rootScope.tweetapp.authorised = true;
    ipCookie(tConfig.sessionCookieName, $window.sessionStorage.token, { expires:365 });
  }
  // If sessionStorage isn't available try the cookie
  else {
    token = ipCookie(tConfig.sessionCookieName);
    if (angular.isDefined(token) && (!angular.isDefined($rootScope.tweetapp) || $rootScope.tweetapp.authorised == false)) {
      $window.sessionStorage.token = token;
      $rootScope.tweetapp = {};
      $rootScope.tweetapp.authorised = true;
    }
  }

  $rootScope.bodyClass = 'login';
  $rootScope.mobileMenuVisible = false;
  $rootScope.mobileTrendsVisible = false;
  $rootScope.mobileUserTweetsVisible = false;
  $rootScope.mobileFavouriteTweetsVisible = false;
  $rootScope.serverUrl = $sce.trustAsResourceUrl(tConfig.apiData.server + tConfig.apiData.twitterLoginUrl);
  $rootScope.siteUrl = $sce.trustAsResourceUrl(tConfig.apiData.siteUrl);

  $rootScope.toggleMenu = function () {
    $rootScope.mobileMenuVisible = !$rootScope.mobileMenuVisible;
  };

  $rootScope.hideAll = function () {
    $rootScope.mobileTrendsVisible = false;
    $rootScope.mobileUserTweetsVisible = false;
    $rootScope.mobileFavouriteTweetsVisible = false;
    $rootScope.mobileMenuVisible = false;
  };

  $rootScope.toggleMobileTrends = function () {
    $rootScope.mobileTrendsVisible = !$rootScope.mobileTrendsVisible;
    $rootScope.mobileMenuVisible = false;
  };

  $rootScope.toggleMobileUserTweets = function () {
    if (!$rootScope.mobileUserTweetsVisible && $rootScope.userTweets.length === 0) {
      alert('You have not yet posted any tweets');
    } else {
      $rootScope.mobileUserTweetsVisible = !$rootScope.mobileUserTweetsVisible;
    }
    $rootScope.mobileMenuVisible = false;
  };

  $rootScope.toggleMobileFavouriteTweets = function () {
    if (!$rootScope.mobileFavouriteTweetsVisible && $rootScope.favouriteTweets.length === 0) {
      alert('You don\'t have any favourites')
    } else {
      $rootScope.mobileFavouriteTweetsVisible = !$rootScope.mobileFavouriteTweetsVisible;
    }
    $rootScope.mobileMenuVisible = false;
  };

  // Fetch the session data from the API
  if (angular.isDefined($rootScope.tweetapp) && $rootScope.tweetapp.authorised) {

    userFactory.userSessionData().then(function (data) {

      $rootScope.bodyClass = 'home';

      data = data.data;

      $window.sessionStorage.user_id = data.data.user_id;
      $window.sessionStorage.screen_name = data.data.screen_name;
      $scope.user = data.data;
      $scope.tweetapp.user = data.data;
      userId = data.data.user_id;
      $rootScope.user = $scope.user;
      $scope.tweets_for = 'user ' + $scope.user.screen_name;

      userFactory.userTwitterData(data.data.user_id).then(function (response) {
        if (response.status == '200') {
          var mongo_id = $scope.user._id;
          $scope.user = response.data;
          $rootScope.user = $scope.user;
          $scope.user._id = mongo_id;
          $rootScope.$broadcast('tweetAppAuthorised');
        } else {
          $rootScope.logoutMsg = 'You have been logged out due to inactivity. Please login again.';
          $location.path('/logout');
        }
      }, function (err) {
        $rootScope.logoutMsg = 'You have been logged out due to inactivity. Please login again.';
        $location.path('/logout');
      });

    }, function (err) {
      $rootScope.logoutMsg = 'Unable to retrieve data from Twitter. Please try again later.';
      $location.path('/logout');
    });

  };

}]);

app.controller('headerCtrl', ['$scope', '$window', '$location', function ($scope, $window, $location) {

}]);

app.controller('errorCtrl', ['$scope', '$window', '$location', function($scope, $window, $location) {
    
}]);

// default - handle any requests not for an authorised URL
app.controller('defaultCtrl', ['$scope', '$window', '$location', function($scope, $window, $location) {
  $location.path('/home');
}]);