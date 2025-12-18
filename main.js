// Grant CesiumJS access to your ion assets
Cesium.Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4Zjk5N2RlYS0zMGY2LTQxNWQtYjAwMy1iYWUyODI4ODY5YTUiLCJpZCI6MTE3OTUzLCJpYXQiOjE2NzA3Mzk4MTl9.k3I9be0G6cm7S9-U3lYsvSaUZ6mKVf0Capzojy3RZAU";

Cesium.GoogleMaps.defaultApiKey =
 "AIzaSyA1au3L6n6ZZvFqojyNMfB27DiGHLAX7h8"; // Google Photorealistic

import { loadCZML, loadLabelsCZML } from "./data.js";
import { buildingHighlight, addRings, updateRingPositions, setupOverlayToggles } from "./overlays.js";
import { setupTargets } from "./targets.js";
import { setupBuildingToggles } from "./toggles.js";
import { setupCamera } from "./camera.js";
import { setupCompass } from "./compass.js";

async function main() {

  // ----------------- GLOBALS -----------------
  const homeLong = 138.5989411669657;
  const homeLat  = -34.9328750617752;
  const homeHeight = 1200;

  let labelsEnabled = true;
  let currentTarget = null;
  let targetHighlights = [];
  let distanceRings = [];
  let activeBuilding = "B1";
  let currentIndex = 0;
  let buildingTargets = {};
  let flyToTarget = null;
  let buildingOverlaysEnabled = true;
  let distanceOverlaysEnabled = false;
  let locationPanelVisible = false;

  let locationEntities = [];
  let labelEntities = [];

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

  const buildingOverlayState = {
    B1: true,
    B2: true,
    B3: true,
    B4: true,
    B5: true,
  };

  // ----------------- HELPER FUNCTIONS -----------------
  function applyLabelVisibility() {
    labelEntities.forEach(label => {
      label.show = labelsEnabled;
    });
  }

  // ----------------- VIEWER -----------------
  const viewer = new Cesium.Viewer("cesiumContainer", {
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

  viewer.scene.globe.enableLighting = true;
  viewer.scene.globe.show = false; //***
  viewer._cesiumWidget._creditContainer.style.display = "none";

  viewer.camera.moveEnd.addEventListener(() => {
    if (currentTarget) {
      updateRingPositions(currentTarget, distanceRings, Cesium);
    }
  });

  // GOOGLE 3D LOAD 
  try { //***
    googleTileset = await Cesium.createGooglePhotorealistic3DTileset();
    viewer.scene.primitives.add(googleTileset);
  } catch (e) {
    console.error("Google tiles failed", e);
  }

  // OSM STREET LOAD
  osmImageryLayer = viewer.imageryLayers.addImageryProvider(
    new Cesium.OpenStreetMapImageryProvider({
      url: "https://a.tile.openstreetmap.org/",
    })
  );

  osmImageryLayer.show = false;

  // OSM TILESET LOAD
  osmBuildingsTileset = await Cesium.createOsmBuildingsAsync();
  viewer.scene.primitives.add(osmBuildingsTileset);
  osmBuildingsTileset.show = false;

  // ----------------- LOAD CZML FILES -----------------
  locationEntities = await loadCZML(viewer, Cesium);
  labelEntities    = await loadLabelsCZML(viewer, Cesium);

  applyLabelVisibility();

  // ----------------- TOGGLES SETUP -----------------
  // TERRAIN TOGGLE
  const terrainToggle = document.getElementById("terrainSwitchToggle");
  terrainToggle.checked = false;

  terrainToggle.addEventListener("change", async (e) => {
    const useOSM = e.target.checked;

    osmImageryLayer.show = useOSM;
    osmBuildingsTileset.show = useOSM;
    if (googleTileset) googleTileset.show = !useOSM;

    viewer.terrainProvider = useOSM
      ? await Cesium.createWorldTerrainAsync()
      : new Cesium.EllipsoidTerrainProvider();

    viewer.scene.globe.show = useOSM;
  });

  // SL LABELS TOGGLE
  const signLocationsToggle = document.getElementById("signLocations");

  if (signLocationsToggle) {
      // default OFF
      labelsEnabled = false;
      signLocationsToggle.checked = labelsEnabled;
      applyLabelVisibility();

      // listen for toggle
      signLocationsToggle.addEventListener("change", (e) => {
        labelsEnabled = e.target.checked;
        applyLabelVisibility();

        });
  }

  // ----------------- CAMERA -----------------
  flyToTarget = setupCamera(viewer, Cesium);

  function resetCameraPositionToHome() {
    currentIndex = -1;
    hideLocationPanel();
    hideDescriptionPanel();

    const home = Cesium.Cartesian3.fromDegrees(homeLong, homeLat, homeHeight);
    flyToTarget(home, buildingTargets.HOME);
  }

  // ----------------- DESCRIPTION -----------------
  function updateDescription(entity) {
    const el = document.getElementById("description");
    if (!el) return;

    el.style.display = "block";
    el.textContent =
      entity?.description?.getValue?.() || "No description available.";
  }

  // ----------------- NAVIGATION -----------------
  function goToEntityByIndex(index) {
    const range = buildingIndexRanges[activeBuilding];
    if (!range) return;

    if (index < 0 || index > range.end - range.start) index = 0;
    currentIndex = index;

    const entity = locationEntities[range.start + currentIndex];
    if (!entity) return;

    const pos = entity.position?.getValue(Cesium.JulianDate.now());
    if (!pos || !currentTarget) return;

    viewer.selectedEntity = entity;
    updateDescription(entity);
    showLocationPanelForEntity(entity);
    flyToTarget(pos, currentTarget);
  }

  document.getElementById("RightBut")?.addEventListener("click", () => {
    goToEntityByIndex(currentIndex + 1);
  });

  document.getElementById("LeftBut")?.addEventListener("click", () => {
    goToEntityByIndex(currentIndex - 1);
  });

  document.getElementById("HomeBut")?.addEventListener("click", resetCameraPositionToHome);

  // ----------------- VDA IMAGE WINDOW -----------------
  function getImageForEntity(entity) {
    return entity?.id ? `img/${entity.id}.png` : null;
  }

  function showLocationPanelForEntity(entity) {
    const panel = document.getElementById("locationPanel");
    const img = document.getElementById("locationPanelImage");
    if (!panel || !img) return;

    const src = getImageForEntity(entity);
    if (!src) return;

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

  function hideLocationPanel() {
    document.getElementById("locationPanel")?.classList.remove("show");
    locationPanelVisible = false;
  }

  function hideDescriptionPanel() {
    const el = document.getElementById("description");
    if (el) {
      el.textContent = "";
      el.style.display = "none";
    }
  }

  // ----------------- SIGNS IMAGE WINDOW -----------------
  function getLabelImage(entity) {
    return entity?.id ? `img/${entity.id}.png` : null;
  }

  function showLabelPanel(entity) {
    const panel   = document.getElementById("labelInfoPanel");
    const content = document.getElementById("labelInfoContent");

    if (!panel || !content) return;

    // Get CZML description (HTML string)
    const html =
      entity?.description?.getValue?.(Cesium.JulianDate.now()) ||
      "<p>No information available.</p>";

    // IMPORTANT: render as HTML
    content.innerHTML = html;

    panel.classList.add("show");
  }

  function hideLabelPanel() {
    document.getElementById("labelInfoPanel")?.classList.remove("show");
  }

  labelEntities.forEach(label => {
    // Make labels clickable
    label.label && (label.label.disableDepthTestDistance = Number.POSITIVE_INFINITY);

    label.clicked = false;

    label.description = label.description || new Cesium.ConstantProperty("");

    label.billboard && (label.billboard.disableDepthTestDistance = Number.POSITIVE_INFINITY);
  });

  viewer.selectedEntityChanged.addEventListener(entity => {
    if (!entity) {
      hideLabelPanel();
      return;
    }

    // Only respond to SLdata.czml labels
    if (labelEntities.includes(entity)) {
      showLabelPanel(entity);
      return;
    }

    hideLabelPanel();
  });

  window.addEventListener("keydown", e => {
    if (e.key === "Escape") hideLabelPanel();
  });

  // ----------------- OVERLAYS LOGIC -----------------
  // DISTANCE RINGS
  const highlights = buildingHighlight(viewer, store);
  targetHighlights = [highlights.h1, highlights.h2, highlights.h3, highlights.h4, highlights.h5];

  distanceRings = addRings(viewer, store);
  setupOverlayToggles(distanceRings);

  function applyBuildingOverlayVisibility() {
    Object.keys(buildingTargets).forEach((id) => {
      const enabled = buildingOverlaysEnabled && buildingOverlayState[id];
      buildingTargets[id] && (buildingTargets[id].show = enabled);
      const i = ["B1","B2","B3","B4","B5"].indexOf(id);
      targetHighlights[i] && (targetHighlights[i].show = enabled);
    });
  }

  function applyDistanceOverlayVisibility() {
    distanceRings.forEach(r => r.show = distanceOverlaysEnabled);
  }

  document.getElementById("distanceRings")?.addEventListener("change", e => {
    distanceOverlaysEnabled = e.target.checked;
    applyDistanceOverlayVisibility();
  });

  // BUILDINGS
  buildingTargets = setupTargets(viewer, Cesium);

  setupBuildingToggles({
    targetHighlights,
    distanceRings,
    buildingTargets,
    updateRingPositions,
    Cesium,
    setActiveBuilding: (id) => {
      activeBuilding = id;
      currentTarget = buildingTargets[id];
      currentIndex = 0;

      applyBuildingOverlayVisibility();

      const range = buildingIndexRanges[id];
      const entity = locationEntities[range.start];
      if (!entity) return;

      viewer.selectedEntity = entity;
      updateDescription(entity);
      showLocationPanelForEntity(entity);

      const pos = entity.position?.getValue(Cesium.JulianDate.now());
      if (pos) flyToTarget(pos, currentTarget);
    }
  });

  document.getElementById("buildingOverlays")?.addEventListener("change", e => {
    buildingOverlaysEnabled = e.target.checked;
    applyBuildingOverlayVisibility();
  });

  // ----------------- STARTUP -----------------
  resetCameraPositionToHome();
  setupCompass(viewer);

  function setupStartupModal() {
    const overlay = document.getElementById("startupOverlay");
    const closeBtn = document.getElementById("startupClose");
    const infoBtn = document.getElementById("info");
    if (!overlay || !closeBtn || !infoBtn) return;

    closeBtn.onclick = () => overlay.classList.add("hidden");
    infoBtn.onclick = () => overlay.classList.remove("hidden");
    overlay.classList.remove("hidden");
  }

  setupStartupModal();

  //***** CAMERA COORDS LOGGING (COMMENTED OUT) *****//
  // viewer.scene.postUpdate.addEventListener(function() {
  //   var camera = viewer.scene.camera;
  //   var hpr = new Cesium.HeadingPitchRoll(camera.heading, camera.pitch, camera.roll);
  //   var ellipsoid = viewer.scene.globe.ellipsoid;
  //   var cartographic = ellipsoid.cartesianToCartographic(camera.positionWC);
  //   console.log(
  //     "Lon:", Cesium.Math.toDegrees(cartographic.longitude),
  //     "Lat:", Cesium.Math.toDegrees(cartographic.latitude)
  //   );
  //   console.log(hpr);
  // });

}

main();
