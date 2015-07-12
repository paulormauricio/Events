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
            'userlocation',
            'ngGPlacesAPI',
            function(
                $scope,
                $state, 
                $stateParams,
                $ionicLoading, 
                Event, 
                Friend,
                Participant,
                Theme,
                userlocation,
                ngGPlacesAPI
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

    var currentLocation = {};

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

    $scope.loadSuggestedPlaces = function() {
        console.log('chegou ao loadPlaces()');
        

        GoogleOptions = {
            //types: ['food'],
            radius: 1000
        };

        userlocation.get().then(function(location) {
            console.log('Location:', location);

            currentLocation = {
                latitude: location.lat,
                longitude: location.lng
            };

            GoogleOptions = {
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude
            };
            
            ngGPlacesAPI.nearbySearch(GoogleOptions).then( function(data) {
                $scope.suggestedPlaces = data;
                console.log('Data: ', data);
            })
            .finally( function() {
                $ionicLoading.hide();
            });

        })
        .catch(function(error) {
            $ionicLoading.hide();
            console.log('Error: ', error);
            alert('Error: ', error);
        })
        .finally( function() {
        });

    }   

    $scope.loadGooglePlaces = function (query) {

        GoogleOptions['name'] = query;

        return ngGPlacesAPI.nearbySearch(GoogleOptions).then( function(data) {

            console.log('Filtered Data: ', data);

            return data;
        })
        .catch(function(error) {
            console.log('Error: ', error);
        })
        .finally( function() {
        });
        
    }

    // Save selected place
    $scope.callbackMethod = function(callback) {
        console.log('Selected place_id: ', callback.item.place_id);

        if( callback.item.place_id != '-1' ) {
            Event.myEvent.set('place_id', callback.item.place_id);
        }
        Event.myEvent.set('place_name', callback.item.name);
        Event.myEvent.set('place_address', callback.item.vicinity);
        if( callback.item.geometry.location ) {
            Event.myEvent.set('place_lat', callback.item.geometry.location.lat());
            Event.myEvent.set('place_lng', callback.item.geometry.location.lng());
        }
        if( callback.item.photos ) 
            Event.myEvent.set('place_image_url', callback.item.photos[0].getUrl({'maxWidth': 600, 'maxHeight': 300}));

        Event.save();
        Event.showEvent = Event.myEvent;
        Event.resetMyEvent;
        $state.go('showEvent', {objectId: Event.showEvent.id});
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
            'Participant',
            '$state',
            '$stateParams',
            '$ionicLoading', 
            '$ionicActionSheet',
            '$timeout',
            function(
                $scope,
                Event,
                Participant,
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
    
    if( !Event.showEvent.id ) {
        Event.get($stateParams.objectId).then(function(object) {
            Event.showEvent = object;
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
        $scope.object = Event.showEvent;
        console.log('Show event: ', $scope.object);
        $scope.object.backgroundColor = Event.showEvent.has('Theme') ? Event.showEvent.get('Theme').get('backgroundColor') : ';';
        $scope.object.iconUrl = Event.showEvent.has('Theme') ? Event.showEvent.get('Theme').get('icon').url() : '';

        if( Event.showEvent.has('place_id') ) {
            initializeGoogleMaps(Event.showEvent.get('place_lat'), Event.showEvent.get('place_lng'));
        }
        $scope.participants = {};
        Participant.getAll(Event.showEvent, true).then(function(result) {
            $scope.participants = result;
            console.log('Participantes: ', result);
        });
    }

    function initializeGoogleMaps(lat, lng) {
        console.log('Initialize GoogleMaps: ', {lat: lat, lng: lng});
        var myLatlng = new google.maps.LatLng(lat,lng);

        // Create an array of styles.
        var styles = [
            {
                // stylers: [
                //     { hue: "#00ffe6" },
                //     { saturation: -20 }
                // ]
            },{
                featureType: "road",
                stylers: [
                    { lightness: 100 },
                    { visibility: "simplified" }
                ]
            },{
                featureType: "road",
                elementType: "labels",
                stylers: [
                    { visibility: "off" }
                ]
            }
        ];

        // Create a new StyledMapType object, passing it the array of styles,
        // as well as the name to be displayed on the map type control.
        var styledMap = new google.maps.StyledMapType(styles, {name: "Styled Map"});

        // Create a map object, and include the MapTypeId to add
        // to the map type control.
        var mapOptions = {
            center: myLatlng,
            zoom: 14,
            streetViewControl: false,
            mapTypeControlOptions: {
                mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style']
            }
        };
        var map = new google.maps.Map(document.getElementById("map"), mapOptions);

        //Associate the styled map with the MapTypeId and set it to display.
        map.mapTypes.set('map_style', styledMap);
        map.setMapTypeId('map_style');
        
        var marker = new google.maps.Marker({
            position: myLatlng,
            map: map,
            animation: google.maps.Animation.DROP,
            title: 'Hello World!'
        });
    }

    $scope.editDate = function() {
        console.log('Chegou ao EditDate');
        $scope.showAngularDateEditor = true;

        console.log(Event.showEvent);
        var date = Event.showEvent.get('date');

        if( ionic.Platform.isIOS() ||
            ionic.Platform.isAndroid() ||
            ionic.Platform.isWindowsPhone()
            ) {

            var options = {
                date: new Date(),
                mode: 'datetime',
                minuteInterval: 5,
                allowOldDates: false,
                doneButtonColor: '#0000FF',
                cancelButtonColor: '#000000',
                clearButton: true,
                clearButtonColor: "#ddd",
                clearButtonLabel: "Clear date"
            };

            datePicker.show(options, function(newDate){
                alert("date result " + newDate);  
                saveDate(newDate);
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
                    switch(index) {
                        case 0: 
                            date = addMinutes(Date(), 15);
                            break;
                        case 1: 
                            date = addMinutes(Date(), 30);
                            break;
                        case 2: 
                            date = addMinutes(Date(), 60);
                            break;
                        case 3: 
                            date = addMinutes(Date(), 120);
                            break;
                        default: return addMinutes(Date(), 0);
                    }
                    hideSheet();
                    saveDate(date);
                    return true;
                },
                destructiveButtonClicked: function() {
                    console.log('chegou ao delete');
                    hideSheet();
                    saveDate('');
                }
            });

            // For example's sake, hide the sheet after two seconds
            $timeout(function() {
                hideSheet();
            }, 8000);

        }

    }

    function addMinutes(newdate, minutes) {
        var date = new Date(newdate);
        console.log('Date:', date);
        return new Date(date.getTime() + minutes*60000);
    }

    function saveDate(newdate) {
        if( newdate == '' ) {
            $scope.object.unset('date');
            Event.showEvent.unset('date');
        }
        else {
            var date = new Date(newdate);
            alert('Save date: '+date);
            $scope.object.set('date', date);
            Event.showEvent.set('date', date);
        }
        Event.myEvent = Event.showEvent;
        Event.save();
        Event.resetMyEvent();
    }

    $scope.placePressed = function() {
        
        console.log('chegou ao placePressed');

        var buttons = [
                { text: 'Edit Place' }
            ];
        if( Event.showEvent.has('place_id') )
            buttons.push({text: 'Go to google maps'});

        // Show the action sheet
        var hideSheet = $ionicActionSheet.show({
            buttons: buttons,
            destructiveText: 'Clear event place',
            // titleText: 'Modify your album',
            cancelText: 'Cancel',
            cancel: function() {
                // add cancel code..
            },
            buttonClicked: function(index) {
                console.log('Button clicked. Index = ', index);
                switch(index) {
                    case 0: 
                        Event.myEvent = Event.showEvent;
                        $state.go('editEventPlace');
                        break;
                    case 1:
                        console.log('Go to google maps');
                        break;
                    default: return false;
                }
                hideSheet();
                return true;
            },
            destructiveButtonClicked: function() {
                console.log('chegou ao delete place');
                hideSheet();
                // Delete place

                Event.myEvent = Event.showEvent;
                Event.deletePlace();
                Event.showEvent = Event.myEvent;
                Event.resetMyEvent;
                $scope.object = Event.showEvent;
            }
        });

        // For example's sake, hide the sheet after two seconds
        $timeout(function() {
            hideSheet();
        }, 28000);
    }

}]);