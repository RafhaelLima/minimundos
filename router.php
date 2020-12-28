<?php

$path = parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);

if (strpos($path, "/swds") === 0) {
    require __DIR__ . "/swds/gateway/index.php";
    exit;
}

if (
    strpos($path, "/space2") === 0
) {
    require __DIR__ . "/space2/index.php";
    exit;
}

if (
    strpos($path, "/home") === 0
    || strpos($path, "/space") === 0
) {
    require __DIR__ . "/space/index.php";
    exit;
}

if (file_exists(__DIR__ . $path) == true) {
    return false;
}

exit("NOT FOUND");
