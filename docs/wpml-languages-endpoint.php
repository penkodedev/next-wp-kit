<?php
/**
 * WPML Languages Endpoint - Get active languages dynamically
 * 
 * Add to: /inc/api/api-endpoints.php
 */

// Register the languages endpoint
register_rest_route('custom/v1', '/languages', [
    'methods' => 'GET',
    'callback' => 'get_wpml_languages_callback',
    'permission_callback' => '__return_true'
]);

/**
 * Add to: /inc/api/api-callbacks.php
 * 
 * Returns all active languages configured in WPML
 */
function get_wpml_languages_callback() {
    // Get active languages from WPML
    $languages = apply_filters('wpml_active_languages', null);
    
    if (empty($languages)) {
        return rest_ensure_response([
            'languages' => [],
            'default' => 'es',
            'message' => 'WPML not active or no languages configured'
        ]);
    }
    
    $formatted = [];
    $default_code = '';
    
    foreach ($languages as $lang) {
        $formatted[] = [
            'code' => $lang['code'],
            'name' => $lang['translated_name'], // English name
            'native_name' => $lang['native_name'], // Native name (e.g., "Español")
            'is_default' => (bool) $lang['default_language'],
            'url' => $lang['url']
        ];
        
        if ($lang['default_language'] == 1) {
            $default_code = $lang['code'];
        }
    }
    
    return rest_ensure_response([
        'languages' => $formatted,
        'default' => $default_code,
        'count' => count($formatted)
    ]);
}
