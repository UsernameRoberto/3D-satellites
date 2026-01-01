let countdownData = null;
let issCrewNames = "";
let trailsVisible = true;
let currentEntity = null;
let viewer;
let areas = [];
let satellites = {};


let observerLat = 51.509865;  // default degrees
let observerLon = -0.118092;  // default degrees
let observerHeight = 0.3;   // km
let lat, lon;
let overheadEntities = [];
let currentSatelliteName = "ISS"; // default or initial satellite name
const basicSatelliteIcon = 'favicon.png'; // Replace with your PNG URL
const starlinkDefaultModelUri = 'starlink_spacex_satellite.glb';
const default3DModelUri = 'geolocation.glb'; // Your 3D model file URI
Cesium.Ion.defaultAccessToken = 'addyourtoken';

async function init() {
	
document.getElementById('toggleTrailsBtn').addEventListener('click', () => {
  trailsVisible = !trailsVisible;

  // Toggle the inactive class based on trailsVisible state
  const toggleButton = document.getElementById('toggleTrailsBtn');
  if (trailsVisible) {
    // Remove the 'inactive' class to return to the active state
    toggleButton.classList.remove('inactive');
    
    // Add the path property back when trails are on
    if (currentEntity) {
      currentEntity.path = new Cesium.PathGraphics({
        resolution: 100,
        material: new Cesium.PolylineOutlineMaterialProperty({
          color: Cesium.Color.RED,
          outlineWidth: 0.5,
          outlineColor: Cesium.Color.RED,
        }),
        width: 0.5,
        leadTime: 7200,
        trailTime: 3600,
      });
    }
  } else {
    // Add the 'inactive' class to change the button's background
    toggleButton.classList.add('inactive');
    
    // Remove the path to hide the trail
    if (currentEntity) {
      currentEntity.path = undefined;
    }
  }
});
const container = document.getElementById('rotationControlsContainer');
const toggleBtn = document.getElementById('toggleRotateBtn');

toggleBtn.addEventListener('click', () => {
  const isHidden = container.classList.toggle('hidden');

  if (!isHidden) {
    // Controls are now shown, make button active and normal position
    toggleBtn.classList.remove('fixed-right', 'inactive');
    toggleBtn.style.right = '220px';
  } else {

    toggleBtn.classList.add('fixed-right', 'inactive');
    toggleBtn.style.right = '0px';
  }
});


const containerA = document.getElementById('telemetryContainer');
const toggleBtnA = document.getElementById('toggleTelemetryBtn');

toggleBtnA.addEventListener('click', () => {
  const isHidden = containerA.classList.toggle('hidden');

  if (isHidden) {
   
      toggleBtnA.classList.add('fixed-left', 'inactive');
      toggleBtnA.style.left = '0px';
    
  } else {

    toggleBtnA.classList.remove('fixed-left', 'inactive');
    toggleBtnA.style.left = '197px';
  }
});



  function updateCountdown() {
    fetch('./calc.php')
        .then(response => response.json())
        .then(data => {
            countdownData = data;
            displayTelemetry();
        })
        .catch(err => {
            console.error('Error fetching countdown data:', err);
            countdownData = null;
        });
    }
	
	fetch("./isscrew.php")
  .then(response => response.json())
  .then(data => {
    const crew = data.people.filter(p => p.craft === "ISS");
    issCrewNames = crew.map(p => p.name).join("\n");
  })
  .catch(error => {
    console.error("Error fetching ISS crew:", error);
    issCrewNames = "Unavailable";
  });
  
  
fetch("./areas.geo.json")
  .then(response => response.json())
  .then(data => {
    areas = data.features.map(feature => ({
      name: feature.properties.name || "Unnamed Region",
      polygonGeoJson: feature.geometry
    }));
    console.log("Loaded regions:", areas.length);
  });

  
	
	const rotateXSlider = document.getElementById('rotateX');
	const rotateYSlider = document.getElementById('rotateY');
	const rotateZSlider = document.getElementById('rotateZ');

	const rotateXValue = document.getElementById('rotateXValue');
	const rotateYValue = document.getElementById('rotateYValue');
	const rotateZValue = document.getElementById('rotateZValue');
	
  function updateSliderValues() {
  // Read degrees from sliders
  const pitchDeg = parseFloat(rotateXSlider.value);
  const yawDeg = parseFloat(rotateYSlider.value);
  const rollDeg = parseFloat(rotateZSlider.value);

  // Convert degrees to radians for internal use
  manualRotation.pitch = Cesium.Math.toRadians(pitchDeg);
  manualRotation.yaw = Cesium.Math.toRadians(yawDeg);
  manualRotation.roll = Cesium.Math.toRadians(rollDeg);

  // Update display text to show degrees to the user
  rotateXValue.textContent = `${pitchDeg.toFixed(2)}°`;
  rotateYValue.textContent = `${yawDeg.toFixed(2)}°`;
  rotateZValue.textContent = `${rollDeg.toFixed(2)}°`;
}

	rotateXSlider.addEventListener('input', updateSliderValues);
	rotateYSlider.addEventListener('input', updateSliderValues);
	rotateZSlider.addEventListener('input', updateSliderValues);

const terrain = await Cesium.createWorldTerrainAsync();

const globe = new Cesium.Globe(Cesium.Ellipsoid.WGS84);
globe.baseColor = Cesium.Color.BLACK;

const viewer = new Cesium.Viewer("cesiumContainer", {
  terrainProvider: terrain,
  globe,
  timeline: true,
  animation: true,
  shouldAnimate: true
});

viewer.scene.globe.showGroundAtmosphere = false;
viewer.scene.skyAtmosphere.show = false;


 // Wait until the scene is rendered at least once (optional, but improves UX)
      await viewer.scene.render();

	const fullscreenButton = document.createElement('button');
    fullscreenButton.type = 'button';
    fullscreenButton.className = 'cesium-button cesium-toolbar-button cesium-fullscreen-button';
    fullscreenButton.textContent = 'Fullscreen';
	fullscreenButton.setAttribute('id', 'fullscreen-button');
    fullscreenButton.addEventListener("click", toggle_fullscreen);
	
    fullscreenButton.innerHTML = `
        <svg viewBox="0 0 24 24">
            <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 
            7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
        </svg>
        <svg viewBox="0 0 24 24">
            <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 
            11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
        </svg>
    `;
    document.body.appendChild(fullscreenButton);

    // Listen for the 'Escape' key to exit fullscreen
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && document.fullscreenElement) {
            toggle_fullscreen();
        }
    });

    // Listen for fullscreenchange to update the button icon
    document.addEventListener("fullscreenchange", updateFullscreenIcon);

    // Initial icon update based on the current fullscreen state
    updateFullscreenIcon();


function toggle_fullscreen() {
    if (!document.fullscreenElement) {
        document.body.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}

// Function to update the fullscreen button icon
function updateFullscreenIcon() {
    const isFullscreen = document.fullscreenElement;
    const fullscreenButton = document.getElementById('fullscreen-button');
    if (isFullscreen) {
        document.body.setAttribute("fullscreen", "");
    } else {
        document.body.removeAttribute("fullscreen");
    }
}


    // Find toolbar and append button
    const toolbarDiv = document.querySelector('.cesium-viewer-toolbar');
    if (toolbarDiv) {
        toolbarDiv.appendChild(fullscreenButton);
    }

    // Add custom CSS (can be in a separate CSS file)
    const style = document.createElement('style');
    style.innerHTML = `
        .cesium-fullscreen-button {
            position: absolute;
            right: 10px;
            top: 10px;
            z-index: 1;
        }
    `;
    document.head.appendChild(style);
      // At this point, Cesium is ready
      document.getElementById("cesiumContainer").style.display = "block";
      //console.log("site loaded"); // Debug log for completion
const laptopPosition = Cesium.Cartesian3.fromDegrees(-0.118092, 51.509865);
const laptopModelUri = 'lenovo.glb';

const laptopEntity = viewer.entities.add({
  position: laptopPosition,
  model: {
    uri: laptopModelUri,
    minimumPixelSize: 64,
    scale: 1.0,
  },
  name: 'Hardware Monitor',
});

const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

handler.setInputAction(function(click) {
  const pickedObject = viewer.scene.pick(click.position);

  if (Cesium.defined(pickedObject) && pickedObject.id === laptopEntity) {
    viewer.camera.flyTo({
      destination: laptopPosition,
      duration: 2,
    });
    document.getElementById('hardwareOverlay').style.display = 'block';
  } else {
    const cartesian = viewer.scene.pickPosition(click.position);
    if (cartesian) {
      const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
      observerLat = Cesium.Math.toDegrees(cartographic.latitude);
      observerLon = Cesium.Math.toDegrees(cartographic.longitude);
      observerHeight = cartographic.height / 1000.0;

      console.log(`New observer position: ${observerLat.toFixed(4)}, ${observerLon.toFixed(4)} (${observerHeight.toFixed(2)} km)`);

      updateOverheadSatellites();
    }
  }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

handler.setInputAction(function(movement) {
  const pickedObject = viewer.scene.pick(movement.endPosition);

  if (Cesium.defined(pickedObject) && pickedObject.id === laptopEntity) {
    viewer.canvas.style.cursor = 'pointer';
  } else {
    const pickedPosition = viewer.scene.pickPosition(movement.endPosition);
    if (Cesium.defined(pickedPosition)) {
      viewer.canvas.style.cursor = 'pointer';
    } else {
      viewer.canvas.style.cursor = 'default';
    }
  }
}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

// Close button handler stays the same
  document.getElementById('closeIframe').onclick = function() {
  document.getElementById('hardwareOverlay').style.display = 'none';
};

  

//console.log(viewer.imageryLayers.length); // Should be 1
//console.log(viewer.imageryLayers.get(0)); // See what provider is loaded

  //viewer.clock.multiplier = 1;
  //viewer.clock.clockStep = Cesium.ClockStep.SYSTEM_CLOCK;
  
viewer.clock.clockStep = Cesium.ClockStep.SYSTEM_CLOCK;
viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;
viewer.clock.shouldAnimate = true;
//viewer.scene.backgroundColor = new Cesium.Color(0.53, 0.81, 0.92, 1.0);
viewer.scene.backgroundColor = Cesium.Color.BLACK;

viewer.scene.globe.baseColor = Cesium.Color.BLACK;
viewer.scene.light = new Cesium.SunLight();
viewer.scene.globe.enableLighting = true;
//viewer.scene.skyAtmosphere.show = true; // Enables visual atmosphere
viewer.scene.sun.show = true; // Shows sun disk
viewer.scene.requestRender();

  const ctrl = viewer.scene.screenSpaceCameraController;
  ctrl.enableRotate = true;
  ctrl.enableTranslate = true;
  ctrl.enableZoom = true;
  ctrl.enableTilt = true;
  ctrl.enableLook = true;

  // Satellite data: TLE, model URIs, and minimumPixelSize per satellite
  const satellites = {
	"ACRIMSAT": {
      tle1: "1 26033U 99070B   25224.37165914  .00000546  00000-0  10995-3 0  9992",
      tle2: "2 26033  98.3010   0.4034 0026470 358.5134   1.5986 14.65382366367656",
      modelUri: "AcrimSAT.glb",
      minimumPixelSize: 80
    },
	"AQUA-A": {
      tle1: "1 27424U 02022A   25224.77424980  .00000900  00000-0  19180-3 0  9992",
      tle2: "2 27424  98.3819 183.8521 0001013 109.7241   6.8140 14.61399305238212",
      modelUri: "AquaA.glb",
      minimumPixelSize: 80
    },
	"AQUARIUS": {
      tle1: "1 37673U 11024A   25224.71786398  .00000953  00000-0  13987-3 0  9996",
      tle2: "2 37673  97.9884 236.2876 0001887  76.6087  14.4209 14.77817920762219",
      modelUri: "AquariusA.glb",
      minimumPixelSize: 150
    },
	"ATLAS": {
      tle1: "1 43017U 17073A   25224.41614581  .00000041  00000-0  00000+0 0  9997",
      tle2: "2 43017  97.8181 243.1523 0012060  80.5417 279.6856 14.89999466134427",
      modelUri: "Untitled2.glb",
      minimumPixelSize: 150
    },
	"CALIPSO": {
      tle1: "1 29108U 06016B   25224.72295111  .00001260  00000-0  22715-3 0  9995",
      tle2: "2 29108  98.4500 224.9774 0001588 108.1610 251.9767 14.68359282 27770",
      modelUri: "CALIPSO.glb",
      minimumPixelSize: 150
    },
	"CHANDRA": {
      tle1: "1 26919U 01003A   25224.11538743  .00000231  00000-0  00000+0 0  9991",
      tle2: "2 26919  28.5381 143.5945 0004696 120.4167 239.6672 14.57142927349855",
      modelUri: "Chandra.glb",
      minimumPixelSize: 150
    },
	"CLEMENTINE": {
      tle1: "1 25978U 99064B   25224.72594935  .00013321  00000-0  52492-3 0  9993",
      tle2: "2 25978  98.1809 282.5016 0004231 135.2490 224.9088 15.25732986661303",
      modelUri: "Clementine.glb",
      minimumPixelSize: 150
    },
	"CLOUDSAT": {
      tle1: "1 29107U 06016A   25224.67570105  .00001307  00000-0  15884-3 0  9998",
      tle2: "2 29107  98.4225 239.4857 0004096 241.8555 118.2245 14.85387510 28698",
      modelUri: "CloudSat.glb",
      minimumPixelSize: 150
    },
	"EO-1": {
      tle1: "1 26619U 00075A   25224.75274654  .00000799  00000-0  14633-3 0  9996",
      tle2: "2 26619  98.0707 179.5267 0009874  33.8542 326.3292 14.68478778601315",
      modelUri: "EO-1.glb",
      minimumPixelSize: 150
    },
	"FIREFLY": {
      tle1: "1 62710U 25009DF  25224.71291227  .00001753  00000-0  17453-3 0  9997",
      tle2: "2 62710  97.7348 303.7967 0003787 113.1542 247.0077 14.92891927 31310",
      modelUri: "Firefly.glb",
      minimumPixelSize: 150
    },
	"HUBBLE HST": {
      tle1: "1 20580U 90037B   25224.76267362  .00006749  00000-0  24781-3 0  9999",
      tle2: "2 20580  28.4693  21.2761 0002128   4.4339 355.6274 15.25875171741336",
      modelUri: "Hubble.glb",
      minimumPixelSize: 180
    },
	
	"ICESat": {
      tle1: "1 43613U 18070A   25224.74914996  .00003723  00000-0  13514-3 0  9999",
      tle2: "2 43613  91.9905 207.8962 0002375 358.6711   1.4532 15.28277855385353",
      modelUri: "ICESat.glb",
      minimumPixelSize: 150
    },
	"ISS": {
      tle1: "1 25544U 98067A   25224.15196245  .00009249  00000-0  16708-3 0  9997",
      tle2: "2 25544  51.6349  29.6760 0001148 180.0973 180.0016 15.50469254523841",
      modelUri: "ISS_stationary.glb",
      minimumPixelSize: 180
    },
	"JASON": {
      tle1: "1 26997U 01055A   25224.68134184 -.00000075  00000-0 -57338-4 0  9998",
      tle2: "2 26997  66.0411 358.1878 0006703 262.3981 109.4268 12.84074263109029",
      modelUri: "Sentinel-6.glb",
      minimumPixelSize: 150
    },
	"MESOSPHERE": {
      tle1: "1 37773U 11034A   25224.19617919  .00000055  00000-0  00000+0 0  9991",
      tle2: "2 37773  98.7031  41.7837 0001528  87.4691 272.7099 14.38401346326189",
      modelUri: "Mesosphere.glb",
      minimumPixelSize: 150
    },
	"RADARSAT-1": {
      tle1: "1 23710U 95059A   25224.74257944  .00000219  00000-0  97734-4 0  9994",
      tle2: "2 23710  98.5512 233.0379 0001001 101.9573 258.1723 14.32169071554196",
      modelUri: "RADARSAT.glb",
      minimumPixelSize: 150
    },
	"SHOEMAKER": {
      tle1: "1 56943U 23084M   25224.67286440  .00022142  00000-0  52756-3 0  9995",
      tle2: "2 56943  97.4592 352.1063 0005108 306.7410  53.3367 15.41593054120849",
      modelUri: "NEAR.glb",
      minimumPixelSize: 150
    },
	"ISS ENTERPRISE": {
       tle1: "1 99999U 25001A   25230.50000000  .00000001  00000-0  50000-4 0  9990",
       tle2: "2 99999 180.0000 000.0000 0000001 000.0000 000.0000 1500.00000000    0",
       modelUri: "u.s.s._enterprise_ncc-1701-a.glb",
       minimumPixelSize: 150
     },
  };

  // Build dropdown options dynamically
  const dropdown = document.getElementById("satelliteDropdown");
  Object.keys(satellites).forEach((key) => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = key;
    dropdown.appendChild(option);
	
  });

  // Start with ISS selected
  dropdown.value = "ISS";

  // Variables to hold current satellite info
  let currentSatrec = null;
  let currentSampledPosition = null;
  let currentEntity = null;
  let autoFollow = false;
  let userInteracted = true;

  // Get current satellite position in Cartesian3
  function getSatPositionCartesian(date) {
    const now = date || new Date();
    if (!currentSatrec) return null;
    const pv = satellite.propagate(currentSatrec, now);
    if (!pv.position) return null;
    const gmst = satellite.gstime(now);
    const geo = satellite.eciToGeodetic(pv.position, gmst);
    const lon = Cesium.Math.toDegrees(geo.longitude);
    const lat = Cesium.Math.toDegrees(geo.latitude);
    const alt = geo.height * 1000;
    return Cesium.Cartesian3.fromDegrees(lon, lat, alt);
  }
  
function computeExtendedTelemetry(satrec, date) {
  const now = date || new Date();
  if (!satrec) return null;

  const pv = satellite.propagate(satrec, now);
  if (!pv.position || !pv.velocity) return null;

  const gmst = satellite.gstime(now);
  const geo = satellite.eciToGeodetic(pv.position, gmst);

  const altitudeKm = geo.height;
  const latitudeDeg = Cesium.Math.toDegrees(geo.latitude);
  const longitudeDeg = Cesium.Math.toDegrees(geo.longitude);

  const velocity = pv.velocity;
  const speedKps = Math.sqrt(
    velocity.x * velocity.x +
    velocity.y * velocity.y +
    velocity.z * velocity.z
  );
  const speedKph = speedKps * 3600;

  // --- Normalize a vector ---
  const norm = (v) => {
    const mag = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    return { x: v.x / mag, y: v.y / mag, z: v.z / mag };
  };

  const forward = norm(pv.velocity);  // Direction of travel
  const radial = norm(pv.position);   // Direction to Earth center
  const right = norm({
    x: forward.y * radial.z - forward.z * radial.y,
    y: forward.z * radial.x - forward.x * radial.z,
    z: forward.x * radial.y - forward.y * radial.x,
  });

  const down = {
    x: right.y * forward.z - right.z * forward.y,
    y: right.z * forward.x - right.x * forward.z,
    z: right.x * forward.y - right.y * forward.x,
  };

  const yaw = Math.atan2(forward.y, forward.x) * (180 / Math.PI);
  const pitch = Math.asin(-forward.z) * (180 / Math.PI);
const roll = Math.atan2(-down.y, down.z) * (180 / Math.PI);
  
  //console.log(`yaw=${yaw}, pitch=${pitch}, roll=${roll}`);


  return {
    altitude: altitudeKm,
    latitude: latitudeDeg,
    longitude: longitudeDeg,
    speed: {
      kmps: speedKps,
      kmph: speedKph,
    },
    rotation: {
      yaw,
      pitch,
      roll,
    },
    eci: {
      x: pv.position.x,
      y: pv.position.y,
      z: pv.position.z,
    },
    timestamp: now.toISOString()
  };
}



function getSatData(date) {
  return computeExtendedTelemetry(currentSatrec, date);
}
function getTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}

function formatTimeUTC(date) {
  return date.toUTCString().slice(17, 22); // HH:MM from UTC string
}

function displayTelemetry() {
    const telemetry = document.getElementById("telemetry");
    const data = getSatData(new Date());

    if (!data) {
        telemetry.textContent = "Telemetry data unavailable";
        return;
    }

    let yaw, pitch, roll;
    if (autoFollow) {
        yaw = Cesium.Math.toDegrees(manualRotation.yaw);
        pitch = Cesium.Math.toDegrees(manualRotation.pitch);
        roll = Cesium.Math.toDegrees(manualRotation.roll);
    } else {
        yaw = data.rotation.yaw;
        pitch = data.rotation.pitch;
        roll = data.rotation.roll;
    }

    const lat = typeof clickedLat !== "undefined" ? clickedLat : data.latitude;
    const lon = typeof clickedLon !== "undefined" ? clickedLon : data.longitude;

    const times = SunCalc.getTimes(new Date(), lat, lon);

    let telemetryText =
        `🛰️ ${currentSatelliteName}\n` +
        `${data.timestamp}\n` +
        `Latitude:      ${lat.toFixed(4)}°\n` +
        `Longitude:     ${lon.toFixed(4)}°\n` +
        `Altitude:      ${data.altitude.toFixed(2)} km\n` +
        `Speed km/s:    ${data.speed.kmps.toFixed(5)}\n` +
        `Speed km/h:    ${data.speed.kmph.toFixed(2)}\n` +
        `Yaw:           ${yaw.toFixed(2)}°\n` +
        `Pitch:         ${pitch.toFixed(2)}°\n` +
        `Roll:          ${roll.toFixed(2)}°\n` +
        `Sunrise (UTC): ${formatTimeUTC(times.sunrise)}\n` +
        `Sunset (UTC):  ${formatTimeUTC(times.sunset)}\n`;

    updateAreaInfo(lat, lon);

    // Show countdowns safely
    if (countdownData?.active && countdownData?.iss) {
        telemetryText += 
          `\nTLE Update: ${countdownData.active.hours}:${countdownData.active.minutes}:${countdownData.active.seconds}` +
          `\nISS TLE Update:    ${countdownData.iss.hours}:${countdownData.iss.minutes}:${countdownData.iss.seconds}\n`;
    } else {
        telemetryText += `\nTLE countdown unavailable\n`;
    }

    telemetryText += `\n👨‍🚀 ISS Crew: \n${issCrewNames}` +
                     `\n\nMade in Slovenia 🇸🇮` +
                     `\nby Roberto`;

    telemetry.textContent = telemetryText;
}


updateCountdown();
setInterval(updateCountdown, 1000);
// Optional: also refresh telemetry separately if needed
//setInterval(displayTelemetry, 1000);

  // Create sampled position property for smooth interpolation
  function createSampledPositionProperty(satrec) {
    const sampledPosition = new Cesium.SampledPositionProperty();
    const start = Cesium.JulianDate.now();
    for (let i = -7200; i <= 7200; i += 10) {
      const dt = Cesium.JulianDate.addSeconds(start, i, new Cesium.JulianDate());
      const jsd = Cesium.JulianDate.toDate(dt);
      const pv = satellite.propagate(satrec, jsd);
      if (!pv.position) continue;
      const gmst = satellite.gstime(jsd);
      const geo = satellite.eciToGeodetic(pv.position, gmst);
      const lon = Cesium.Math.toDegrees(geo.longitude);
      const lat = Cesium.Math.toDegrees(geo.latitude);
      const alt = geo.height * 1000;
      sampledPosition.addSample(dt, Cesium.Cartesian3.fromDegrees(lon, lat, alt));
    }
    return sampledPosition;
  }

  // Add satellite entity to viewer

function addSatelliteEntity(name, satrec, modelUri) {
  if (currentEntity) {
    viewer.entities.remove(currentEntity);
    currentEntity = null;
  }

  const currentSampledPosition = createSampledPositionProperty(satrec);

  const entityOptions = {
    name,
    availability: new Cesium.TimeIntervalCollection([
      new Cesium.TimeInterval({
        start: Cesium.JulianDate.addSeconds(Cesium.JulianDate.now(), -7200, new Cesium.JulianDate()),
        stop: Cesium.JulianDate.addSeconds(Cesium.JulianDate.now(), 7200, new Cesium.JulianDate())
      })
    ]),
    position: currentSampledPosition,
  };

  const isStarlink = name.toLowerCase().includes('starlink');

  if (isStarlink) {
    // Use the default Starlink 3D model
    entityOptions.model = {
      uri: starlinkDefaultModelUri,
      minimumPixelSize: 128,
    };
  } else if (modelUri) {
    // Use the provided model
    entityOptions.model = {
      uri: modelUri,
      minimumPixelSize: satellites[name]?.minimumPixelSize || 64,
    };
  } else {
    // Use your 3D map pin model instead of 2D billboard
    entityOptions.model = {
      uri: default3DModelUri,
      minimumPixelSize: 64,
      scale: 1.0, // Adjust scale as needed
      // You can add more properties here for orientation, color, etc.
    };
  }

  if (trailsVisible) {
    entityOptions.path = {
      resolution: 100,
      material: new Cesium.PolylineOutlineMaterialProperty({
        color: Cesium.Color.RED,
        outlineWidth: 0.5,
        outlineColor: Cesium.Color.RED,
      }),
      width: 0.5,
      leadTime: 7200,
      trailTime: 3600,
    };
  }

  currentEntity = viewer.entities.add(entityOptions);
}

  // Update satellite based on dropdown selection
  function updateSatellite(name) {
    currentSatelliteName = name;
    const sat = satellites[name];
    if (!sat) return;

    currentSatrec = satellite.twoline2satrec(sat.tle1, sat.tle2);
    addSatelliteEntity(name, currentSatrec, sat.modelUri);

    // Update camera view to satellite start position (with offset)
    const pos = getSatPositionCartesian();
    if (pos) {
        const transform = Cesium.Transforms.eastNorthUpToFixedFrame(pos);
        const offset = new Cesium.Cartesian3(0, -8e6, 4e6);
        viewer.camera.lookAtTransform(transform, offset);
    }

    // Update observer location to satellite's subpoint
    const telemetry = computeExtendedTelemetry(currentSatrec);
    if (telemetry) {
        observerLat = telemetry.latitude;
        observerLon = telemetry.longitude;
        observerHeight = telemetry.altitude;
    }

    // Update overhead satellites and telemetry panel
    updateOverheadSatellites();
    displayTelemetry();

    // Reset follow button
    autoFollow = false;
	
	viewer.trackedEntity = undefined;
    followButton.textContent = "🚫 " + name;

}
viewer.clock.onTick.addEventListener(() => {
  const pos = getSatPositionCartesian();
  if (pos && currentEntity) {
    if (!autoFollow) {  // <-- manual rotation active when NOT following
      const hpr = new Cesium.HeadingPitchRoll(
        manualRotation.yaw,
        manualRotation.pitch,
        manualRotation.roll
      );
      currentEntity.orientation = Cesium.Transforms.headingPitchRollQuaternion(pos, hpr);
    } else {
      // Follow mode: camera looks at satellite
      const transform = Cesium.Transforms.eastNorthUpToFixedFrame(pos);
      const offset = new Cesium.Cartesian3(0, -8e6, 4e6);
      viewer.camera.lookAtTransform(transform, offset);

      // Apply telemetry orientation (or default orbit orientation)
      const telemetry = getSatData();
      if (telemetry) {
        const yawRad = Cesium.Math.toRadians(telemetry.rotation.yaw);
        const pitchRad = Cesium.Math.toRadians(telemetry.rotation.pitch);
        const rollRad = Cesium.Math.toRadians(telemetry.rotation.roll);
        const hpr = new Cesium.HeadingPitchRoll(yawRad, pitchRad, rollRad);
        currentEntity.orientation = Cesium.Transforms.headingPitchRollQuaternion(pos, hpr);

        // Sync sliders to telemetry live if you want
        rotateXSlider.value = telemetry.rotation.pitch.toFixed(2);
        rotateYSlider.value = telemetry.rotation.yaw.toFixed(2);
        rotateZSlider.value = telemetry.rotation.roll.toFixed(2);

        rotateXValue.textContent = `${rotateXSlider.value}°`;
        rotateYValue.textContent = `${rotateYSlider.value}°`;
        rotateZValue.textContent = `${rotateZSlider.value}°`;
      }
    }
  }

  displayTelemetry();
});

// Load TLEs: active.txt for general sats + direct ISS fetch
async function loadTLE() {
    // Load general satellites
    const response = await fetch('tle/active.txt');
    const text = await response.text();
    const lines = text.split('\n');

    for (let i = 0; i < lines.length; i += 3) {
        const name = lines[i]?.trim();
        const tle1 = lines[i + 1]?.trim();
        const tle2 = lines[i + 2]?.trim();
        if (name && tle1 && tle2) {
            satellites[name] = { tle1, tle2 };
        }
    }

    console.log(`Loaded ${Object.keys(satellites).length} satellites from active.txt`);

    // Load ISS separately
    try {
        const issResponse = await fetch('tle/iss.txt');
        const issText = await issResponse.text();
        const issLines = issText.trim().split('\n');

        if (issLines.length >= 3) {
            const issName = issLines[0].trim();
            const tle1 = issLines[1].trim();
            const tle2 = issLines[2].trim();
            satellites[issName] = { tle1, tle2 };
            console.log(`Loaded ISS TLE from tle/iss.txt`);
        }
    } catch (err) {
        console.error("Failed to load ISS TLE from file:", err);
    }

    // Start periodic updates
    setInterval(updateOverheadSatellites, 5000);
    updateOverheadSatellites();
}



// Update satellites currently overhead, applying optional search filter
function updateOverheadSatellites() {
    const now = new Date();
    const query = document.getElementById("satSearch").value.toLowerCase();
    let count = 0;
    let overheadNames = [];

    for (const name in satellites) {
        // Check search filter first
        if (query && !name.toLowerCase().includes(query)) continue;

        const satrec = satellite.twoline2satrec(
            satellites[name].tle1,
            satellites[name].tle2
        );

        const pv = satellite.propagate(satrec, now);
        if (!pv.position) continue;

        const gmst = satellite.gstime(now);
        const positionEcf = satellite.eciToEcf(pv.position, gmst);
        const observerGd = {
            latitude: satellite.degreesToRadians(observerLat),
            longitude: satellite.degreesToRadians(observerLon),
            height: observerHeight
        };

        const lookAngles = satellite.ecfToLookAngles(observerGd, positionEcf);
        if (lookAngles.elevation > 0) {
            count++;
            overheadNames.push(name);
        }
    }

    const countHtml = `<strong>Satellites in Area:</strong> ${count}`;
    const listHtml = overheadNames.length
  ? `<br><small>${overheadNames.map(name => 
      `<button class="sat-overhead-btn" data-name="${name}" style="font-family:'Oxanium';background:none; border:none; cursor:pointer; padding:0; font-size:small;">
        ${name}
      </button>`
    ).join("<br>")}</small>`
  : "<br><small>None</small>";

document.getElementById("satOverheadCount").innerHTML = countHtml + listHtml;
}

document.getElementById("satOverheadCount").addEventListener("mousedown", (event) => {
  if (event.target.classList.contains("sat-overhead-btn")) {
    event.preventDefault();  // prevent any default selection behavior
    const satName = event.target.getAttribute("data-name");
    if (satellites[satName]) {
  updateSatellite(satName);
  autoFollow = true;
  followButton.textContent = `✅ ${satName}`;

  // Check if satellite is already in the dropdown
  const existingOption = Array.from(dropdown.options).find(opt => opt.value === satName);
  if (!existingOption) {
    // Add it to dropdown
    const option = document.createElement("option");
    option.value = satName;
    option.textContent = satName;
    dropdown.appendChild(option);
  }

  // Select it
  dropdown.value = satName;
}

  }
});

// Update overhead satellites when search input changes
document.getElementById("satSearch").addEventListener("input", updateOverheadSatellites);


loadTLE();


// Initialize overhead display to 0
document.getElementById("satOverheadCount").innerHTML = `<strong>Satellites in Area:</strong> 0<br><small>Click on the globe or satellite to set location</small>`;

// Hook into Cesium clock tick
viewer.clock.onTick.addEventListener(updateOverheadSatellites);


  // Setup user interaction & follow toggle button
  const followButton = document.getElementById("followToggle");

  viewer.screenSpaceEventHandler.setInputAction(() => userInteracted = true, Cesium.ScreenSpaceEventType.LEFT_DOWN);

  followButton.addEventListener("click", () => {
    autoFollow = !autoFollow;
    userInteracted = !autoFollow;

    followButton.textContent = autoFollow ? `✅ ${currentSatelliteName}` : `🚫 ${currentSatelliteName}`;

    if (autoFollow) {
      const pos = getSatPositionCartesian();
      if (pos) {
        const transform = Cesium.Transforms.eastNorthUpToFixedFrame(pos);
        const offset = new Cesium.Cartesian3(0, -8e6, 4e6);
        viewer.camera.lookAtTransform(transform, offset);
      }
    }
  });

  // Change satellite when user selects different option
  dropdown.addEventListener("change", () => {
    updateSatellite(dropdown.value);
  });

  // Initialize viewer with ISS
  updateSatellite("ISS");

  // Optional: Set initial camera view far away for full globe view
  
  //  viewer.camera.setView({
  //    destination: Cesium.Cartesian3.fromDegrees(0, 0, 21000000),
  //    orientation: {
  //      heading: 0.0,
  //      pitch: -Cesium.Math.PI_OVER_TWO,
  //      roll: 0.0
  //    }
  //  });
  let manualRotation = {
  roll: 0,
  pitch: 0,
  yaw: 0
};



function isValidLinearRing(coords) {
  // coords is an array of positions (array of [lng, lat])
  return Array.isArray(coords) && coords.length >= 4;
}

function updateAreaInfo(satLat, satLon) {
  if (!Array.isArray(areas) || areas.length === 0) {
    console.warn("Areas not loaded yet");
    return;
  }

  const point = turf.point([satLon, satLat]);
  let areaFound = "No Man's Land";

  for (const area of areas) {
    let polygon;
    const geom = area.polygonGeoJson;

    if (geom.type === "Polygon") {
      if (geom.coordinates.every(isValidLinearRing)) {
        polygon = turf.polygon(geom.coordinates);
      } else {
        console.warn("Invalid polygon skipped:", area.name);
        continue;
      }
    } else if (geom.type === "MultiPolygon") {
      // Validate all polygons in multipolygon
      if (geom.coordinates.every(polygonCoords => polygonCoords.every(isValidLinearRing))) {
        polygon = turf.multiPolygon(geom.coordinates);
      } else {
        console.warn("Invalid multipolygon skipped:", area.name);
        continue;
      }
    }

    if (polygon && turf.booleanPointInPolygon(point, polygon)) {
      areaFound = area.name;
      break;
    }
  }

  //console.log("Satellite position:", satLat, satLon);
  //console.log("Detected area:", areaFound);

  document.getElementById('area-name').textContent = areaFound;
}

}
 window.onload = async () => {
      await init(); // Wait until Cesium viewer and terrain are fully ready

      // Hide preloader after init is fully done
      const preloader = document.getElementById("preloader");
      preloader.style.opacity = "0";
      setTimeout(() => (preloader.style.display = "none"), 1500);
    };
	
    

