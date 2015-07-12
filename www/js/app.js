angular.module('events', 
    [
      'ionic',
      'ngAnimate',
      'pascalprecht.translate',
      'ion-autocomplete',
      'ngGPlaces',
      'events.EventControllers',
      'events.EventServices',
      'events.WeatherServices',
      'events.GeolocationServices',
      'events.Storage',
      'events.LoginControllers',
      'events.ProfileControllers',
      'events.ProfileServices',
      'events.FriendControllers',
      'events.FriendServices',
      'events.filters'
    ]
  )

.run(function($ionicPlatform, $rootScope, $state, $ionicPopup) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
    if(window.Connection) {
      if(navigator.connection.type == Connection.NONE) {
        $ionicPopup.confirm({
          title: "Internet Disconnected",
          content: "The internet is disconnected on your device."
        })
        .then(function(result) {
          if(!result) {
            console.log('warning result: ', result);
            //ionic.Platform.exitApp();
          }
        });
      }
    }
  });

  // UI Router Authentication Check
  $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams){
    if (toState.data.authenticate && !Parse.User.current()) {
      // User isn’t authenticated
      $state.transitionTo("login");
      event.preventDefault(); 
    }
  });
})

.config(function($stateProvider, $urlRouterProvider){
    $stateProvider
    .state('tab', {
      url: '/tab',
      abstract: true,
      templateUrl: 'views/tabs.html'
    })
    .state('tab.events',{
      url:'/events',
      views: {
        'events': {
          templateUrl:'views/events.html',
          controller:'EventsListController'
        }
      },
      data: {
        authenticate: true
      }
    }).state('editEventName',{
      url:'/event/editName',
      controller:'EventEditController',
      templateUrl:'views/editEventName.html',
      data: {
        authenticate: true
      }
    })
    .state('editEventFriends',{
      url:'/event/editFriends',
      controller:'EventEditController',
      templateUrl:'views/editEventFriends.html',
      data: {
        authenticate: true
      }
    })
    .state('editEventPlace',{
      url:'/event/editPlace',
      controller:'EventEditController',
      templateUrl:'views/editEventPlace.html',
      data: {
        authenticate: true
      }
    })
    .state('showEvent',{
      url:'/event/:objectId',
      controller:'EventShowController',
      templateUrl:'views/showEvent.html',
      data: {
        authenticate: true
      }
    })
    .state('tab.profile',{
      url:'/profile',
      views: {
        'profile': {
          templateUrl:'views/profile.html',
          controller:'ProfileController'
        }
      },
      data: {
        authenticate: true
      }
    })
    .state('friends',{
      url:'/friends',
      templateUrl:'views/friends.html',
      controller:'FriendsListController',
      data: {
        authenticate: true
      }
    })
    .state('login', {
      url: '/login',
      templateUrl: 'views/login.html',
      controller: 'LoginController',
      data: {
        authenticate: false
      }
    });

  // Send to events if the URL was not found
  $urlRouterProvider.otherwise('/tab/events');
}); 