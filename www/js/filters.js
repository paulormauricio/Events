angular.module('events.filters',[])

.filter('parseSearch', function() {
    

    return function(input, searchString, searchfield1, searchfield2) {

        if( !angular.isString(searchString) ) return input;

        var output = [];

        var keywords_aux = searchString.split(' ');
        var keywords = [];

        for (var i = 0; i<keywords_aux.length; i++) {
            if(keywords_aux[i].length > 2) {
                keywords.push( keywords_aux[i] );
            }
        }

        if( keywords.length == 0 ) return input;

        var string1 = '';
        var string2 = '';
        var word = '';

        // Using the angular.forEach method, go through the array of data and perform the operation of figuring out if the language is statically or dynamically typed.
        angular.forEach(input, function(object) {
        	for (var i = 0; i<keywords.length; i++) {
        		
        		string1 = object.get(searchfield1).toLowerCase();
        		string2 = object.get(searchfield2).toLowerCase();
        		word = keywords[i].toLowerCase();

        		if(string1.search(word) >= 0 || string2.search(word) >= 0) {
        			output.push(object);
        			break;
        		}
        	};
        });

        return output;
    }

})

.filter('prettyDateFormat', function($filter) {
    

    function differenceInDays (date1, date2) {
        
        var millisecondsPerDay = 1000 * 60 * 60 * 24;
        var millisBetween = date2.getTime() - date1.getTime();
        var days = millisBetween / millisecondsPerDay;
    
        return Math.floor(days); 
    }

    return function(inputDateTime) { 

        var inputDate = new Date( $filter('date')(inputDateTime, 'yyyy-MM-dd' ) );

        var currentDateTime = new Date();
        var currentDate = new Date( $filter('date')(currentDateTime, 'yyyy-MM-dd' ) );


        var inputTime = $filter('date')(inputDateTime, 'HH:mm' );

        var dateDiff = differenceInDays(inputDate, currentDate);

        if (inputDate == currentDate) {
            return "Today at " + inputTime;
        }
        else if (dateDiff == 1) {
            return "Tomorrow at " + inputTime;
        }
        else if (dateDiff < 7) {
            return 'Next ' + $filter('date')(inputDateTime, 'EEEE') + ' at ' + inputTime;
        }
        else {
            return $filter('date')(inputDateTime, 'dd-MM-yyyy at HH:mm' );
        }
        
        return "";
  }

});