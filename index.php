<?php

// Config
$GLOBALS['template'] = 'mpr';


require_once './app/twig/lib/Twig/Autoloader.php';
require_once './app/helper.php';
require_once './app/filter.php';
require_once './app/setup.php';
require_once './app/bootstrap.php';

echo $twig->render($page . '.html', $data);


?>
