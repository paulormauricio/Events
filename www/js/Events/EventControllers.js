angular.module('events.EventControllers',[])

.controller('EventsListController',
    [
        '$window', 
        '$state', 
        '$scope', 
        '$ionicLoading', 
        'Event', 
        'Participant', 
        function( 
            $window, 
            $state, 
            $scope,
            $ionicLoading,
            Event,
            Participant
        )
    {

console.log('');
console.log('<<<<<<-----------   Events Screen  ---------->>>>>');

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
        $state.transitionTo('showEvent', {objectId: myEvent.id}, {reload: true});
    }

    $scope.joinNewEvent = function(newEvent, index) {
        Participant.updateByEvent(newEvent, Parse.User.current(), true);
        $scope.myEvents.push(newEvent);
        $scope.newEvents.splice(index, 1);
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
console.log('');
console.log('<<<<<<-----------   Edit Screen  ---------->>>>>');
if(ionic.Platform.isWebView()) alert('<<--- Edit Screen --->>>');
    $scope.isNew = $stateParams.isNew ? true : false;

    $scope.loadingIndicator = $ionicLoading.show({
        content: 'Loading Data',
        animation: 'fade-in',
        showBackdrop: false,
        maxWidth: 200,
        showDelay: 500
    });

    if( $stateParams.objectId == '' ) {
        $scope.editEvent = {};
        Event.myEvent = {};
    }
    else {
        if(!Event.myEvent) {
            Event.myEvent = {id: $stateParams.objectId};
        }
        $scope.editEvent = Event.myEvent;
    }
console.log('Event.myEvent: ', Event.myEvent);
    var currentLocation = {};

    $scope.backFromName = function() {
        if( $scope.isNew ) {
            $state.go('events');
        }
        else {
            $state.go('showEvent', {objectId: $scope.editEvent.id});
        }
    }
    $scope.backFromParticipants = function() {
        if( $scope.isNew ) {
            $state.go('editEventName', {isNew: true, objectId: $scope.editEvent.id});
        }
        else {
            $state.go('showEvent', {objectId: $scope.editEvent.id});
        }
    }

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

        if( $scope.isNew ) {
            Event.myEvent.id = $scope.editEvent.id;
        }
        Event.myEvent.name = $scope.editEvent.name;
        
        Event.myEvent.theme = theme.name;

        Event.save($scope.isNew).then(function(savedEvent) {
            Event.myEvent.id = savedEvent.id;
            if($scope.isNew) {
                Participant.store(Event.myEvent, Parse.User.current(), true);
            }
            $ionicLoading.hide();
            if( !$scope.isNew ) {
                $state.go('showEvent', {objectId: savedEvent.id});
            }
            else {
                $state.go('editEventFriends', {objectId: savedEvent.id}, {reload: true});
            }
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
        friend.isNew = 1;
        $scope.friends.splice(index, 1);
        $scope.invitedFriends.unshift( friend );
    }

    $scope.uninviteFriend = function(index, friend) {
        friend.isNew = 0;
        $scope.friends.unshift( friend );
        $scope.invitedFriends.splice(index, 1);
    }

    $scope.notifyParticipants = function() {
        console.log('Notify Participants');

        for (var i=0; i<$scope.invitedFriends.length; i++) {
            if($scope.invitedFriends[i].isNew == 1) {
                Participant.store(Event.myEvent, $scope.invitedFriends[i], false);
            }
            else {
                break;
            }
        };
        for (var i=0; i<$scope.friends.length; i++) {
            if($scope.friends[i].isNew == 0) {
                Participant.delete(Event.myEvent, $scope.friends[i], false);
            }
            else {
                break;
            }
        };

        Event.showEvent = Event.myEvent;
        Event.showEvent.participants = [];
        for (var i=0; i<$scope.invitedFriends.length; i++) {
            if($scope.invitedFriends[i].isGoing)
                Event.showEvent.participants.push($scope.invitedFriends[i]);
        };
        //Event.showEvent.participants = $scope.invitedFriends;
        Event.resetMyEvent();
        console.log('ShowEvent before show:', Event.showEvent);
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
        console.log('Selected place: ', callback.item);

        if( callback.item.place_id != '-1' ) {
            Event.myEvent.place_id = callback.item.place_id;
        }
        Event.myEvent.place_name = callback.item.name;
        Event.myEvent.place_address = callback.item.vicinity;
        if( callback.item.geometry.location ) {
            Event.myEvent.place_lat = callback.item.geometry.location.lat();
            Event.myEvent.place_lng = callback.item.geometry.location.lng();
        }
        if( callback.item.photos ) 
            Event.myEvent.place_image_url = callback.item.photos[0].getUrl({'maxWidth': 600, 'maxHeight': 600});

        Event.save();
        console.log('Event.myEvent: ', Event.myEvent);
        Event.showEvent = Event.myEvent;
        Event.resetMyEvent;
        console.log('Event.myEvent: ', Event.showEvent);
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
            '$sce',
            '$window',
            'Event',
            'Participant',
            '$state',
            '$stateParams',
            '$ionicLoading', 
            '$ionicActionSheet',
            '$timeout',
            'userlocation',
            'Weather',
            function(
                $scope,
                $sce,
                $window,
                Event,
                Participant,
                $state,
                $stateParams, 
                $ionicLoading,
                $ionicActionSheet,
                $timeout,
                userlocation,
                Weather
            )
    {
console.log('');
console.log('<<<<<<-----------   Show Screen  ---------->>>>>');

    $scope.loadingIndicator = $ionicLoading.show({
        content: 'Loading Data',
        animation: 'fade-in',
        showBackdrop: false,
        maxWidth: 200,
        showDelay: 500
    });

    if( !Event.showEvent.id ) {
        Event.get($stateParams.objectId).then(function(object) {
            if(object == undefined ) {
                $state.go('events');
            }
            else {
                Event.showEvent = object;
                loadEventDetail();
            }
        })
        .catch(function(fallback) {
            alert('Get Event Error: '+fallback);
        })
        .finally( function() {
            $ionicLoading.hide();
        });
    }
    else {
        loadEventDetail();
        $ionicLoading.hide();
    }

    var currentLocation = {};
    $scope.isEdit = false;
    $scope.isShowAddress = false;
    $scope.isShowJoinButton = false;
    $scope.isShowEditButton = false;

    $scope.doRefresh = function() {
        Event.get($stateParams.objectId).then(function(object) {
            Event.showEvent = object;
            loadEventDetail();
            $scope.$broadcast('scroll.refreshComplete');
        });
    }

    function loadEventDetail() {
        //$scope.class_pane = 'cover';
        
        $scope.showEvent = Event.showEvent;
        console.log('Show event: ', $scope.showEvent);

        if( Event.showEvent.place_id ) {
            initializeGoogleMaps($scope.showEvent.place_lat, $scope.showEvent.place_lng);
        }

        $scope.showEvent.participants = {};
        Participant.getAll(Event.showEvent, true).then(function(result) {
            $scope.showEvent.participants = result;
            console.log('Participantes: ', $scope.showEvent.participants);

            var count = 0;
            for (var i = 0; i<$scope.showEvent.participants.length; i++) {
                if( $scope.showEvent.participants[i].id == Parse.User.current().id )
                    count++;
            };
            if(count==0) 
                $scope.isShowJoinButton = true;
            else
                $scope.isShowEditButton = true;

        })
        .catch(function(error) {
            alert('Get participants Error: '+error);
        });

        $scope.weather = {};
        getLocationWeather();

        
    }

    function getLocationWeather() {
    
        if( $scope.showEvent.date ) {
            if( $scope.showEvent.place_lat && $scope.showEvent.place_lng ) {
                getWeather({lat: $scope.showEvent.place_lat, lng: $scope.showEvent.place_lng});
            }
            else {
                getUserLocation();
            }
        }
    }

    function getUserLocation() {
    if(ionic.Platform.isWebView()) alert('Entrou no getUserLocation');
        
        userlocation.get().then(function(location) {
            currentLocation = location;
            getWeather(location);
        })
        .catch(function(error) {
            alert('Userlocation Error: '+error);
        });
    }

    function getWeather(location) {
        console.log('<<<--- Get weather --->>>');
        console.log('location: ', location);
        
        Weather.get($scope.showEvent.date, location).then( function(data) {
            $scope.weather = data;
        })
        .catch(function(error) {
            alert('Weather Error: ', error);
        });
    }

    $scope.startEdit = function() {
        $scope.isEdit = true;
    }
    $scope.endEdit = function() {
        $scope.isEdit = false;
    }

    $scope.joinEvent = function() {
        Participant.updateByEvent($scope.showEvent, Parse.User.current(), true);
        $scope.isShowJoinButton = false;
        $scope.isShowEditButton = true;

        var newParticipant = {
            id: Parse.User.current().id,
            facebookId: Parse.User.current().get('facebookId'),
            first_name: Parse.User.current().get('first_name'),
            last_name: Parse.User.current().get('last_name'),
            isGoing: true,
            isHidden: false
        };
        $scope.showEvent.participants.unshift(newParticipant);

        console.log('-------------------------');
        console.log('WARNING: Não esquecer de colocar o evento nos MyEvents after Join');
        console.log('-------------------------');
    }

//  Place Section  ------------------------

    $scope.toggleAddress = function() {
        $scope.isShowAddress = $scope.isShowAddress ? false : true;
    }

    function initializeGoogleMaps(lat, lng) {

        if(!window.google) {
            alert('Google Maps library not loaded!');
            return;
        }

        if(ionic.Platform.isWebView())  alert('Initialize GoogleMaps (lat, lng) = ('+lat+', '+lng+')');

try {
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
            title: 'Place!'
        });
}
catch(err) {
    alert( 'Maps Error: '+err.message);
}

    }

//  Edit Place  -------------------
    $scope.editPlacePressed = function() {

        if( $scope.showEvent.place_name != undefined && !$scope.isEdit) return;

        var buttons = [
                { text: $scope.showEvent.place_name ? 'Edit place' : 'Select place' }
            ];

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
                        Event.myEvent = $scope.showEvent;
                        $state.go('editEventPlace', {objectId: $scope.showEvent.id});
                        break;
                    default: break;
                }
                hideSheet();
                return ;
            },
            destructiveButtonClicked: function() {
                console.log('chegou ao delete place');
                hideSheet();
                // Delete place

                Event.myEvent = $scope.showEvent;
                Event.deletePlace();
                $scope.showEvent = Event.myEvent;
                Event.resetMyEvent;
            }
        });

        // For example's sake, hide the sheet after two seconds
        $timeout(function() {
            hideSheet();
        }, 28000);
    }
//  Edit Name Section --------------------------

    $scope.editName = function() {
        if( $scope.isEdit ) {
            Event.myEvent = $scope.showEvent;
            $state.go('editEventName', {objectId: $scope.showEvent.id});
        }
    }

//  Edit Participants Section -------------------

    $scope.editParticipants = function() {
        if( $scope.isEdit ) {
            Event.myEvent = $scope.showEvent;
            $state.go('editEventFriends', {objectId: $scope.showEvent.id});
        }
    }

//  Data Section --------------------------------
    $scope.editDate = function() {

        if( !$scope.isEdit && $scope.showEvent.date ) return;

        $scope.showAngularDateEditor = true;

        console.log(Event.showEvent);

        if( ionic.Platform.isIOS() ||
            ionic.Platform.isAndroid() ||
            ionic.Platform.isWindowsPhone()
            ) {

            var date = new Date();
            if( $scope.showEvent.date ) date = $scope.showEvent.date;


            var options = {
                date: date,
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
                switch (newDate) {
                    case 'clear':
                        newDate = '';
                        break;
                    case 'cancel':
                        return;
                    default:
                        alert("date result: " + newDate);
                        break;
                }
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
            $scope.showEvent.date = undefined;
            Event.showEvent.date = undefined;
        }
        else {
            var date = new Date(newdate);
            $scope.showEvent.date = date;
            Event.showEvent.date = date;
        }
        Event.myEvent = Event.showEvent;
        Event.save();
        Event.resetMyEvent();
        getLocationWeather();
    }

    //  Other functions
    calculateScreenSize();

    angular.element(window).bind('resize', function () {
        calculateScreenSize();
    });

    function calculateScreenSize() {
        $scope.item = {
                height: $window.innerHeight + 'px',
                width:  $window.innerWidth + 'px'
            };
    }

}]);