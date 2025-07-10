<?php
/*
Plugin Name: Weather Map Plugin
Description: Weather stations on OpenStreetMap with OpenWeatherMap data.
Version: 0.0.1
Author: Bojan Josifoski
*/
if (!defined('ABSPATH')) exit;

// Show admin notice if ACF is missing
add_action('admin_notices', function () {
    if (class_exists('ACF')) return;

    $acf_plugin_slug = 'advanced-custom-fields/acf.php';
    $is_installed = file_exists(WP_PLUGIN_DIR . '/' . $acf_plugin_slug);

    $install_url = wp_nonce_url(
        self_admin_url('update.php?action=install-plugin&plugin=advanced-custom-fields'),
        'install-plugin_advanced-custom-fields'
    );

    $activate_url = wp_nonce_url(
        self_admin_url('plugins.php?action=activate&plugin=' . $acf_plugin_slug),
        'activate-plugin_' . $acf_plugin_slug
    );

    echo '<div class="notice notice-error"><p>';
    echo '<strong>Weather Map Plugin</strong> requires <strong>Advanced Custom Fields</strong> to be installed and active.';
    echo '</p><p>';

    if (!is_plugin_active($acf_plugin_slug) && $is_installed) {
        echo '<a href="' . esc_url($activate_url) . '" class="button button-primary">Activate ACF</a>';
    } elseif (!$is_installed) {
        echo '<a href="' . esc_url($install_url) . '" class="button button-primary">Install ACF</a>';
    }

    echo '</p></div>';
});

// Block plugin functionality if ACF is missing
if (!class_exists('ACF')) {
    return; // Stop here, plugin is technically active but does nothing
}

// Continue plugin if ACF is present
require_once plugin_dir_path(__FILE__) . 'inc/class-weather-plugin.php';

// Plugin activation logic (e.g. create "map" page)
register_activation_hook(__FILE__, ['Weather_Plugin', 'on_activate']);

function run_weather_plugin() {
    $plugin = new Weather_Plugin();
    $plugin->run();
}
run_weather_plugin();