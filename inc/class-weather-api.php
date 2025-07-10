<?php
if (!defined('ABSPATH')) exit;

class Weather_API {
    public function init() {
        add_action('wp_ajax_get_weather', [$this, 'get_weather']);
        add_action('wp_ajax_nopriv_get_weather', [$this, 'get_weather']);
    }

    public function get_weather() {
        $post_id = isset($_POST['station_id']) ? intval($_POST['station_id']) : 0;
        if (!$post_id) {
            wp_send_json_error('Missing station ID');
        }

        $data = get_field('weather_data', $post_id);
        if (!$data) {
            wp_send_json_error('No cached weather data found');
        }

        $decoded = json_decode($data, true);
        if (!is_array($decoded)) {
            wp_send_json_error('Invalid weather data format');
        }

        wp_send_json_success($decoded);
    }
}
