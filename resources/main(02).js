// Grant CesiumJS access to your ion assets
Cesium.Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4Zjk5N2RlYS0zMGY2LTQxNWQtYjAwMy1iYWUyODI4ODY5YTUiLCJpZCI6MTE3OTUzLCJpYXQiOjE2NzA3Mzk4MTl9.k3I9be0G6cm7S9-U3lYsvSaUZ6mKVf0Capzojy3RZAU";
// Cesium.GoogleMaps.defaultApiKey =
//  "AIzaSyA1au3L6n6ZZvFqojyNMfB27DiGHLAX7h8";                                                //******* Turn on/off during testing *******//


//*****--------------------------------------------- WORLD SETUP --------------------------------------------*****//
 
async function main() {

  // Global variables
  let currentTarget = null;
  let targetHighlight1;
  let targetHighlight2;
  let targetHighlight3;
  let targetHighlight4;
  let distanceRings = [];
  const homeLong = -34.9328750617752;
  const homeLat = 138.5989411669657;
  const homeHeight = 1200;
  const homeHeading = 6.245549806822441;
  const homePitch = -0.7858781375691546;
  const homeRoll = 0.000015408415914741624;
  const buildingCoords = Cesium.Cartesian3.fromDegrees(138.60470889239932, -34.919575053963584);   
  let currentIndex = 0;


  // --- CREATE WORLD --- //

  const viewer = new Cesium.Viewer("cesiumContainer", {
    //terrain: Cesium.Terrain.fromWorldTerrain(),                                          //******* Turn on/off during testing *******//
    //imageryProvider: new Cesium.IonImageryProvider({ assetId: 3954 }),
    timeline: false,
    animation: false,
    infoBox: false,
    geocoder: false,
    navigationHelpButton: false,
    baseLayerPicker: false,
    searchButton: false,
    homeButton: false,
    selectionIndicator: false,
    sceneModePicker: false,
    baseLayerPicker: false
  });

  viewer.scene.globe.enableLighting = true;

  // Cesium globe true or false
  viewer.scene.globe.show = true;                                                       //******* Make True/False during testing *******//
  viewer._cesiumWidget._creditContainer.style.display = "none";

  // Add Photorealistic 3D Tiles                                                        //******* Turn on/off during testing *******//
  // try {
  //   const tileset = await Cesium.createGooglePhotorealistic3DTileset();
  //   viewer.scene.primitives.add(tileset);
  // } catch (error) {
  //   console.log(`Error loading Photorealistic 3D Tiles tileset.\n${error}`);
  // }

// --- IMPORT ION ASSETS --- //
 
// const SBSLogoSth = await Cesium.Cesium3DTileset.fromIonAssetId(3685832, {
//   //maximumScreenSpaceError: 4,
// });
// viewer.scene.primitives.add(SBSLogoSth);

// const SBSLogoEst = await Cesium.Cesium3DTileset.fromIonAssetId(3685825, {
//   //maximumScreenSpaceError: 4,
// });
// viewer.scene.primitives.add(SBSLogoEst);


//*****-------------------------------------------------- IMPORT .CZML FILE -------------------------------------------------*****//

  const dataSourcePromise = Cesium.CzmlDataSource.load("data.czml");
  viewer.dataSources.add(dataSourcePromise);

  // Function to extract description and update the HTML
  function updateDescription(entity) {
    const descriptionElement = document.getElementById("description");
    if (entity.description && entity.description.getValue()) {
      descriptionElement.textContent = entity.description.getValue();
    } else {
      descriptionElement.textContent = "No description available.";
    }
  }

  dataSourcePromise.then((dataSource) => {
    const entities = dataSource.entities.values;
    const numEntities = entities.length;

    // Maps which CZML index range belongs to which building
    const buildingIndexRanges = {
        B1: { start: 0, end: 3 },
        B2: { start: 4, end: 7 },
        B3: { start: 8, end: 11 },
        B4: { start: 12, end: 15 }
    };

    // Tracks the active building (default B1)
    let activeBuilding = "B1";

    // Index inside that building’s 4 camera positions
    let currentIndex = 0;

    const panel = document.getElementById("customPanel");
    const img = document.createElement("img");
    panel.appendChild(img);


  viewer.selectedEntityChanged.addEventListener(function(entity) {
    if (entity) {
      const id = entity.id;
      const imageFile = `img/${id}.png`;

      // Fade out current image
      img.style.opacity = 0;

      // Wait for fade out, then change image
      setTimeout(() => {
        img.src = imageFile;
        img.alt = id;

        // Show panel if hidden
        panel.style.display = "block";

        // When image has loaded, fade it in
        img.onload = () => {
          img.style.opacity = 1;
        };
      }, 200); // delay slightly less than fade duration
    } else {
      // Hide the panel when nothing is selected
      panel.style.display = "none";
    }
  });

//*****-------------------------------------------------- NAVIGATION -------------------------------------------------*****//
   
  // --- HOME BUTTON --- //

  const homeButton = document.getElementById("HomeBut");

  homeButton.addEventListener("click", function () {
    currentIndex = -1;
    resetCameraPositionToHome();
  });
  
// --- ON-CLICK NEXT --- //

function onNextButtonClick() {

    const range = buildingIndexRanges[activeBuilding];

    currentIndex++;
    if (currentIndex > (range.end - range.start)) {
        currentIndex = 0;
    }

    const globalIndex = range.start + currentIndex;

    const entity = entities[globalIndex];
    const positionValue = entity.position.getValue();

    viewer.selectedEntity = entity;
    updateDescription(entity);

    camFlyTo(positionValue);
}


// --- ON-CLICK PREVIOUS --- //

function onPrevButtonClick() {

    const range = buildingIndexRanges[activeBuilding];

    currentIndex--;
    if (currentIndex < 0) {
        currentIndex = range.end - range.start;
    }

    const globalIndex = range.start + currentIndex;

    const entity = entities[globalIndex];
    const positionValue = entity.position.getValue();

    viewer.selectedEntity = entity;
    updateDescription(entity);

    camFlyTo(positionValue);
}

// --- CAMERA TARGETS SETUP --- //

const targetSphere1 = viewer.entities.add({
  name: "Target sphere1",
  position: Cesium.Cartesian3.fromDegrees(138.60256787080962, -34.919220563033825, 100),
  ellipsoid: {
    radii: new Cesium.Cartesian3(10.0, 10.0, 10.0),
    material: Cesium.Color.RED.withAlpha(1.0),
  },
});

const targetSphere2 = viewer.entities.add({
  name: "Target sphere2",
  position: Cesium.Cartesian3.fromDegrees(138.6058984359953, -34.92178121685403, 100),
  ellipsoid: {
    radii: new Cesium.Cartesian3(10.0, 10.0, 10.0),
    material: Cesium.Color.RED.withAlpha(1.0),
  },
});

const targetSphere3 = viewer.entities.add({
  name: "Target sphere3",
  position: Cesium.Cartesian3.fromDegrees(138.59141406215926, -34.92161099366705, 100),  
  ellipsoid: {
    radii: new Cesium.Cartesian3(10.0, 10.0, 10.0),
    material: Cesium.Color.RED.withAlpha(1.0),
  },
});

const targetSphere4 = viewer.entities.add({
  name: "Target sphere4",
  position: Cesium.Cartesian3.fromDegrees(138.5927323195081, -34.921538826469735, 100),  
  ellipsoid: {
    radii: new Cesium.Cartesian3(10.0, 10.0, 10.0),
    material: Cesium.Color.RED.withAlpha(1.0),
  },
});

//*****-------------------------------------------------- CAMERA -------------------------------------------------*****//

// --- CAMERA HOME --- //

function resetCameraPositionToHome() {
  currentIndex = -1; 

  viewer.scene.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(
      homeLat,
      homeLong,
      homeHeight
    ),
    orientation: {
      heading: homeHeading,
      pitch: homePitch,
      roll: homeRoll,
    },
  });
}

// --- CAMERA FLY TO --- //

function camFlyTo(positionValue) {
    const time = Cesium.JulianDate.now();

    // If nothing is selected, default to B1
    if (!currentTarget) {
        currentTarget = targetSphere1;
        toggle1.checked = true;
    }

    const targetPosition = currentTarget.position.getValue(time);

    viewer.camera.flyTo({
        destination: positionValue,
        duration: 2,
        complete: function () {

            // Compute offset vector (target minus camera position)
            const offset = Cesium.Cartesian3.subtract(
                targetPosition,
                positionValue,
                new Cesium.Cartesian3()
            );

            viewer.camera.lookAt(positionValue, offset);
        }
    });
}

  //*****--------------------------------------------- TOGGLES --------------------------------------------*****// 

  // --- BUILDING TARGET TOGGLES --- //

  const toggle1 = document.getElementById("buildingState1");
  const toggle2 = document.getElementById("buildingState2");
  const toggle3 = document.getElementById("buildingState3");
  const toggle4 = document.getElementById("buildingState4");

  toggle1.addEventListener("change", () => {
    if (toggle1.checked) {
        activeBuilding = "B1";
        currentTarget = targetSphere1;
        currentIndex = 0;
        lookAtTarget(currentTarget);

        toggle2.checked = toggle3.checked = toggle4.checked = false;
    }
  });

  toggle2.addEventListener("change", () => {
      if (toggle2.checked) {
          activeBuilding = "B2";
          currentTarget = targetSphere2;
          currentIndex = 0;
          lookAtTarget(currentTarget);

          toggle1.checked = toggle3.checked = toggle4.checked = false;
      }
  });

  toggle3.addEventListener("change", () => {
      if (toggle3.checked) {
          activeBuilding = "B3";
          currentTarget = targetSphere3;
          currentIndex = 0;
          lookAtTarget(currentTarget);

          toggle1.checked = toggle2.checked = toggle4.checked = false;
      }
  });

  toggle4.addEventListener("change", () => {
      if (toggle4.checked) {
          activeBuilding = "B4";
          currentTarget = targetSphere4;
          currentIndex = 0;
          lookAtTarget(currentTarget);

          toggle1.checked = toggle2.checked = toggle3.checked = false;
      }
  });


//*****---------------------------------------------- BUILDING OVERLAYS --------------------------------------------*****//

function buildingHighlight() {

  targetHighlight1 = new Cesium.Entity({
    polygon: {
      hierarchy: Cesium.Cartesian3.fromDegreesArray(
        [
          [138.60220034305786,  -34.91930957306919],  
          [138.60284858447056, -34.919282627854756],
          [138.60284733966245, -34.91911496484108], 
          [138.6022786047345, -34.91915621241726],
        ].flat(2)
      ),
      material: Cesium.Color.ORANGE.withAlpha(0.6),
      classificationType: Cesium.ClassificationType.CESIUM_3D_TILE,
    },
    show: true,
  });
  
  targetHighlight2 = new Cesium.Entity({
    polygon: {
      hierarchy: Cesium.Cartesian3.fromDegreesArray(
        [
          [138.6056173964565,  -34.921644960219545],   
          [138.60564054937979, -34.92193314895353],
          [138.60613682134343, -34.92190446343327], 
          [138.60615316420603, -34.921631614840166],
        ].flat(2)
      ),
      material: Cesium.Color.ORANGE.withAlpha(0.6),
      classificationType: Cesium.ClassificationType.CESIUM_3D_TILE,
    },
    show: true,
  });

  targetHighlight3 = new Cesium.Entity({
    polygon: {
      hierarchy: Cesium.Cartesian3.fromDegreesArray(
        [
          [138.5908745113615,  -34.92138760540553],
          [138.5909692248759, -34.92182875212232], 
          [138.5920755926013, -34.92177284463797],
          [138.59188569341336, -34.921464091714746],
        ].flat(2)
      ),
      material: Cesium.Color.ORANGE.withAlpha(0.6),
      classificationType: Cesium.ClassificationType.CESIUM_3D_TILE,
    },
    show: true,
  });

  targetHighlight4 = new Cesium.Entity({
    polygon: {
      hierarchy: Cesium.Cartesian3.fromDegreesArray(
        [
          [138.59212331815738,  -34.921358692439505],
          [138.5921272585744, -34.921579537655106],
          [138.59265976805887, -34.92176166125003],
          [138.59319701821624, -34.921698922515624],
          [138.5932034909812, -34.92136728546277],
        ].flat(2)
      ),
      material: Cesium.Color.ORANGE.withAlpha(0.6),
      classificationType: Cesium.ClassificationType.CESIUM_3D_TILE,
    },
    show: true,
  });
  
  viewer.entities.add(targetHighlight1);
  viewer.entities.add(targetHighlight2);
  viewer.entities.add(targetHighlight3);
  viewer.entities.add(targetHighlight4);
}

buildingHighlight();

//*****-------------------------------------------------- OVERLAYS -------------------------------------------------*****//

 // --- VIEWING CORRIDORS SETUP --- //

function viewingCorridors() {

  corridorOverlay = new Cesium.Entity({
    polygon: {
      hierarchy: Cesium.Cartesian3.fromDegreesArray(
        [
          [174.82563171315928, -41.28129911760191], 
          [174.80328235915087, -41.2822772149776],
          [174.78012669033467, -41.28309221843801], 
          [174.77965908444736, -41.28297478137698], 
          [174.91408572941958, -41.256356562739974],
          [174.84804495506583, -41.127116871691626],
          [174.57968928816302, -41.20082889813626],
          [174.63855286895, -41.394258633746425],
          [174.91918912666313, -41.35863144541714],
          [174.77643276122768, -41.284103987397636], 
          [174.77555196692487, -41.28382593894997], 
          [174.7754696838526, -41.28444398370786], 
          [174.77570812610375, -41.28512374068272], 
          [174.77627001817552, -41.28653365445833], 
          [174.7756301741228, -41.285331214990265], 
          [174.7748654441672, -41.283656688926975], 
          [174.77532477038486, -41.28368143556823], 
          [174.77481085107402, -41.28363259515589], 
          [174.77435867138607, -41.28380803113742], 
          [174.77441993509618, -41.28355835769209], 
          [174.77275375538196, -41.28336463516013], 
          [174.7727437388046, -41.28325192668385], 
          [174.77445638342903, -41.283503602895685], 
          [174.77466963048792, -41.282919967392495], 
          [174.77482178318812, -41.283199874080566], 
          [174.7752909529377, -41.28337835106258], 
          [174.7754154287868, -41.283002428762096], 
          [174.7762597295253, -41.28113897458532], 
          [174.7761889905571, -41.28145005592835], 
          [174.77653610433399, -41.28193132358224], 
          [174.77595430304126, -41.28257910400037], 
          [174.77570321609895, -41.28304825139078], 
          [174.77556107442638, -41.283705425496706], 
          [174.78137236988314, -41.284984148261515], 
          [174.78118349015145, -41.283672311042906],
        ].flat(2),
      ),
      material: Cesium.Color.BLACK.withAlpha(0.8),
      classificationType: Cesium.ClassificationType.CESIUM_3D_TILE,
    },
    show: false,
  });
  
  viewer.entities.add(corridorOverlay);
}

viewingCorridors();

// --- DISTANCE RINGS SETUP --- //

function addRings() {

  distanceRings.push(viewer.entities.add({
    position: buildingCoords,
    name: "Red ellipse on surface",
    ellipse: {
      semiMinorAxis: 500.0,
      semiMajorAxis: 500.0,
      material: Cesium.Color.RED.withAlpha(0.3),
    },
    show: false,
  }));

  distanceRings.push(viewer.entities.add({
    position: buildingCoords,
    name: "Blue ellipse on surface",
    ellipse: {
      semiMinorAxis: 1000.0,
      semiMajorAxis: 1000.0,
      material: Cesium.Color.CYAN.withAlpha(0.2),
    },
    show: false,
  }));

  distanceRings.push(viewer.entities.add({
    position: buildingCoords,
    name: "Blue ellipse on surface",
    ellipse: {
      semiMinorAxis: 1500.0,
      semiMajorAxis: 1500.0,
      material: Cesium.Color.BLUE.withAlpha(0.2),
    },
    show: false,
  }));

  distanceRings.push(viewer.entities.add({
    position: buildingCoords,
    name: "Yellow ellipse on surface",
    ellipse: {
      semiMinorAxis: 2000.0,
      semiMajorAxis: 2000.0,
      material: Cesium.Color.YELLOW.withAlpha(0.2),
    },
    show: false,
  }));

  // Keylines
    distanceRings.push(viewer.entities.add({
    position: buildingCoords,
    name: "White ellipse on surface",
    ellipsoid: {
      radii: new Cesium.Cartesian3(250, 250, 250),
      innerRadii: new Cesium.Cartesian3(245, 245, 245),
      minimumCone: Cesium.Math.toRadians(50),
      maximumCone: Cesium.Math.toRadians(50.5),
      material: Cesium.Color.WHITE.withAlpha(1.0),
    },
    show: false,
  }));

    distanceRings.push(viewer.entities.add({
    position: buildingCoords,
    name: "White ring",
    ellipsoid: {
      radii: new Cesium.Cartesian3(500, 500, 500),
      innerRadii: new Cesium.Cartesian3(495, 495, 495),
      minimumCone: Cesium.Math.toRadians(71),
      maximumCone: Cesium.Math.toRadians(71.5),
      material: Cesium.Color.WHITE.withAlpha(1.0),
    },
    show: false,
  }));

    distanceRings.push(viewer.entities.add({
    position: buildingCoords,
    name: "White ring",
    ellipsoid: {
      radii: new Cesium.Cartesian3(1000, 1000, 1000),
      innerRadii: new Cesium.Cartesian3(995, 995, 995),
      minimumCone: Cesium.Math.toRadians(80),
      maximumCone: Cesium.Math.toRadians(80.5),
      material: Cesium.Color.WHITE.withAlpha(1.0),
    },
    show: false,
  }));

    distanceRings.push(viewer.entities.add({
    position: buildingCoords,
    name: "Orange ring",
    ellipsoid: {
      radii: new Cesium.Cartesian3(1500, 1500, 1500),
      innerRadii: new Cesium.Cartesian3(1495, 1495, 1495),
      minimumCone: Cesium.Math.toRadians(83),
      maximumCone: Cesium.Math.toRadians(83.5),
      material: Cesium.Color.ORANGE.withAlpha(1.0),
    },
    show: false,
  }));

    distanceRings.push(viewer.entities.add({
    position: buildingCoords,
    name: "White ring",
    ellipsoid: {
      radii: new Cesium.Cartesian3(2000, 2000, 2000),
      innerRadii: new Cesium.Cartesian3(1995, 1995, 1995),
      minimumCone: Cesium.Math.toRadians(85),
      maximumCone: Cesium.Math.toRadians(85.5),
      material: Cesium.Color.WHITE.withAlpha(1.0),
    },
    show: false,
  }));

    distanceRings.push(viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(174.77370295558623, -41.28548731902956, 200),
    label: {
      text: "250m",
      font: "24px Helvetica",
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    },
    show: false,
  }));

    distanceRings.push(viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(174.7725329813511, -41.28765450154714, 200),
    label: {
      text: "500m",
      font: "24px Helvetica",
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    },
    show: false,
  }));

      distanceRings.push(viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(174.7703332149817, -41.29184763322165, 200),
    label: {
      text: "1km",
      font: "24px Helvetica",
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    },
    show: false,
  }));

    distanceRings.push(viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(174.7681469479569, -41.296104013193684, 200),
    label: {
      text: "1.5km",
      font: "24px Helvetica",
      fillColor: Cesium.Color.ORANGE,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    },
    show: false,
  }));

    distanceRings.push(viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(174.7659872330026, -41.30016817626843, 200),
    label: {
      text: "2km",
      font: "24px Helvetica",
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    },
    show: false,
  }));

}

addRings();

  // --- BUILDING OVERLAY TOGGLE --- //

  // const buildingObverlayToggle = document.getElementById('buildingOverlay');
  // buildingObverlayToggle.addEventListener('change', function () {
  //   if (targetHighlight1) {
  //     targetHighlight1.show = buildingObverlayToggle.checked;
  //     console.log(buildingObverlayToggle.checked ? 'Overlay ON' : 'Overlay OFF');
  //   }
  //   if (targetHighlight2) {
  //     targetHighlight2.show = buildingObverlayToggle.checked;
  //     console.log(buildingObverlayToggle.checked ? 'Overlay ON' : 'Overlay OFF');
  //   }
  //   if (targetHighlight3) {
  //     targetHighlight3.show = buildingObverlayToggle.checked;
  //     console.log(buildingObverlayToggle.checked ? 'Overlay ON' : 'Overlay OFF');
  //   }
  //   if (targetHighlight4) {
  //     targetHighlight4.show = buildingObverlayToggle.checked;
  //     console.log(buildingObverlayToggle.checked ? 'Overlay ON' : 'Overlay OFF');
  //   }
  // });

// --- VIEWING CORRIDOR TOGGLE --- //

const viewingCorridorsToggle = document.getElementById('viewingCorridors');
viewingCorridorsToggle.addEventListener('change', function () {
  if (corridorOverlay) {
    corridorOverlay.show = viewingCorridorsToggle.checked;
    console.log(viewingCorridorsToggle.checked ? 'Overlay ON' : 'Overlay OFF');
  }
});

// --- DISTANCE RINGS TOGGLE --- //

const ringsToggle = document.getElementById('distanceRings');
ringsToggle.addEventListener('change', function () {
  const visible = ringsToggle.checked;
  distanceRings.forEach(entity => {
    entity.show = visible;
  });
  console.log(`Distance Rings ${visible ? 'ON' : 'OFF'}`);
});

//*****--------------------------------------------- COMPASS --------------------------------------------*****// 

const compassNeedle = document.getElementById('compassNeedle');
let lastRotation = 0;

viewer.scene.postRender.addEventListener(() => {
  // Get current heading in degrees and convert to a compass rotation
  const heading = Cesium.Math.toDegrees(viewer.camera.heading);
  const targetRotation = -heading; // Negative to rotate compass in opposite direction

  // Normalize angles to range (-180, 180] to find shortest path
  let delta = targetRotation - lastRotation;
  delta = ((delta + 180) % 360) - 180;

  // Interpolate rotation (adjust 0.2 for smoothing)
  lastRotation += delta * 0.2;

  // Apply rotation to compass
  compassNeedle.style.transform = `rotate(${lastRotation}deg)`;
});

resetCameraPositionToHome();

//*****--------------------------------------------- Camera location data --------------------------------------------*****// 

//   // Console log out cameras coordinates as well as HeadingPitchRoll in radians
//   viewer.scene.postUpdate.addEventListener(function() {
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

