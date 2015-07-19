angular.module('events.EventControllers',[])

.controller('EventsListController',['$window', '$state', '$scope', '$ionicLoading', 'Event', function( $window, $state, $scope,$ionicLoading, Event){
    

    $scope.loadingIndicator = $ionicLoading.show({
        content: 'Loading events',
        animation: 'fade-in',
        showBackdrop: false,
        maxWidth: 200,
        showDelay: 500
    });
    calculateColectionItemSize();

    Event.getMyEvents().then(function(objects) {
        $scope.myEvents = objects;
        console.log('My Events: ', objects);
        $ionicLoading.hide();
    });

    Event.getNew().then(function(objects) {
        $scope.newEvents = objects;
        console.log('New Events: ', objects);
    });

    $scope.doRefresh = function() {
        Event.getNew().then(function(objects) {
            $scope.newEvents = objects;
            $scope.$broadcast('scroll.refreshComplete');
        });
    }

    $scope.showEvent = function(myEvent) {
        Event.showEvent = myEvent;
        $state.transitionTo('showEvent', {objectId: myEvent.id});
    }

    angular.element(window).bind('resize', function () {
        calculateColectionItemSize();
    });

    function calculateColectionItemSize() {
        var width =  $window.innerWidth;
        $scope.item = {width: 0, height: 0};
        if( width > 700 ) {
            $scope.item.width = 120 + 'px';
        }
        else if( width > 550 ) {
            $scope.item.width = (width / 4 - 3) + 'px';
        }
        else if( width > 400 ) {
            $scope.item.width = (width / 3 - 3) + 'px';
        }
        else {
            $scope.item.width = (width / 2 - 3) + 'px';
        }
        $scope.item.height = $scope.item.width;
    }
}])

.controller('EventEditController',
        [
            '$scope', 
            '$window',
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
                $window,
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

    $scope.isNew = $stateParams.objectId ? false : true;

    $scope.loadingIndicator = $ionicLoading.show({
        content: 'Loading Data',
        animation: 'fade-in',
        showBackdrop: false,
        maxWidth: 200,
        showDelay: 500
    });

    if( $scope.isNew ) {
        $scope.editEvent = {};
    }
    else {

        if(!Event.myEvent) {
            Event.myEvent = {id: $stateParams.objectId};
        }
        $scope.editEvent = Event.myEvent;
        console.log('chegou');
    }
    console.log('isNew: ', $scope.isNew);
    console.log( 'Edit Event:', $scope.editEvent );


    var currentLocation = {};

//  Edit Event Name
    $scope.loadThemes = function() {

        Theme.getAll().then(function(themes){
            $scope.themes = themes;
            console.log('Themes: ', themes);
        });

        calculateColectionItemSize();
        angular.element(window).bind('resize', function () {
            calculateColectionItemSize();
        });

        $ionicLoading.hide();
    }

    $scope.storeName = function(theme) {

        $scope.loadingIndicator = $ionicLoading.show({
            content: 'Loading Data',
            animation: 'fade-in',
            showBackdrop: false,
            maxWidth: 200,
            showDelay: 500
        });

        Event.myEvent.name = $scope.editEvent.name;
        Event.myEvent.theme = theme.name;

        Event.save($scope.isNew).then(function(newEvent) {
            Event.myEvent = newEvent;
            if($scope.isNew) {
                Participant.store(Event.myEvent, Parse.User.current(), true);
            }
            $ionicLoading.hide();
            $state.go('editEventFriends', {objectId: newEvent.id}, {reload: true});
        });

    }

//  Edit Event Participants

    $scope.loadFriends = function() {
        console.log('chegou ao loadFriends');

        $scope.friends = [];
        $scope.invitedFriends = [];
        
        Friend.getAll().then(function(friends) {

            $scope.friends = friends;

            Participant.getAll($scope.editEvent, false).then(function(invitedFriends){
                $scope.invitedFriends = invitedFriends;

                //Remove participants from friends
                for (var i = 0; i < invitedFriends.length; i++) {
                    for (var j = 0; j < $scope.friends.length; j++) {

                        if(invitedFriends[i].id == $scope.friends[j].id ) {
                            $scope.friends.splice(j, 1);
                            break;
                        }
                    }
                }
            })
            .catch(function(fallback) {
                console.log('Error: ', fallback + '!!');
            });
            
        })
        .catch(function(fallback) {
            console.log('Error: ', fallback + '!!');
        })
        .finally( function() {
            $ionicLoading.hide();
        });
    }

    $scope.inviteFriend = function(index, friend) {
        console.log('chegou ao invite Friends. Index = ' + index + ': ', friend.first_name);

        friend.isNew = 1;
        $scope.friends.splice(index, 1);
        $scope.invitedFriends.unshift( friend );
    }

    $scope.uninviteFriend = function(index, friend) {
        console.log('chegou ao uninvite Friends. Index = ' + index + ': ', $scope.invitedFriends[index].first_name);

        friend.isNew = 0;
        $scope.friends.unshift( friend );
        $scope.invitedFriends.splice(index, 1);
    }

    $scope.notifyParticipants = function() {
        console.log('Notify Participants');
        Event.showEvent = Event.myEvent;
        Event.resetMyEvent();
        $state.go('showEvent', {objectId: Event.showEvent.id});
    }


//  Edit Event Place
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


//  Other functions
    function calculateColectionItemSize() {
        var width =  $window.innerWidth;
        $scope.item = {width: 0, height: 0};
        if( width > 700 ) {
            $scope.item.width = 120 + 'px';
        }
        else if( width > 550 ) {
            $scope.item.width = (width / 4 - 3) + 'px';
        }
        else if( width > 400 ) {
            $scope.item.width = (width / 3 - 3) + 'px';
        }
        else {
            $scope.item.width = (width / 2 - 3) + 'px';
        }
        $scope.item.height = $scope.item.width;
        console.log('height: ', $scope.item.height);
        console.log('width: ', $scope.item.width);
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
        })
        .catch(function(fallback) {
            console.log('Error: ', fallback + '!!');
        })
        .finally( function() {
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