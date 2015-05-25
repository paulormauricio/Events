angular.module('events.EventControllers',[])

.controller('EventsListController',['$scope', '$ionicLoading', 'Event',function($scope,$ionicLoading,Event){
    

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

        console.log('Event:', $scope.object);

        

        Event.myEvent.set('name', $scope.object.name);

        console.log('myEvent:', Event.myEvent);

        Event.save();

        $state.go('editEventFriends', {}, {reload: true});
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
        console.log('Selected friend: ', $scope.friends[index]);
        var participant = Participant.store(Event.myEvent, $scope.friends[index].get('Friend'));
        $scope.invitedFriends.push( participant );
        $scope.friends.splice(index, 1);

    }

    $scope.uninviteFriend = function(index) {
        console.log('chegou ao uninvite Friends. Index = ' + index);

        var newFriend = Friend.newFriend($scope.invitedFriends[index].get('User'));

        Participant.delete($scope.invitedFriends[index]);

        $scope.invitedFriends.splice(index, 1);
        $scope.friends.push( newFriend );
    }

    $scope.selectTheme = function(index, theme) {

        Event.selectTheme(theme);

        $scope.object.backgroundColor = Event.myEvent.has('Theme') ? Event.myEvent.get('Theme').get('backgroundColor') : ';';
        $scope.object.iconUrl = Event.myEvent.get('Theme') ? Event.myEvent.get('Theme').get('icon').url() : '';

    }

    $scope.notifyParticipants = function() {
        console.log('Notify Participants');
        Event.resetMyEvent();
        $state.go('tab.events');
    }

}])

.controller('EventShowController',['$scope','Event','$state','$stateParams',function($scope,Event,$state,$stateParams){

	var obj = angular.fromJson($stateParams.object);
    $scope.object = obj;

}]);