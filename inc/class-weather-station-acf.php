<?php
if (!defined('ABSPATH')) exit;

class Weather_Station_ACF {
    public function init() {
        add_action('acf/init', [$this, 'register_fields']);
        add_action('acf/input/admin_enqueue_scripts', [$this, 'enqueue_admin_scripts']);
        add_action('wp_ajax_fetch_weather_data', [$this, 'ajax_fetch_weather_data']);
        add_action('acf/save_post', [$this, 'maybe_fetch_weather_on_acf_save'], 20);
    }

    public function register_fields() {
        if (!function_exists('acf_add_local_field_group')) return;

        acf_add_local_field_group([
	        'key' => 'group_weather_station',
	        'title' => 'Weather Station Details',
	        'fields' => [
	            [
	                'key' => 'field_location_group',
	                'label' => 'Coordinates',
	                'name' => 'coordinates',
	                'type' => 'group',
	                'layout' => 'table', // side-by-side layout
	                'sub_fields' => [
	                    [
	                        'key' => 'field_latitude',
	                        'label' => 'Latitude',
	                        'name' => 'latitude',
	                        'type' => 'text',
	                        'required' => 1,
	                        'readonly' => 1,
	                    ],
	                    [
	                        'key' => 'field_longitude',
	                        'label' => 'Longitude',
	                        'name' => 'longitude',
	                        'type' => 'text',
	                        'required' => 1,
	                        'readonly' => 1,
	                    ],
	                ],
	            ],
	            [
	                'key' => 'field_weather_data',
	                'label' => 'Weather Data',
	                'name' => 'weather_data',
	                'type' => 'textarea',
	                'readonly' => 1,
	            ],
	            [
                    'key' => 'field_location_search',
                    'label' => 'Select Location',
                    'name' => '',
                    'type' => 'message',
                    'message' => '<div id="weather-location-search"></div>',
                ],
	        ],
	        'location' => [
	            [
	                [
	                    'param' => 'post_type',
	                    'operator' => '==',
	                    'value' => 'weather_station',
	                ],
	            ],
	        ],
	    ]);
    }

    public function enqueue_admin_scripts() {
        global $post_type;
        if ($post_type !== 'weather_station') return;
		// Leaflet Control Geocoder
		wp_enqueue_script(
		    'leaflet-geocoder',
		    'https://unpkg.com/leaflet-control-geocoder/dist/Control.Geocoder.js',
		    ['leaflet'],
		    null,
		    true
		);
		wp_enqueue_style(
		    'leaflet-geocoder-css',
		    'https://unpkg.com/leaflet-control-geocoder/dist/Control.Geocoder.css'
		);
        wp_enqueue_script('leaflet', 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js');
        wp_enqueue_style('leaflet-css', 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
		
        wp_enqueue_script('weather-location-script', plugin_dir_url(__DIR__) . 'assets/js/weather-location.js', ['jquery'], null, true);
        wp_localize_script('weather-location-script', 'WeatherMapData', [
            'openweatherKey' => Weather_Settings::get_openweather_key(),
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('fetch_weather_data'),
        ]);
    }
	private function fetch_weather_data($lat, $lon) {
		
		
		if ($lat === '' || $lon === '') return;
		
	    $apiKey = Weather_Settings::get_openweather_key();
	    if (!$apiKey) return null;
		
	    $url = "https://api.openweathermap.org/data/2.5/weather?lat={$lat}&lon={$lon}&appid={$apiKey}&units=metric";
	    
	
	    $response = wp_remote_get($url);
	    
	    if (is_wp_error($response)) return null;
	
	    $body = json_decode(wp_remote_retrieve_body($response), true);
	    return $body;
	}
    public function maybe_fetch_weather_on_acf_save($post_id) {
	    // Avoid ACF's own internal saves
	    if (is_numeric($post_id) && get_post_type($post_id) !== 'weather_station') return;
	
	    $coordinates = get_field('coordinates', $post_id);
	    if (!$coordinates) return;
	
	    $lat = trim($coordinates['latitude'] ?? '');
	    $lng = trim($coordinates['longitude'] ?? '');	
	
	    if ($lat === '' || $lng === '') return;
	
	    $weather = $this->fetch_weather_data($lat, $lng);
	    if ($weather) {
	        update_field('weather_data', json_encode($weather, JSON_PRETTY_PRINT), $post_id);
	    }
	}

}
