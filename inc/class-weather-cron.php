<?php
if (!defined('ABSPATH')) exit;

class Weather_Cron {
    public function init() {
        add_action('weather_map_fetch_weather', [$this, 'fetch_weather_data_for_all_stations']);

        // Schedule the event if it's not already scheduled
        if (!wp_next_scheduled('weather_map_fetch_weather')) {
            wp_schedule_event(time(), 'daily', 'weather_map_fetch_weather');
        }

        // Cleanup on deactivation
        register_deactivation_hook(__FILE__, function () {
            wp_clear_scheduled_hook('weather_map_fetch_weather');
        });
    }

    public function fetch_weather_data_for_all_stations() {
        $stations = get_posts([
            'post_type' => 'weather_station',
            'posts_per_page' => -1,
            'post_status' => 'publish',
        ]);
		if (empty($stations)) {
		    return; // No stations to process
		}
        foreach ($stations as $station) {
            $lat = get_field('latitude', $station->ID);
            $lng = get_field('longitude', $station->ID);

            if (!$lat || !$lng) continue;

            $weather = $this->fetch_weather_data($lat, $lng);
            if ($weather) {
                update_field('weather_data', json_encode($weather, JSON_PRETTY_PRINT), $station->ID);
            }
        }
    }

    private function fetch_weather_data($lat, $lng) {
        $api_key = Weather_Settings::get_openweather_key();
        $url = "https://api.openweathermap.org/data/2.5/weather?lat={$lat}&lon={$lng}&appid={$api_key}&units=metric";

        $response = wp_remote_get($url);
        if (is_wp_error($response)) return null;

        $data = json_decode(wp_remote_retrieve_body($response), true);
        return $data;
    }
}
