angular.module('events', 
    [
      'ionic',
      'ngAnimate',
      'ngSanitize',
      'events.translations',
      'ion-autocomplete',
      'ngGPlaces',
      'events.EventControllers',
      'events.EventServices',
      'events.WeatherServices',
      'common.GeolocationServices',
      'events.Storage',
      'events.LoginControllers',
      'events.ProfileControllers',
      'events.ProfileServices',
      'events.SettingsControllers',
      'events.SettingsServices',
      'events.FriendControllers',
      'events.FriendServices',
      'events.filters',
      'common.DynamicHeader',
    ]
  )

.run(function($ionicPlatform, $rootScope, $state, $ionicPopup, $translate) {
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
            alert('Exiting the  App...');
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
      console.log('Redirect to login');
      $state.transitionTo("login");
      event.preventDefault(); 
    }
    else {
      if( Parse.User.current() ) {
        locale = Parse.User.current().get('locale');
        $translate.use( locale.toLowerCase() );
      }
    }
  });
})

.config(function($stateProvider, $urlRouterProvider){
    $stateProvider
    .state('events',{
      url:'/events',
      templateUrl:'views/events.html',
      controller:'EventsListController',
      data: {
        authenticate: true
      }
    }).state('editEventName',{
      url:'/event/editName/:objectId',
      controller:'EventEditController',
      templateUrl:'views/editEventName.html',
      data: {
        authenticate: true
      }
    })
    .state('editEventFriends',{
      url:'/event/editFriends/:objectId',
      controller:'EventEditController',
      templateUrl:'views/editEventFriends.html',
      data: {
        authenticate: true
      }
    })
    .state('editEventPlace',{
      url:'/event/editPlace/:objectId',
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
    .state('profile',{
      url:'/profile',
      templateUrl:'views/profile.html',
      controller:'ProfileController',
      data: {
        authenticate: true
      }
    })
    .state('settings',{
      url:'/settings',
      templateUrl:'views/settings.html',
      controller:'SettingsController',
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
  $urlRouterProvider.otherwise('/events');
}); 