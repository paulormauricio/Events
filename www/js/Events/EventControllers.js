angular.module('events.EventControllers',[])

.controller('EventsListController',['$state', '$scope', '$ionicLoading', 'Event', function($state, $scope,$ionicLoading,Event){
    

    $scope.loadingIndicator = $ionicLoading.show({
        content: 'Loading events',
        animation: 'fade-in',
        showBackdrop: false,
        maxWidth: 200,
        showDelay: 500
    });

    Event.getAll()
    .then(function(objects) {
        $scope.objects = objects;
        console.log('Events: ', objects);
        $ionicLoading.hide();
    });
    
    $scope.doRefresh = function() {
        Event.getAll().then(function(objects) {
            $scope.objects = objects;
            $scope.$broadcast('scroll.refreshComplete');
        });
    }

    $scope.showEvent = function(myEvent) {
        Event.showEvent = myEvent;
        $state.transitionTo('showEvent', {objectId: Event.showEvent.id});
    }

}])

.controller('EventEditController',
        [
            '$scope', 
            '$state', 
            '$stateParams',
            '$ionicLoading',
            'Event', 
            'Friend', 
            'Participant',
            'Theme',
            function(
                $scope,
                $state, 
                $stateParams,
                $ionicLoading, 
                Event, 
                Friend,
                Participant,
                Theme
            )
        {

    $scope.object = {};

    console.log( 'Event:', Event );

    $scope.loadingIndicator = $ionicLoading.show({
        content: 'Loading Data',
        animation: 'fade-in',
        showBackdrop: false,
        maxWidth: 200,
        showDelay: 500
    });

    $scope.storeName = function() {

        $scope.loadingIndicator = $ionicLoading.show({
            content: 'Loading Data',
            animation: 'fade-in',
            showBackdrop: false,
            maxWidth: 200,
            showDelay: 500
        });

        console.log('Event:', $scope.object);

        Event.myEvent.set('name', $scope.object.name);

        console.log('myEvent:', Event.myEvent);

        Event.save().then(function() {
            Participant.store(Event.myEvent, Parse.User.current());
            Event.newGoingParticipant();
            $state.go('editEventFriends', {}, {reload: true});
        });

    }

    $scope.storeFriends = function() {
        
        console.log('Store Friends');

    }

    $scope.create = function() {
        Event.create($scope.object).then( function() {
            $state.go('tab.events');
        });
    }

    $scope.loadThemes = function() {
        $scope.object.name = Event.myEvent.get('name');
        $scope.object.backgroundColor = Event.myEvent.has('Theme') ? Event.myEvent.get('Theme').get('backgroundColor') : ';';
        $scope.object.iconUrl = Event.myEvent.has('Theme') ? Event.myEvent.get('Theme').get('icon').url() : '';

        console.log('load past Events');

        Theme.getAll().then(function(themes){
            $scope.themes = themes;
            console.log('Themes: ', themes);
        });

        $ionicLoading.hide();
    }

    $scope.loadFriends = function() {
        console.log('chegou ao loadFriends');

        $scope.friends = [];
        $scope.invitedFriends = [];
        
        Friend.getAllExceptParticipants().then(function(friends) {

            $scope.friends = friends;

            console.log('friends: ', $scope.friends);

            Participant.getAll(Event.myEvent).then(function(invitedFriends){
                $scope.invitedFriends = invitedFriends;
                console.log('invitedFriends: ', $scope.invitedFriends);
                $ionicLoading.hide();
            })
            .catch(function(fallback) {
                console.log('Error: ', fallback + '!!');
                $ionicLoading.hide();
            });
            
        })
        .catch(function(fallback) {
            console.log('Error: ', fallback + '!!');
            $ionicLoading.hide();
        });
    }

    $scope.inviteFriend = function(index) {
        console.log('chegou ao invite Friends. Index = ' + index);
        
        var participant = Participant.store(Event.myEvent, $scope.friends[index].get('Friend'));

        $scope.friends.splice(index, 1);
        $scope.invitedFriends.push( participant );
    }

    $scope.uninviteFriend = function(index) {
        console.log('chegou ao uninvite Friends. Index = ' + index + ': ', $scope.invitedFriends[index]);

        var newFriend = Friend.newFriend($scope.invitedFriends[index].get('User'));

        $scope.friends.push( newFriend );

        Participant.delete($scope.invitedFriends[index]);

        $scope.invitedFriends.splice(index, 1);
    }

    $scope.selectTheme = function(index, theme) {

        Event.selectTheme(theme);

        $scope.object.backgroundColor = Event.myEvent.has('Theme') ? Event.myEvent.get('Theme').get('backgroundColor') : ';';
        $scope.object.iconUrl = Event.myEvent.has('Theme') ? Event.myEvent.get('Theme').get('icon').url() : '';

    }

    $scope.notifyParticipants = function() {
        console.log('Notify Participants');
        Event.showEvent = Event.myEvent;
        Event.resetMyEvent();
        $state.go('showEvent', {objectId: Event.showEvent.id});
    }

    $scope.loadDates = function() {
        $scope.object.date = new Date();
        showDatePicker();
        $ionicLoading.hide();
    }

    function showDatePicker() {

        if( ionic.Platform.isIOS() || ionic.Platform.isAndroid() || ionic.Platform.isWindowsPhone() ) {
            var options = {
                date: $scope.object.date,
                mode: 'datetime',
                allowOldDates: false,
                minuteInterval: 5
            };

            datePicker.show(options, function(date){
                alert("date result " + date);  
            });
        }
    }

    $scope.setDate = function(date) {
        $scope.object.date = date;
    }

    $scope.storeDate = function() {
        console.log('Chegou ao StoreDate');
        Event.myEvent.set('date', $scope.object.date);
        console.log('Event: ', Event.myEvent);
    }


}])

.controller('EventShowController',
        [
            '$scope',
            'Event',
            '$state',
            '$stateParams',
            '$ionicLoading', 
            '$ionicActionSheet',
            '$timeout',
            function(
                $scope,
                Event,
                $state,
                $stateParams, 
                $ionicLoading,
                $ionicActionSheet,
                $timeout
            )
    {

    $scope.loadingIndicator = $ionicLoading.show({
        content: 'Loading Data',
        animation: 'fade-in',
        showBackdrop: false,
        maxWidth: 200,
        showDelay: 500
    });

    if( !Event.myEvent.id ) {
        Event.get($stateParams.objectId).then(function(object) {
            Event.myEvent = object;
            loadEventDetail();
            $ionicLoading.hide();
        })
        .catch(function(fallback) {
            console.log('Error: ', fallback + '!!');
            $ionicLoading.hide();
        });
    }
    else {
        loadEventDetail();
        $ionicLoading.hide();
    }

    function loadEventDetail() {
        $scope.object = Event.myEvent;
        $scope.object.backgroundColor = Event.myEvent.has('Theme') ? Event.myEvent.get('Theme').get('backgroundColor') : ';';
        $scope.object.iconUrl = Event.myEvent.has('Theme') ? Event.myEvent.get('Theme').get('icon').url() : '';

        console.log('Show Event: ', $scope.object);
    }

    $scope.editDate = function() {
        console.log('Chegou ao EditDate');
        $scope.showAngularDateEditor = true;

        var date = Event.showEvent.get('date');

        alert('isWebView: '+ ionic.Platform.isWebView());
        alert('isIPad: '+ ionic.Platform.isIPad());
        alert('isIOS: '+ ionic.Platform.isIOS());
        alert('isAndroid: '+ ionic.Platform.isAndroid());
        alert('isWindowsPhone: '+ ionic.Platform.isWindowsPhone());

        if( ionic.Platform.isIOS() ||
            ionic.Platform.isAndroid() ||
            ionic.Platform.isWindowsPhone()
            ) {
            alert('Device: ', ionic.Platform.device() );

            var options = {
                date: new Date(),
                mode: 'datetime',
                minuteInterval: 5,
                allowOldDates: false,
                doneButtonColor: '#0000FF',
                cancelButtonColor: '#000000'
            };

            datePicker.show(options, function(newDate){
                alert("date result " + newDate);  
                date = newDate;
            });
        }
        else {
            console.log('is WebBrowser');

            // Show the action sheet
            var hideSheet = $ionicActionSheet.show({
             buttons: [
               { text: 'In 15 minutes' },
               { text: 'In 30 minutes' },
               { text: 'In 60 minutes' },
               { text: 'In 2 hours' }
             ],
             destructiveText: 'Clear event date',
             // titleText: 'Modify your album',
             cancelText: 'Cancel',
             cancel: function() {
                  // add cancel code..
                },
             buttonClicked: function(index) {
                console.log('Button clicked. Index = ', index);
               return true;
             },
             destructiveButtonClicked: function() {
                console.log('chegou ao delete');
                date = '';
             }
            });

            // For example's sake, hide the sheet after two seconds
            $timeout(function() {
             hideSheet();
            }, 8000);

        }

        alert('chegou ao Save Date');
        // Event.showEvent.set('date', date);
        // Event.myEvent = Event.showEvent;
        // Event.save();
        // Event.resetMyEvent();
        // $scope.object = Event.showEvent;


        //$state.go('editEventDate');
    }

    function saveDate(date) {
    }

    function showDatePicker() {

        if( ionic.Platform.isIOS() || ionic.Platform.isAndroid() || ionic.Platform.isWindowsPhone() ) {
            var options = {
                date: $scope.object.date,
                mode: 'datetime',
                allowOldDates: false,
                minuteInterval: 5
            };

            datePicker.show(options, function(date){
                alert("date result " + date);  
            });
        }
    }

    $scope.setDate = function(date) {
        $scope.object.date = date;
    }

    $scope.storeDate = function() {
        console.log('Chegou ao StoreDate');
        Event.myEvent.set('date', $scope.object.date);
        console.log('Event: ', Event.myEvent);
    }

}]);