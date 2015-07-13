angular.module('events.translations', 
		[
			'pascalprecht.translate',
			'events.lang_en',
			'events.lang_pt'
		])

.config(function ($translateProvider, lang_en, lang_pt) {
	
	$translateProvider.translations('en', lang_en);
	$translateProvider.translations('pt', lang_pt);

	$translateProvider.useSanitizeValueStrategy('sanitize');
	$translateProvider.preferredLanguage('pt');

});