// Grant CesiumJS access to your ion assets
Cesium.Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4Zjk5N2RlYS0zMGY2LTQxNWQtYjAwMy1iYWUyODI4ODY5YTUiLCJpZCI6MTE3OTUzLCJpYXQiOjE2NzA3Mzk4MTl9.k3I9be0G6cm7S9-U3lYsvSaUZ6mKVf0Capzojy3RZAU";
Cesium.GoogleMaps.defaultApiKey =
 "AIzaSyA1au3L6n6ZZvFqojyNMfB27DiGHLAX7h8";  //******* Required for Google Photorealistic *******//

import { loadCZML } from "./data.js";
import { buildingHighlight, addRings, updateRingPositions, setupOverlayToggles } from "./overlays.js";
import { setupTargets } from "./targets.js";
import { setupBuildingToggles } from "./toggles.js";
import { setupCamera } from "./camera.js";
import { setupCompass } from "./compass.js";

async function main() {

  // ----------------- globals -----------------
  const homeLong = 138.5989411669657;
  const homeLat = -34.9328750617752;
  const homeHeight = 1200;

  let currentTarget = null;
  let targetHighlights = [];
  let distanceRings = [];
  let entities = [];
  let activeBuilding = "B1";
  let currentIndex = 0;
  let buildingTargets = {};
  let flyToTarget = null;
  let buildingOverlaysEnabled = true;
  let distanceOverlaysEnabled = false;
  let locationPanelVisible = false;

  // ----------------- MAP MODES -----------------
  let googleTileset = null;
  let osmBuildingsTileset = null;
  let osmImageryLayer = null;

  const store = { Cesium };

  const buildingIndexRanges = {
    B1: { start: 0, end: 3 },
    B2: { start: 4, end: 7 },
    B3: { start: 8, end: 11 },
    B4: { start: 12, end: 15 },
    B5: { start: 16, end: 19 },
  };

  // ----------------- OVERLAY STATE -----------------
  const buildingOverlayState = {
    B1: true,
    B2: true,
    B3: true,
    B4: true,
    B5: true,
  };

  //*****-------------------------------------------------- WORLD SETUP ------------------------------------------------------*****//
  const viewer = new Cesium.Viewer("cesiumContainer", {
    //terrain: Cesium.Terrain.fromWorldTerrain(), //******* Not required for Google Photorealistic *******//
    timeline: false,
    animation: false,
    infoBox: false,
    geocoder: false,
    navigationHelpButton: false,
    baseLayerPicker: false,
    searchButton: false,
    homeButton: false,
    selectionIndicator: false,
    sceneModePicker: false
  });
  
    // OSM Imagery
    osmImageryLayer = viewer.imageryLayers.addImageryProvider(
      new Cesium.OpenStreetMapImageryProvider({
        url: "https://a.tile.openstreetmap.org/",
      })
    );
    osmImageryLayer.show = false;

    // OSM Buildings
    osmBuildingsTileset = await Cesium.createOsmBuildingsAsync();
    viewer.scene.primitives.add(osmBuildingsTileset);
    osmBuildingsTileset.show = false;


  viewer.scene.globe.enableLighting = true;
  viewer.scene.globe.show = false;  //******* Not required for Google Photorealistic *******//
  viewer._cesiumWidget._creditContainer.style.display = "none";
  viewer.camera.moveEnd.addEventListener(() => {
    if (currentTarget) {
        updateRingPositions(currentTarget, distanceRings, Cesium);
    }
  });

  // Add Photorealistic 3D Tiles //******* Turn on/off during testing *******//
  try {
    googleTileset = await Cesium.createGooglePhotorealistic3DTileset();
    viewer.scene.primitives.add(googleTileset);
  } catch (error) {
    console.error("Google Photorealistic Tiles failed:", error);
  }

  //*****-------------------------------------------------- SWITCH TERRAIN TOGGLE -------------------------------------------------*****//
  const terrainToggle = document.getElementById("terrainSwitchToggle");

  terrainToggle.checked = false;

terrainToggle.addEventListener("change", async (e) => {
  const useOSM = e.target.checked;

  if (useOSM) {
    // ---- OSM MODE ----
    osmImageryLayer.show = true;
    osmBuildingsTileset.show = true;

    if (googleTileset) {
      googleTileset.show = false;
    }

    // ✅ ENABLE TERRAIN
    viewer.terrainProvider = await Cesium.createWorldTerrainAsync();
    viewer.scene.globe.show = true;

  } else {
    // ---- GOOGLE MODE ----
    osmImageryLayer.show = false;
    osmBuildingsTileset.show = false;

    if (googleTileset) {
      googleTileset.show = true;
    }

    // ✅ DISABLE TERRAIN (flat ellipsoid)
    viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
    viewer.scene.globe.show = false;
  }
});


  //*****-------------------------------------------------- IMPORT .CZML FILE -------------------------------------------------*****//
  try {
    entities = await loadCZML(viewer, Cesium);
    console.log("CZML loaded:", entities.length, "entities");
  } catch (err) {
    console.error("CZML load error:", err);
  }

  function getImageForEntity(entity) {
    if (!entity?.id) return null;

    // Example: CZML id = "Location_03"
    return `img/${entity.id}.png`;
  }

  //*****----------------------------------------------------- CAMERA SETUP ---------------------------------------------------*****//
  flyToTarget = setupCamera(viewer, Cesium);

  function resetCameraPositionToHome() {
    currentIndex = -1;

    hideLocationPanel();
    hideDescriptionPanel();

    const homeDestination = Cesium.Cartesian3.fromDegrees(
      homeLong,
      homeLat,
      homeHeight
    );

    flyToTarget(homeDestination, buildingTargets.HOME);
  }

  //*****------------------------------------------------------ DESCRIPTION --------------------------------------------------*****//
  function updateDescription(entity) {
    const descriptionElement = document.getElementById("description");
    if (!descriptionElement) return;

    // Restore visibility
    descriptionElement.style.display = "block";

    if (!entity?.description) {
      descriptionElement.textContent = "No description available.";
      return;
    }

    const val = entity.description.getValue?.();
    descriptionElement.textContent = val || "No description available.";
  }


  //*****------------------------------------------------- NAVIGATION BUTTONS ------------------------------------------------*****//
  function goToEntityByIndex(index) {
    const range = buildingIndexRanges[activeBuilding];
    if (!range || !entities.length) return;

    if (index < 0 || index > range.end - range.start) index = 0;

    currentIndex = index;
    const entity = entities[range.start + currentIndex];
    if (!entity) return;

    viewer.selectedEntity = entity;
    updateDescription(entity);

    const pos = entity.position?.getValue(Cesium.JulianDate.now());
    if (!pos || !currentTarget) return;

    flyToTarget(pos, currentTarget);
    showLocationPanelForEntity(entity);
  }

  function onNextButtonClick() {
    goToEntityByIndex(currentIndex + 1);
  }

  function onPrevButtonClick() {
    goToEntityByIndex(currentIndex - 1);
  }

  const nextButton = document.getElementById("RightBut");
  const prevButton = document.getElementById("LeftBut");
  nextButton && nextButton.addEventListener("click", onNextButtonClick);
  prevButton && prevButton.addEventListener("click", onPrevButtonClick);

  const homeButton = document.getElementById("HomeBut");
  homeButton && homeButton.addEventListener("click", resetCameraPositionToHome);

  //*****----------------------------------------------- ANIMATE IMAGE WINDOW ----------------------------------------------*****//
  function showLocationPanelForEntity(entity) {
    const panel = document.getElementById("locationPanel");
    const img = document.getElementById("locationPanelImage");

    if (!panel || !img) return;

    const src = getImageForEntity(entity);
    if (!src) return;

    // If already visible, animate out first
    if (locationPanelVisible) {
      panel.classList.remove("show");

      setTimeout(() => {
        img.src = src;
        panel.classList.add("show");
      }, 450);
    } else {
      img.src = src;
      panel.classList.add("show");
      locationPanelVisible = true;
    }
  }

  // Hide image location window
  function hideLocationPanel() {
  const panel = document.getElementById("locationPanel");
  if (!panel) return;

  panel.classList.remove("show");
  locationPanelVisible = false;
}

// Hide description
function hideDescriptionPanel() {
  const description = document.getElementById("description");
  if (!description) return;

  description.textContent = "";      // clear content
  description.style.display = "none";
}


  //*****----------------------------------------------- HIGHLIGHTS & RINGS ----------------------------------------------*****//
  function applyBuildingOverlayVisibility() {
    Object.keys(buildingTargets).forEach((buildingId) => {
      const enabled =
        buildingOverlaysEnabled && buildingOverlayState[buildingId];

      // Targets
      const target = buildingTargets[buildingId];
      if (target) {
        target.show = enabled;
      }

      // Highlights (mapped by index order)
      const index = ["B1", "B2", "B3", "B4", "B5"].indexOf(buildingId);
      if (targetHighlights[index]) {
        targetHighlights[index].show = enabled;
      }
    });
  }

  const highlights = buildingHighlight(viewer, store);
  targetHighlights = [highlights.h1, highlights.h2, highlights.h3, highlights.h4, highlights.h5];

  distanceRings = addRings(viewer, store);
  setupOverlayToggles(distanceRings);

  function applyDistanceOverlayVisibility() {
  distanceRings.forEach((ring) => {
    ring.show = distanceOverlaysEnabled;
  });
}

const distanceToggle = document.getElementById("distanceRings");

if (distanceToggle) {
  distanceToggle.checked = distanceOverlaysEnabled;

  distanceToggle.addEventListener("change", (e) => {
    distanceOverlaysEnabled = e.target.checked;
    applyDistanceOverlayVisibility();
  });
}

  //*****----------------------------------------------- BUILDING TARGETS ----------------------------------------------*****//
  buildingTargets = setupTargets(viewer, Cesium);

  //*****----------------------------------------------- BUILDING TOGGLES ----------------------------------------------*****//
    setupBuildingToggles({
      targetHighlights,
      distanceRings,
      buildingTargets,
      updateRingPositions,
      Cesium,
      setActiveBuilding: (buildingId) => {
        activeBuilding = buildingId;
        currentTarget = buildingTargets[buildingId];
        currentIndex = 0;

        // Remember state
        buildingOverlayState[buildingId] = true;

        applyBuildingOverlayVisibility();

        //updateRingPositions(currentTarget, distanceRings, Cesium);

        // Fly to first CZML location of this building
        const range = buildingIndexRanges[activeBuilding];
        const firstEntity = entities[range.start];
        if (!firstEntity) return;

        viewer.selectedEntity = firstEntity;
        updateDescription(firstEntity);

        // Show image of first .czml entity
        showLocationPanelForEntity(firstEntity);

        const pos = firstEntity.position?.getValue(Cesium.JulianDate.now());
        if (!pos || !currentTarget) return;

        flyToTarget(pos, currentTarget);
      }
  });

    // Master building overlay switch
    const buildingOverlaysToggle =
    document.getElementById("buildingOverlays");

  if (buildingOverlaysToggle) {
    buildingOverlaysToggle.checked = buildingOverlaysEnabled;

    buildingOverlaysToggle.addEventListener("change", (e) => {
      buildingOverlaysEnabled = e.target.checked;
      applyBuildingOverlayVisibility();
    });
  }


resetCameraPositionToHome();

//*****------------------------------------------------ INFO WINDOW ----------------------------------------------*****//
function setupStartupModal() {
  const overlay = document.getElementById("startupOverlay");
  const closeBtn = document.getElementById("startupClose");
  const infoBtn = document.getElementById("info");

  if (!overlay || !closeBtn || !infoBtn) {
    console.warn("Modal or info button missing");
    return;
  }

  function closeModal() {
    overlay.classList.add("hidden");
  }

  function openModal() {
    overlay.classList.remove("hidden");
  }

  closeBtn.addEventListener("click", closeModal);
  infoBtn.addEventListener("click", openModal);

  // show on startup
  openModal();
}

// ✅ CALL IT DIRECTLY
setupStartupModal();

//*****------------------------------------------------ SETUP COMPASS ----------------------------------------------*****//
  setupCompass(viewer);



  //*****--------------------------------------------- CAMERA COORDS LOGGING (COMMENTED OUT) --------------------------------------------*****//
  // // Console log out camera coordinates as well as HeadingPitchRoll in radians
  // viewer.scene.postUpdate.addEventListener(function() {
  //   var camera = viewer.scene.camera;
  //   var headingPitchRoll = new Cesium.HeadingPitchRoll(camera.heading, camera.pitch, camera.roll);
  //   var ellipsoid = viewer.scene.globe.ellipsoid;
  //   var cartesian = camera.positionWC;
  //   var cartographic = ellipsoid.cartesianToCartographic(cartesian);
  //   var longitude = Cesium.Math.toDegrees(cartographic.longitude);
  //   var latitude = Cesium.Math.toDegrees(cartographic.latitude);
  //   console.log("Longitude: " + longitude + ", Latitude: " + latitude);
  //   console.log(headingPitchRoll);
  // });

}

main();
