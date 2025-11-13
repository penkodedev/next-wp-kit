# WPML Translation Switcher - Implementation Guide

## ⚠️ IMPORTANTE: Acción requerida en WordPress

Para que el switcher de idiomas funcione correctamente con URLs traducidas (especialmente en CPTs), necesitas **añadir el siguiente código a tu tema de WordPress**.

---

## 1. Añadir endpoints en WordPress

**Archivo:** `/wp-content/themes/tu-tema/inc/api/api-endpoints.php`

**Copia y pega este código al final del archivo:**

```php
<?php
/**
 * WPML Translation Endpoints
 * These endpoints provide real translated URLs using wpml_object_id
 */

// Endpoint: /wp-json/custom/v1/translation/{post_id}?lang={lang}
add_action('rest_api_init', function () {
    register_rest_route('custom/v1', '/translation/(?P<id>\d+)', [
        'methods' => 'GET',
        'callback' => 'get_wpml_translation',
        'permission_callback' => '__return_true',
        'args' => [
            'id' => [
                'required' => true,
                'validate_callback' => function($param) {
                    return is_numeric($param);
                }
            ],
            'lang' => [
                'required' => false,
                'default' => 'en',
                'sanitize_callback' => 'sanitize_text_field'
            ]
        ]
    ]);
});

function get_wpml_translation($request) {
    $post_id = (int) $request['id'];
    $target_lang = $request['lang'] ?? 'en';
    
    $post = get_post($post_id);
    if (!$post) {
        return new WP_Error('post_not_found', 'Post not found', ['status' => 404]);
    }
    
    $post_type = get_post_type($post_id);
    $translated_id = apply_filters('wpml_object_id', $post_id, $post_type, false, $target_lang);
    
    if (!$translated_id || $translated_id === $post_id) {
        return rest_ensure_response([
            'exists' => false,
            'original_id' => $post_id,
            'target_lang' => $target_lang,
            'fallback_url' => $target_lang === 'en' ? '/en' : '/',
            'message' => 'Translation not available'
        ]);
    }
    
    $translated_post = get_post($translated_id);
    $translated_url = get_permalink($translated_id);
    $site_url = get_site_url();
    $relative_url = str_replace($site_url, '', $translated_url);
    
    return rest_ensure_response([
        'exists' => true,
        'original_id' => $post_id,
        'translated_id' => $translated_id,
        'target_lang' => $target_lang,
        'url' => $relative_url,
        'full_url' => $translated_url,
        'slug' => $translated_post->post_name,
        'title' => $translated_post->post_title,
        'post_type' => $translated_post->post_type
    ]);
}
```

---

## 2. Probar el endpoint manualmente

Después de añadir el código, prueba que funciona:

**Prueba 1: Post con traducción**
```
http://tu-sitio.local/wp-json/custom/v1/translation/123?lang=en
```

**Respuesta esperada (si existe traducción):**
```json
{
  "exists": true,
  "original_id": 123,
  "translated_id": 456,
  "target_lang": "en",
  "url": "/en/resorts/a-new-resource",
  "slug": "a-new-resource",
  "title": "A New Resource",
  "post_type": "recursos"
}
```

**Respuesta esperada (si NO existe traducción):**
```json
{
  "exists": false,
  "original_id": 123,
  "target_lang": "en",
  "fallback_url": "/en",
  "message": "Translation not available"
}
```

---

## 3. Cómo encontrar el post_id actual

Para usar este sistema, el `LangSwitcher` necesita saber el `post_id` de la página/post actual. Aquí tienes varias opciones:

### Opción A: Desde los datos fetched (RECOMENDADO)

En `[...slug]/page.tsx`, cuando fetcheas el contenido, WordPress ya te devuelve el `id`:

```typescript
// En [...slug]/page.tsx
const content = await getContentBySlug<Post>('posts', slug, lang);

// content.id contiene el post_id (ejemplo: 123)
```

Luego pasas ese ID al layout/header a través de contexto o props.

### Opción B: Añadir al WpPageIdContext (ya existente)

Ya tienes `WpPageIdContext.tsx` que maneja el `pageId`. Solo necesitas asegurarte de que se esté pasando correctamente.

---

## 4. Siguiente paso en Next.js

Una vez que el endpoint de WordPress esté funcionando, el siguiente paso es modificar `LangSwitcher.tsx` para:

1. Recibir el `currentPostId` como prop
2. Llamar a `getTranslatedUrl(currentPostId, targetLang)` 
3. Usar la URL real en vez de hacer traducción simple de prefijos

**Esto lo implementaremos en el siguiente paso** después de que confirmes que el endpoint funciona.

---

## 5. Testing checklist

- [ ] Código añadido a `/inc/api/api-endpoints.php`
- [ ] WordPress guardado y cache limpiado
- [ ] Endpoint testado manualmente con Postman/navegador
- [ ] Respuesta correcta para post CON traducción
- [ ] Respuesta correcta para post SIN traducción
- [ ] Ready para modificar `LangSwitcher.tsx`

---

## Problemas comunes

### "Post not found" aunque el ID existe
- Verifica que WPML esté activo
- Verifica que el post tenga traducciones creadas en WPML

### Endpoint retorna 404
- Asegúrate de que el código está en el archivo correcto
- Flush permalinks: Ve a Settings → Permalinks → Save

### `wpml_object_id` retorna NULL
- WPML no está activo o no tiene traducciones para ese contenido
- El `post_type` no está configurado como traducible en WPML

---

**Siguiente documento:** `wpml-langswitcher-implementation.md` (después de confirmar que esto funciona)
