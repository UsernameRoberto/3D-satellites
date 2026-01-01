<?php
// Ensure the script is being run from the command line (CLI)
if (php_sapi_name() !== 'cli') {
    http_response_code(403);  // Forbid access if it's not from CLI
    exit("Access denied.");
}

$url = "https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle";
$localFile = __DIR__ . "/tle/active.txt";
$logFile = __DIR__ . "/tle/update_log.txt";  // Log file location

// Fetch TLE data
$data = file_get_contents($url);

if ($data !== false) {
    file_put_contents($localFile, $data);
    $logEntry = date("Y-m-d H:i:s") . " - TLE updated successfully.\n";
} else {
    $logEntry = date("Y-m-d H:i:s") . " - Failed to fetch TLE.\n";
}

// Append the log entry to the log file
file_put_contents($logFile, $logEntry, FILE_APPEND);
?>
