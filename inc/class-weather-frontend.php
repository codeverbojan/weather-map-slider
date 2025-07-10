<?php
if (!defined('ABSPATH')) exit;

class Weather_Frontend {
    public function init() {
	   
        add_filter('template_include', [$this, 'override_map_template']);
        add_action('wp_enqueue_scripts', [$this, 'enqueue_assets']);
        add_action('wp_ajax_load_weather_stations', [$this, 'ajax_load_weather_stations']);
        add_action('wp_ajax_nopriv_load_weather_stations', [$this, 'ajax_load_weather_stations']);
    }

    public function override_map_template($template) {
	    
        if (is_page('map')) {
            return plugin_dir_path(__DIR__) . 'templates/map-template.php';
        }
        
        return $template;
    }

    public function enqueue_assets() {
        if (!is_page('map')) return;
		
		
		
        // Leaflet core
        wp_enqueue_style('leaflet', 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
        wp_enqueue_script('leaflet', 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js', [], null, true);

        // Custom styles and scripts
        wp_enqueue_style('weather-map-style', plugin_dir_url(__DIR__) . 'dist/css/app.css');
        wp_enqueue_style(
	        'weather-map-roboto-font',
	        'https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap',
	        ['weather-map-style'],
	        null
	    );
        wp_enqueue_script('weather-map-script', plugin_dir_url(__DIR__) . 'dist/js/app.js', ['leaflet'], null, true);

        // Localize AJAX data
        wp_localize_script('weather-map-script', 'weatherMap', [
	        'ajaxUrl' => admin_url('admin-ajax.php'),
	        'apiKey'  => Weather_Settings::get_openweather_key(), // Add this line
	    ]);
    }

    public function ajax_load_weather_stations() {
	    $stations = get_posts([
	        'post_type' => 'weather_station',
	        'posts_per_page' => -1,
	        'post_status' => 'publish',
	    ]);
	
	    $data = [];
	
	    foreach ($stations as $post) {
	        $coords = get_field('coordinates', $post->ID);
	        $weather = get_field('weather_data', $post->ID);
	
	        if (!$coords || !$coords['latitude'] || !$coords['longitude']) continue;
	
	        $data[] = [
	            'id'      => $post->ID, 
	            'title'   => get_the_title($post),
	            'lat'     => $coords['latitude'],
	            'lng'     => $coords['longitude'],
	            'weather' => $weather,
	        ];
	    }
	
	    wp_send_json_success($data);
	}
}
