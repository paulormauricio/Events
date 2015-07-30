angular.module('events', 
    [
      'ionic',
      'ngCordova',
      'ionic.service.core',
      'ionic.service.push',
      'ngAnimate',
      'ion-autocomplete',
      'ngGPlaces',
      'events.translations',
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
      'events.IonicServices'
    ]
  )

.run(function($ionicPlatform, $rootScope, $state, $ionicPopup, $translate, $cordovaNetwork, Language) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)

    document.addEventListener("pause", function() {
        alert("The application when to background mode");
    }, false);

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

    Language.set();
  })

  // listen for Offline event
  $rootScope.$on('$cordovaNetwork:offline', function(event, networkState){
    //var offlineState = networkState;
    $ionicPopup.alert({
      title: 'Internet Disconnected',
      template: 'The internet is disconnected on your device.',
      okText: 'Continue',
      okType: 'button-light'
    });
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
      Language.set();
    }
  });
})

.config(['$ionicAppProvider', function($ionicAppProvider) {
  // Identify app
  $ionicAppProvider.identify({
    // The App ID (from apps.ionic.io) for the server
    app_id: '0d7d2a38',
    // The public API key all services will use for this app
    api_key: 'ad0133ac388fc7014720dccfed644127c506109281f00e29',
    // Set the app to use development pushes
    dev_push: true,
    // The GCM project number
    gcm_id: 'AIzaSyAo1_8GKCmgPHRlGa_IqZI4F7p6JOBmwNk'
  });
}])

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
      url:'/event/editName/:isNew/:objectId',
      controller:'EventEditNameController',
      templateUrl:'views/editEventName.html',
      data: {
        authenticate: true
      }
    })
    .state('editEventFriends',{
      url:'/event/editFriends/:isNew/:objectId',
      controller:'EventEditParticipantsController',
      templateUrl:'views/editEventFriends.html',
      data: {
        authenticate: true
      }
    })
    .state('editEventPlace',{
      url:'/event/editPlace/:objectId',
      controller:'EventEditPlaceController',
      templateUrl:'views/editEventPlace.html',
      data: {
        authenticate: true
      }
    })
    .state('showEvent',{
      url:'/event/:objectId',
      controller:'EventShowController',
      templateUrl:'views/showEvent.html',
      cache: false,
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