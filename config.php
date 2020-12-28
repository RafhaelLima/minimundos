<?php

session_start();


// require_once(__DIR__ . "/swds/gateway/Plugins/Database/Database.php");

// if (isset($_COOKIE["user_email"])) {
//     $_SESSION["user_email"] = $_COOKIE["user_email"];
// }


define("WORLD_SERVER_PORT", ":5080");

define("SITE_DOMAIN", "minimundos.com.br");
//define("SITE_DOMAIN", "minimundos.com.br");
define("CONTENT_DOMAIN", "content.minimundos.com.br" . SITE_DOMAIN);
define("WIDGETS_DOMAIN", "widgets.minimundos.com.br" . SITE_DOMAIN);
define("MEDIA_DOMAIN", "media.minimundos.com.br" . SITE_DOMAIN);
define("AVATARS_DOMAIN", "avatars.minimundos.com.br" . SITE_DOMAIN);

define("SITE_URI", "https://www.minimundos.com.br" . SITE_DOMAIN . "/");
define("CONTENT_URI", "https://content.minimundos.com.br" . CONTENT_DOMAIN . "/");
define("WIDGETS_URI", "https://widgets.minimundos.com.br" . WIDGETS_DOMAIN . "/");
define("MEDIA_URI", "https://media.minimundos.com.br" . MEDIA_DOMAIN . "/");
define("AVATARS_URI", "https://avatars.minimundos.com.br" . AVATARS_DOMAIN . "/");

//define("GATEWAY_URI", rtrim(SITE_URI, "/") . WORLD_SERVER_PORT . "/swds/gateway");
define("GATEWAY_URI", rtrim(SITE_URI, "/") . "/swds/gateway");

define("API_PATH", "/api/");

define("CONTENT_VERSION", "v1399");

define("CONTENT_CONTENT", CONTENT_URI . "content-" . CONTENT_VERSION . "/");
define("CONTENT_WEBCONTENT", CONTENT_URI . "webcontent-" . CONTENT_VERSION . "/");


define("SHARED_CSS", CONTENT_WEBCONTENT . "shared/css/");
define("SHARED_JS", CONTENT_WEBCONTENT . "shared/js/");
define("SHARED_IMG", CONTENT_WEBCONTENT . "shared/img/");
define("SHARED_SWF", CONTENT_WEBCONTENT . "shared/swf/");

define("WEBSITE_CSS", CONTENT_WEBCONTENT . "website/css/");
define("WEBSITE_JS", CONTENT_WEBCONTENT . "website/js/");
define("WEBSITE_IMG", CONTENT_WEBCONTENT . "website/img/");
