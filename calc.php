<?php
// Display errors for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Current time
$currentTime = time();

// --- Active.txt midnight countdown ---
$targetActive = strtotime("tomorrow midnight");
$timeLeftActive = $targetActive - $currentTime;
$hoursA = floor($timeLeftActive / 3600);
$minutesA = floor(($timeLeftActive % 3600) / 60);
$secondsA = $timeLeftActive % 60;

// --- ISS TLE countdown every 3 hours starting at 18:00 ---
$baseHour = 18;
$interval = 3 * 3600;
$todayBase = strtotime(date("Y-m-d $baseHour:00:00"));

if ($currentTime <= $todayBase) {
    $nextIss = $todayBase;
} else {
    $elapsed = $currentTime - $todayBase;
    $nextIss = $todayBase + (ceil($elapsed / $interval) * $interval);
}

$timeLeftIss = $nextIss - $currentTime;
$hoursI = floor($timeLeftIss / 3600);
$minutesI = floor(($timeLeftIss % 3600) / 60);
$secondsI = $timeLeftIss % 60;

// Return both countdowns as JSON
header('Content-Type: application/json');
echo json_encode([
    'active' => [
        'hours' => str_pad($hoursA, 2, '0', STR_PAD_LEFT),
        'minutes' => str_pad($minutesA, 2, '0', STR_PAD_LEFT),
        'seconds' => str_pad($secondsA, 2, '0', STR_PAD_LEFT)
    ],
    'iss' => [
        'hours' => str_pad($hoursI, 2, '0', STR_PAD_LEFT),
        'minutes' => str_pad($minutesI, 2, '0', STR_PAD_LEFT),
        'seconds' => str_pad($secondsI, 2, '0', STR_PAD_LEFT)
    ]
]);
?>
