angular.module('events.LoginControllers', [])

  .controller('LoginController', 
    [
      '$scope', 
      '$state',
      'Event',
      'PushService',
      'Language',
      function(
        $scope, 
        $state,
        Event,
        PushService,
        Language
      )
    {
    
    if( Parse.User.current() ) {
      alert('Users logged in. Redirect to Events');
      $state.transitionTo("events");
    }

    var fbLogged = new Parse.Promise();
      
    var fbLoginSuccess = function(response) {
      if (!response.authResponse){
        fbLoginError("Cannot find the authResponse");
        return;
      }
      var expDate = new Date(
        new Date().getTime() + response.authResponse.expiresIn * 1000
      ).toISOString();

      var authData = {
        id: String(response.authResponse.userID),
        access_token: response.authResponse.accessToken,
        expiration_date: expDate
      }
      fbLogged.resolve(authData);
      console.log(response);
    };

    var fbLoginError = function(error){
      fbLogged.reject(error);
    };

    $scope.login = function() {
      
      console.log('Login');
      if (!window.cordova) {
        facebookConnectPlugin.browserInit('1536111309938547');
      }
      facebookConnectPlugin.login(['email, user_friends'], fbLoginSuccess, fbLoginError);
      
      fbLogged.then( function(authData) {
        console.log('Promised');
        return Parse.FacebookUtils.logIn(authData);
      })
      .then( function(userObject) {
        //Get User Info
        facebookConnectPlugin.api('/me', null, 
          function(response) {
            console.log('Facebook PersonalData: ');
            console.log(response);
            userObject.set('name', response.name);
            userObject.set('email', response.email);
            if( response.gender ) userObject.set('gender', response.gender);
            if( response.id ) userObject.set('facebookId', response.id);
            if( response.first_name ) userObject.set('first_name', response.first_name);
            if( response.last_name ) userObject.set('last_name', response.last_name);
            if( response.locale ) userObject.set('locale', response.locale.toLowerCase() );
            
            userObject.save();
          },
          function(error) {
            alert('Login error: ', error);
          }
        );
        //Get Friends
        facebookConnectPlugin.api('/me/friends?limit=5000', null, 
          function(response) {
            console.log('Facebook Friends:');
            console.log(response);

            var Friend = null;
            var User = userObject;

            for (i = 0; i < response.data.length; i++) { 

              Friend = Parse.Object.extend("User");
              
              var query = new Parse.Query(Friend);
              query.equalTo("facebookId", response.data[i].id);
              query.first({
                success: function(object) {

                  Friend = object;

                  var UserFriend = Parse.Object.extend("Friend");

                  var query = new Parse.Query(UserFriend);
                  query.equalTo("User", User);
                  query.equalTo("Friend", Friend);
                  query.first({
                    success: function(object) {
                      // IF friends relation was not added before, then store relationship
                      if (object === undefined) {
                        var UserFriend = Parse.Object.extend("Friend");
                        var UserRelation = new UserFriend();
                        UserRelation.set('User', User);
                        UserRelation.set('Friend', Friend);
                        UserRelation.set('isActive', true);
                        UserRelation.save();

                        var FriendRelation = new UserFriend();
                        FriendRelation.set('User', Friend);
                        FriendRelation.set('Friend', User);
                        FriendRelation.set('isActive', true);
                        FriendRelation.save();

                        console.log('Save Friends Success');
                      }
                    }
                  });
                  

                },
                error: function(error) {
                  alert('Login error: ', error);
                }
              });

            }
          },
          function(error) {
            alert('Login error: ', error);
          }
        );
        

        PushService.init();

        Language.set();

        Event.isForceGetEvents = true;
        
        $state.go('events');
      })

    };
  }]);