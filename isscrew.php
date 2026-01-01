<?php
header('Content-Type: application/json');
$crewData = file_get_contents("http://api.open-notify.org/astros.json");
echo $crewData;