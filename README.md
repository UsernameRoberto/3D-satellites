# 3D-satellites
Track satellites live in 3D


- **Default access token**
- Assets access enabled

---

## 📝 II. Required File Edits

### 📄 1. `index.html`

Update Cesium source paths to match your HTTPS domain:

```html
<script src="https://www.yourdomain.com/Build/Cesium/Cesium.js"></script>

📦 Cesium Engine

Download the Cesium engine from:
<script src="https://www.yourdomainname.com/Build/Cesium/Cesium.js"></script>

Please download Build Cesium Ion engine from here just to be sure everything is working OK

https://drive.google.com/file/d/1PkPH5TfLXRWlhZwbmWnNS7HUc9KPa2zU/view?usp=sharing

🛰️ III. ISS 3D Model (GLB)

Due to GitHub file size limitations, the ISS 3D .glb model is hosted externally.

🔽 Download the ISS GLB model here:
👉 https://drive.google.com/file/d/1aXyupRPdTegro9-yv1VIbw_-7VwTZCMZ/view?usp=sharing
Keep only ONE Build/ directory

Do not nest Cesium builds

Cesium requires HTTPS


🔄 IV. Satellite TLE Update System

To avoid unnecessary strain on NORAD servers, TLE data is refreshed locally using scheduled tasks.

📄 PHP Update Files

update-iss.php
Updates TLE data for the International Space Station

update-tle.php
Updates TLE data for all configured NORAD satellites

These scripts fetch, parse, and store fresh TLE data used by the visualization engine.

🪟 V. Windows – Apache + Task Scheduler
Create Scheduled Tasks

Open Task Scheduler

Create Basic Task

Trigger:

Daily (recommended every 3–12 hours)

Action:

Start a Program

Program:

php.exe


Arguments:

C:\path\to\update-iss.php


(Create a second task for update-tle.php)

Start in:

C:\path\to\your\project\


⚠️ Ensure php.exe is available in PATH or use the full executable path.

🐧 VI. Linux – Apache + Cron Job

Edit your crontab:

crontab -e


Example (run every 3-12 hours):

0 */6 * * * /usr/bin/php /var/www/html/update-iss.php
0 */6 * * * /usr/bin/php /var/www/html/update-tle.php


Verify PHP path if needed:

which php

🔐 VII. Apache Security (Recommended)

Restrict web access to update scripts using .htaccess:

<FilesMatch "^(update-iss|update-tle)\.php$">
    Require all denied
</FilesMatch>


✔️ Scripts remain executable via CLI, cron jobs, or Task Scheduler
✔️ Web access returns 403 Forbidden

🚀 Project Summary

This system integrates:

🌍 Cesium Ion — High-precision 3D Earth visualization
🛰️ NORAD TLE Data — Accurate orbital elements
🧭 Real-Time Propagation — Live satellite tracking
🔄 Scheduled Updates — Server-friendly TLE refresh
🔐 Apache Security — Protected update endpoints

Designed as a 3D satellite visualization counterpart to our Live Air Traffic Control system.

I don't mind if you add or remove anything you like. I just share because it seems like you care =)

Best whishes from Slovenia and thank you Cesium Ion. Your engine is PURE MAGIC. 

by Roberto with ❤️
