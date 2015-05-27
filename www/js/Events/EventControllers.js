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
        Event.myEvent = myEvent;
        $state.transitionTo('showEvent', {objectId: Event.myEvent.id});
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
        $state.go('myEvent', {objectId: Event.myEvent.id});
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
            function(
                $scope,
                Event,
                $state,
                $stateParams, 
                $ionicLoading,
                $ionicActionSheet
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

        //$state.go('editEventDate');
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