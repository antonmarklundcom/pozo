<?php
/**
 * Local-only router for `php -S` that emulates the production .htaccess:
 * 301 RewriteRules, RedirectMatch 404 denials, directory index.html and the
 * 404.html ErrorDocument. PHP's built-in server ignores .htaccess and serves
 * index.html for unknown paths, which would hide broken or missing redirects.
 *
 *   php -S 127.0.0.1:8765 tools/router.php      (run from the repo root)
 *
 * Never used on Hostinger (tools/ is denied from the web there).
 */
declare(strict_types=1);

$root = dirname(__DIR__);
$uri = (string)parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$query = (string)parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_QUERY);
$htaccess = (string)@file_get_contents($root . '/.htaccess');

function notFound(string $root): bool
{
    http_response_code(404);
    header('Content-Type: text/html; charset=utf-8');
    readfile($root . '/404.html');
    return true;
}

// RedirectMatch 404 <regex>
if (preg_match_all('/^RedirectMatch\s+404\s+(\S+)/m', $htaccess, $denies)) {
    foreach ($denies[1] as $pattern) {
        if (preg_match('#' . str_replace('#', '\#', $pattern) . '#', $uri)) {
            return notFound($root);
        }
    }
}

// RewriteRule <regex> <target> [R=301,...] (pattern is matched without the leading slash)
if (preg_match_all('/^RewriteRule\s+(\S+)\s+(\S+)\s+\[[^\]]*R=301[^\]]*\]/m', $htaccess, $rules, PREG_SET_ORDER)) {
    foreach ($rules as [, $pattern, $target]) {
        if ($pattern === '^') {
            continue; // HTTPS / www canonicalisation: not applicable locally
        }
        if (preg_match('#' . str_replace('#', '\#', $pattern) . '#', ltrim($uri, '/'), $m)) {
            $location = preg_replace_callback('/\$(\d)/', static fn($g) => $m[(int)$g[1]] ?? '', $target);
            header('Location: ' . $location . ($query !== '' ? '?' . $query : ''), true, 301);
            return true;
        }
    }
}

$path = $root . $uri;
if ($uri !== '/' && is_file($path)) {
    return false; // static file or contacto.php: let the built-in server handle it
}
if (is_dir($path)) {
    if (!str_ends_with($uri, '/')) {
        header('Location: ' . $uri . '/', true, 301); // Apache DirectorySlash
        return true;
    }
    if (is_file($path . 'index.html')) {
        header('Content-Type: text/html; charset=utf-8');
        readfile($path . 'index.html');
        return true;
    }
    http_response_code(403); // Options -Indexes: a directory without index.html
    echo '403 Forbidden';
    return true;
}
return notFound($root);
