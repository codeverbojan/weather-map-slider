<?php
if (!defined('ABSPATH')) exit;
class Weather_Plugin {
    public function run() {
        require_once __DIR__ . '/class-weather-cpt.php';
        require_once __DIR__ . '/class-weather-frontend.php';
        require_once __DIR__ . '/class-weather-api.php';
        require_once __DIR__ . '/class-weather-settings.php';
        require_once __DIR__ . '/class-weather-station-acf.php';
        require_once __DIR__ . '/class-weather-cron.php';

        (new Weather_CPT())->init();
        (new Weather_Frontend())->init();
        (new Weather_API())->init();
        (new Weather_Settings())->init();
        (new Weather_Station_ACF())->init();
        (new Weather_Cron())->init();
    }

    public static function on_activate() {
        $existing_page = get_page_by_path('map', OBJECT, 'page');

	    if (!$existing_page) {
	        $page_id = wp_insert_post([
	            'post_title'   => 'Map Page',
	            'post_name'    => 'map',
	            'post_status'  => 'publish',
	            'post_type'    => 'page',
	        ]);
	
	        if (!is_wp_error($page_id)) {
	            update_post_meta($page_id, '_weather_map_page', true);
	        }
	    } else {
	        // Optionally update meta if the page already exists
	        update_post_meta($existing_page->ID, '_weather_map_page', true);
	    }
    }
}