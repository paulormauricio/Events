angular.module('events.filters',[])

.filter('themeSearch', function() {
    

    return function(input, searchString) {

        if( searchString == undefined ) return input;
        if( searchString.length < 3 ) return input;

        var output = [];

        if( !angular.isString(searchString) ) return output;

                
        searchString = searchString.toLowerCase();
        var keywords_aux = searchString.split(' ');
        var keywords = [];

        angular.forEach(keywords_aux, function(keyword) {
                
            if(keyword.length > 2)
                this.push(keyword);

        }, keywords);

        if( keywords.length == 0 ) return output;

        var string1 = '';
        var string2 = '';
        var word = '';
        var locale = Parse.User.current().get('locale').toLowerCase();

        // Using the angular.forEach method, go through the array of data and perform the operation of figuring out if the language is statically or dynamically typed.
        angular.forEach(input, function(object) {
        	for (var i = 0; i<keywords.length; i++) {
        		
        		string1 = object['tags_en_us'];
        		string2 = object['tags_'+locale];
                
        		if(string1.search(keywords[i]) >= 0 || string2.search(keywords[i]) >= 0) {

                    this.push(object);
        			break;
        		}
        	};
        }, output);

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

        if( inputDateTime == undefined || inputDateTime == null ) return '';

        var inputDate = new Date( $filter('date')(inputDateTime, 'yyyy-MM-dd' ) );

        var currentDateTime = new Date();
        var currentDate = new Date( $filter('date')(currentDateTime, 'yyyy-MM-dd' ) );

        var inputTime = $filter('date')(inputDateTime, 'HH:mm' );

        var dateDiff = differenceInDays(currentDate, inputDate);

        if (inputDate == currentDate) {
            return $filter('translate')('date_today')+' '+$filter('translate')('date_at')+' '+inputTime;
        }
        else if (dateDiff == 1) {
            return $filter('translate')('date_tomorrow')+' '+$filter('translate')('date_at')+' '+ inputTime;
        }
        else if (dateDiff < 7) {
            var week = $filter('date')(inputDateTime, 'EEEE').toLowerCase();
            return $filter('translate')( 'date_week_'+week ) + ' '+$filter('translate')('date_at')+' '+inputTime;
        }
        else {
            return $filter('date')(inputDateTime, 'dd-MM-yyyy ')+$filter('translate')('date_at')+$filter('date')(inputDateTime, ' HH:mm' );
        }
        
        return "";
  }

});