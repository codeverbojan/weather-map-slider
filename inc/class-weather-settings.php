<?php
if (!defined('ABSPATH')) exit;

class Weather_Settings {
    const OPTION_GROUP = 'weather_map_plugin_options';
    const OPTION_NAME  = 'weather_map_plugin_settings';
    const PAGE_SLUG    = 'weather_map_plugin_settings';

    public function init() {
        add_action('admin_menu', [$this, 'add_settings_page']);
        add_action('admin_init', [$this, 'register_settings']);
    }

    public function add_settings_page() {
        add_submenu_page(
            'edit.php?post_type=weather_station',
            __('Weather Map Settings', 'weather-map-plugin'),
            __('Settings', 'weather-map-plugin'),
            'manage_options',
            self::PAGE_SLUG,
            [$this, 'render_settings_page']
        );
    }

    public function register_settings() {
        register_setting(self::OPTION_GROUP, self::OPTION_NAME, [
            'sanitize_callback' => [$this, 'sanitize_settings'],
        ]);

        add_settings_section(
            'weather_map_main_section',
            __('API Configuration', 'weather-map-plugin'),
            '__return_false',
            self::PAGE_SLUG
        );

        add_settings_field(
            'openweathermap_api_key',
            __('OpenWeatherMap API Key', 'weather-map-plugin'),
            [$this, 'render_openweather_field'],
            self::PAGE_SLUG,
            'weather_map_main_section'
        );

       
    }

    public function render_openweather_field() {
        $options = get_option(self::OPTION_NAME);
        $value = esc_attr($options['openweathermap_api_key'] ?? '');
        echo '<input type="text" name="' . self::OPTION_NAME . '[openweathermap_api_key]" value="' . $value . '" class="regular-text" />';
        echo '<p class="description">Get your key at <a href="https://openweathermap.org/api" target="_blank">openweathermap.org</a>.</p>';
    }

    

    public function sanitize_settings($input) {
        return [
            'openweathermap_api_key' => sanitize_text_field($input['openweathermap_api_key'] ?? ''),
        ];
    }

    public static function get_openweather_key() {
        $options = get_option(self::OPTION_NAME);
        return $options['openweathermap_api_key'] ?? '';
    }


    public function render_settings_page() {
        ?>
        <div class="wrap">
            <h1><?php _e('Weather Map Settings', 'weather-map-plugin'); ?></h1>
            <form method="post" action="options.php">
                <?php
                settings_fields(self::OPTION_GROUP);
                do_settings_sections(self::PAGE_SLUG);
                submit_button();
                ?>
            </form>
        </div>
        <?php
    }
}
