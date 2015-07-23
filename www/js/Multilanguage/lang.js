angular.module('events.translations', 
		[
			'pascalprecht.translate',
			'events.lang_en_us',
			'events.lang_pt_pt'
		])

.config(function ($translateProvider, lang_en_us, lang_pt_pt) {
	
	$translateProvider.translations('en_us', lang_en_us);
	$translateProvider.translations('pt_pt', lang_pt_pt);

	$translateProvider.useSanitizeValueStrategy('escape');
	$translateProvider.preferredLanguage('en_us');

});