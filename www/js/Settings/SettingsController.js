angular.module('events.SettingsControllers', [])

  .controller('SettingsController', 
    [
      '$scope', 
      '$state', 
      '$filter', 
      '$ionicActionSheet',
      '$timeout',
      '$translate',
      'Settings', 
      function(
        $scope, 
        $state, 
        $filter, 
        $ionicActionSheet,
        $timeout,
        $translate,
        Settings
      )
    {
console.log('');
console.log('<<<<<<-----------   Settings Screen  ---------->>>>>');

    $scope.locale = Parse.User.current().get('locale').toLowerCase();

    $scope.changeLocale = function() {

      var locales = Settings.getAll();
      console.log('locales: ', locales);
      // Show the action sheet
      var hideSheet = $ionicActionSheet.show({
          buttons: locales ,
          titleText: $filter('translate')('locale_change'),
          cancelText: $filter('translate')('cancel'),
          cancel: function() {
              // add cancel code..
          },
          buttonClicked: function(index) {
              console.log('Button clicked. (Index, locale) = ', index,',',locales[index].code);

              Parse.User.current().set('locale', locales[index].code);
              $scope.locale = locales[index].code;

              $translate.use( locales[index].code );

              hideSheet();
              return;
          }
      });

      // For example's sake, hide the sheet after two seconds
      $timeout(function() {
          hideSheet();
      }, 8000);

    }

    $scope.logout = function() {
      console.log('Logout');
       
      facebookConnectPlugin.logout(
        function (success) {
          $state.go('login');
        },
        function (failure) { console.log(failure) }
      );
      
      Parse.User.logOut();

      ionic.Platform.exitApp();
      
      $state.go('login');
    };
    
  }]);
