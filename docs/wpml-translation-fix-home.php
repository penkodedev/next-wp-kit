<?php
/**
 * FIX for WPML Translation Endpoint - Home Page Detection
 * 
 * Copy this fix to:
 * c:\Users\PC - RAMALHO\Local Sites\penkode-headless\app\public\wp-content\themes\penkode-headless\inc\api\api-callbacks.php
 * 
 * In the get_wpml_translation_by_id_callback() function, AFTER getting the translated post,
 * ADD this check before building the URL:
 */

// Check if this is the home page
$is_home = false;
$home_page_id = get_option('page_on_front');

if ($home_page_id && ($post_id == $home_page_id || $translated_id == $home_page_id)) {
    $is_home = true;
}

// Build the URL based on whether it's home or not
if ($is_home) {
    // For home page, return root URL with language prefix
    if ($target_lang === 'en') {
        $relative_url = '/en/';
    } else {
        $relative_url = '/';
    }
} else {
    // For regular pages/posts, build URL with translated CPT slug
    $post_type_obj = get_post_type_object($post_type);
    $cpt_slug = $post_type_obj->rewrite['slug'] ?? $post_type;
    $translated_cpt_slug = apply_filters('wpml_get_translated_slug', $cpt_slug, $post_type, $target_lang, 'post');
    
    if ($target_lang === 'en') {
        $relative_url = '/en/' . $translated_cpt_slug . '/' . $translated_post->post_name . '/';
    } else {
        $relative_url = '/' . $translated_cpt_slug . '/' . $translated_post->post_name . '/';
    }
}

/**
 * IMPORTANT: For pages (post_type = 'page'), the CPT slug will be 'page' which is wrong.
 * Pages don't have a CPT prefix in URLs. We need special handling:
 */

// BETTER VERSION - Handle pages separately:

$is_home = false;
$home_page_id = get_option('page_on_front');

if ($home_page_id && ($post_id == $home_page_id || $translated_id == $home_page_id)) {
    $is_home = true;
}

if ($is_home) {
    // Home page - return root URL
    $relative_url = ($target_lang === 'en') ? '/en/' : '/';
} elseif ($post_type === 'page') {
    // Regular pages - no CPT prefix, just slug
    $relative_url = ($target_lang === 'en') 
        ? '/en/' . $translated_post->post_name . '/'
        : '/' . $translated_post->post_name . '/';
} else {
    // Custom Post Types - use translated CPT slug
    $post_type_obj = get_post_type_object($post_type);
    $cpt_slug = $post_type_obj->rewrite['slug'] ?? $post_type;
    $translated_cpt_slug = apply_filters('wpml_get_translated_slug', $cpt_slug, $post_type, $target_lang, 'post');
    
    $relative_url = ($target_lang === 'en')
        ? '/en/' . $translated_cpt_slug . '/' . $translated_post->post_name . '/'
        : '/' . $translated_cpt_slug . '/' . $translated_post->post_name . '/';
}
