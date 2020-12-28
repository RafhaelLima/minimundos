<?php

require_once(__DIR__ . "/../../../vendor/autoload.php");


$gatewayDir = __DIR__ . "/../../../src/Gateway";

$config = new Amfphp_Core_Config();
$config->pluginsFolders[] = $gatewayDir . "/Plugins/";
$config->serviceFolders[] = $gatewayDir . "/Services/";

$gateway = Amfphp_Core_HttpRequestGatewayFactory::createGateway($config);

$gateway->service();
$gateway->output();
