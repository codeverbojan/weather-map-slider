<?php
if (!defined('ABSPATH')) exit;
class Weather_CPT {
    public function init() {
        add_action('init', [$this, 'register_cpt']);
    }

    public function register_cpt() {
        register_post_type('weather_station', [
		    'labels' => [
		        'name'                  => _x('Weather Stations', 'Post type general name', 'weather-map-plugin'),
		        'singular_name'         => _x('Weather Station', 'Post type singular name', 'weather-map-plugin'),
		        'menu_name'             => _x('Weather Stations', 'Admin Menu text', 'weather-map-plugin'),
		        'name_admin_bar'        => _x('Weather Station', 'Add New on Toolbar', 'weather-map-plugin'),
		        'add_new'               => __('Add New', 'weather-map-plugin'),
		        'add_new_item'          => __('Add New Weather Station', 'weather-map-plugin'),
		        'new_item'              => __('New Weather Station', 'weather-map-plugin'),
		        'edit_item'             => __('Edit Weather Station', 'weather-map-plugin'),
		        'view_item'             => __('View Weather Station', 'weather-map-plugin'),
		        'all_items'             => __('All Weather Stations', 'weather-map-plugin'),
		        'search_items'          => __('Search Weather Stations', 'weather-map-plugin'),
		        'parent_item_colon'     => __('Parent Weather Stations:', 'weather-map-plugin'),
		        'not_found'             => __('No weather stations found.', 'weather-map-plugin'),
		        'not_found_in_trash'    => __('No weather stations found in Trash.', 'weather-map-plugin'),
		        'archives'              => __('Weather Station Archives', 'weather-map-plugin'),
		        'insert_into_item'      => __('Insert into weather station', 'weather-map-plugin'),
		        'uploaded_to_this_item' => __('Uploaded to this weather station', 'weather-map-plugin'),
		        'filter_items_list'     => __('Filter weather stations list', 'weather-map-plugin'),
		        'items_list_navigation' => __('Weather stations list navigation', 'weather-map-plugin'),
		        'items_list'            => __('Weather stations list', 'weather-map-plugin'),
		    ],
		    'public'             => false,
		    'show_ui'            => true,
		    'show_in_menu'       => true,
		    'menu_position'      => 20,
		    'menu_icon'          => 'dashicons-location',
		    'supports'           => ['title'],
		    'capability_type'    => 'post',
		    'hierarchical'       => false,
		    'has_archive'        => false,
		    'rewrite'            => false,
		    'query_var'          => false,
		    'show_in_rest'       => false, // you can change this to true if you want REST API access
		]);
    }
}