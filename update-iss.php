<?php
// Ensure the script is being run from the command line (CLI)
if (php_sapi_name() !== 'cli') {
    http_response_code(403);
    exit("Access denied.");
}

$url = "https://celestrak.org/NORAD/elements/gp.php?CATNR=25544";
$localFile = __DIR__ . "/tle/iss.txt";
$logFile = __DIR__ . "/tle/update_log.txt";  // Reuse the same log file

// Fetch ISS TLE data
$data = file_get_contents($url);

if ($data !== false && strlen(trim($data)) > 0) {
    file_put_contents($localFile, $data);
    $logEntry = date("Y-m-d H:i:s") . " - ISS TLE updated successfully.\n";
} else {
    $logEntry = date("Y-m-d H:i:s") . " - Failed to fetch ISS TLE.\n";
}

// Append to log
file_put_contents($logFile, $logEntry, FILE_APPEND);
?>
