<?php
/**
 * Lucide Icons Shortcode for Gutenberg
 * Add this code to your theme's functions.php or create a custom plugin
 *
 * Usage in Gutenberg:
 * [lucide_icon name="heart" size="24" color="#ff0000" class="my-icon"]
 * [icon name="star" size="32"]
 */

 /**
 * USAGE EXAMPLES:
 *
 * Basic icon:
 * [icon name="heart"]
 *
 * Icon with custom size and color:
 * [icon name="star" size="32" color="#ffd700"]
 *
 * Icon with custom class:
 * [icon name="user" class="profile-icon"]
 *
 * Icon with inline styles:
 * [icon name="check" style="margin-right: 8px;"]
 *
 * Available icon names: https://lucide.dev/icons/
 * - heart, star, user, check, x, arrow-right, etc.
 */


 // Enqueue Lucide icons script
add_action('wp_enqueue_scripts', 'enqueue_lucide_icons');
function enqueue_lucide_icons() {
    wp_enqueue_script(
        'lucide-icons',
        'https://unpkg.com/lucide@latest/dist/umd/lucide.js',
        array(),
        'latest',
        true
    );

    // Initialize Lucide icons
    wp_add_inline_script('lucide-icons', 'lucide.createIcons();');
}

// Shortcode for Lucide icons
add_shortcode('lucide_icon', 'lucide_icon_shortcode');
add_shortcode('icon', 'lucide_icon_shortcode'); // Alternative shorter name

function lucide_icon_shortcode($atts) {
    $atts = shortcode_atts(array(
        'name' => 'heart',           // Icon name (e.g., 'heart', 'star', 'user')
        'size' => 24,                // Icon size in pixels
        'color' => 'currentColor',   // Icon color (CSS color value)
        'stroke_width' => 2,         // Stroke width
        'class' => '',               // Additional CSS classes
        'style' => '',               // Inline styles
    ), $atts, 'lucide_icon');

    // Sanitize inputs
    $name = sanitize_text_field($atts['name']);
    $size = intval($atts['size']);
    $color = sanitize_text_field($atts['color']);
    $stroke_width = intval($atts['stroke_width']);
    $class = sanitize_text_field($atts['class']);
    $style = sanitize_text_field($atts['style']);

    // Build the icon HTML
    $classes = 'lucide-icon';
    if (!empty($class)) {
        $classes .= ' ' . $class;
    }

    $inline_style = "width: {$size}px; height: {$size}px; color: {$color};";
    if (!empty($style)) {
        $inline_style .= ' ' . $style;
    }

    $html = sprintf(
        '<i data-lucide="%s" class="%s" style="%s" data-stroke-width="%d"></i>',
        esc_attr($name),
        esc_attr($classes),
        esc_attr($inline_style),
        $stroke_width
    );

    return $html;
}

/**
 * Re-initialize Lucide icons after AJAX content loads
 * Useful if you load content dynamically
 */
add_action('wp_footer', 'lucide_reinit_script');
function lucide_reinit_script() {
    ?>
    <script>
    // Re-initialize Lucide icons after dynamic content loads
    function reinitLucideIcons() {
        if (typeof lucide !== 'undefined' && lucide.createIcons) {
            lucide.createIcons();
        }
    }

    // Re-init on AJAX complete (if using AJAX)
    jQuery(document).ajaxComplete(function() {
        reinitLucideIcons();
    });

    // Re-init on page load
    document.addEventListener('DOMContentLoaded', function() {
        reinitLucideIcons();
    });
    </script>
    <?php
}

/**
 * Add Lucide icons to TinyMCE editor (optional)
 * This allows inserting icons from the classic editor
 */
add_action('admin_head', 'add_lucide_to_tinymce');
function add_lucide_to_tinymce() {
    if (!current_user_can('edit_posts') && !current_user_can('edit_pages')) {
        return;
    }

    if (get_user_option('rich_editing') == 'true') {
        add_filter('mce_external_plugins', 'add_lucide_tinymce_plugin');
        add_filter('mce_buttons', 'register_lucide_button');
    }
}

function add_lucide_tinymce_plugin($plugin_array) {
    $plugin_array['lucide_icons'] = plugins_url('/js/lucide-tinymce.js', __FILE__);
    return $plugin_array;
}

function register_lucide_button($buttons) {
    array_push($buttons, 'lucide_icons');
    return $buttons;
}

