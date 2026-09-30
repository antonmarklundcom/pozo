<?php
/**
 * router.php — SOLO PARA DESARROLLO LOCAL con `php -S`.
 * Imita las reglas de .htaccess (URLs limpias). NO subir a Hostinger:
 * en producción el ruteo lo hace Apache/LiteSpeed con .htaccess.
 *
 *   php -S localhost:8080 -t . router.php
 */
$uri  = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$root = __DIR__;

// Archivos estáticos reales (css, js, svg, xml, txt)
if ($uri !== '/' && is_file($root . $uri)) {
    return false;
}

// Bloquear /includes/ igual que en producción
if (strpos($uri, '/includes/') === 0) {
    http_response_code(403);
    exit('403');
}

$map = [
    '/'                              => 'index.php',
    '/pozos-artesianos/precio-metro'  => 'pozos-artesianos-precio-metro.php',
];

$slug = rtrim($uri, '/');
if ($slug === '') { $slug = '/'; }

if (isset($map[$slug])) {
    require $root . '/' . $map[$slug];
    return true;
}

$candidate = $root . $slug . '.php';
if (is_file($candidate)) {
    require $candidate;
    return true;
}

http_response_code(404);
require $root . '/404.php';
return true;
