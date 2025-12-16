

export function buildingHighlight(viewer, store) {
    const { Cesium } = store;

    const h1 = new Cesium.Entity({
        polygon: {
            hierarchy: Cesium.Cartesian3.fromDegreesArray([
                138.60220034305786, -34.91930957306919,
                138.60284858447056, -34.919282627854756,
                138.60284733966245, -34.91911496484108,
                138.6022786047345,  -34.91915621241726,
            ]),
            material: Cesium.Color.ORANGE.withAlpha(0.6),
            classificationType: Cesium.ClassificationType.CESIUM_3D_TILE,
        },
        show: true,
    });

    const h2 = new Cesium.Entity({
        polygon: {
            hierarchy: Cesium.Cartesian3.fromDegreesArray([
                138.6056173964565,  -34.921644960219545,
                138.60563171100043, -34.921970319198564,
                138.60617351722186, -34.921942828816846, 
                138.60615316420603, -34.921631614840166,
            ]),
            material: Cesium.Color.ORANGE.withAlpha(0.6),
            classificationType: Cesium.ClassificationType.CESIUM_3D_TILE,
        },
        show: true,
    });

    const h3 = new Cesium.Entity({
        polygon: {
            hierarchy: Cesium.Cartesian3.fromDegreesArray([
                138.5908745113615,  -34.92138760540553,
                138.5909692248759,  -34.92182875212232,
                138.5920755926013,  -34.92177284463797,
                138.59188569341336, -34.921464091714746,
            ]),
            material: Cesium.Color.ORANGE.withAlpha(0.6),
            classificationType: Cesium.ClassificationType.CESIUM_3D_TILE,
        },
        show: true,
    });

    const h4 = new Cesium.Entity({
        polygon: {
            hierarchy: Cesium.Cartesian3.fromDegreesArray([
                138.59212331815738, -34.921358692439505,
                138.5921272585744,  -34.921579537655106,
                138.59265976805887, -34.92176166125003,
                138.59319701821624, -34.921698922515624,
                138.5932034909812,  -34.92136728546277,
            ]),
            material: Cesium.Color.ORANGE.withAlpha(0.6),
            classificationType: Cesium.ClassificationType.CESIUM_3D_TILE,
        },
        show: true,
    });

    const h5 = new Cesium.Entity({
        polygon: {
            hierarchy: Cesium.Cartesian3.fromDegreesArray([
                138.5903889459372, -34.923502858481605, 
                138.59043512381984,  -34.92411722929183,
                138.59098031461255, -34.92408808260422, 
                138.59084364470772, -34.92346584183616,
            ]),
            material: Cesium.Color.ORANGE.withAlpha(0.6),
            classificationType: Cesium.ClassificationType.CESIUM_3D_TILE,
        },
        show: true,
    });


    viewer.entities.add(h1);
    viewer.entities.add(h2);
    viewer.entities.add(h3);
    viewer.entities.add(h4);
    viewer.entities.add(h5);

    return { h1, h2, h3, h4, h5 };
}


export function addRings(viewer, store) {
    const { Cesium } = store;
    const rings = [];

    function addRing(entity) {
        rings.push(viewer.entities.add(entity));
    }

    // --- Add all rings here (unchanged) ---
    addRing({
        position: Cesium.Cartesian3.fromDegrees(0, 0, 0),
        ellipse: { semiMinorAxis: 500, semiMajorAxis: 500, material: Cesium.Color.ORANGE.withAlpha(0.35) },
        show: false
    });

    addRing({
        position: Cesium.Cartesian3.fromDegrees(0, 0, 0),
        ellipse: { semiMinorAxis: 1000, semiMajorAxis: 1000, material: Cesium.Color.ORANGE.withAlpha(0.25) },
        show: false
    });

    addRing({
        position: Cesium.Cartesian3.fromDegrees(0, 0, 0),
        ellipse: { semiMinorAxis: 1500, semiMajorAxis: 1500, material: Cesium.Color.ORANGE.withAlpha(0.15) },
        show: false
    });

    addRing({
        position: Cesium.Cartesian3.fromDegrees(0, 0, 0),
        ellipse: { semiMinorAxis: 2000, semiMajorAxis: 2000, material: Cesium.Color.WHITE.withAlpha(0.25) },
        show: false
    });

    addRing({
        position: Cesium.Cartesian3.fromDegrees(0, 0, 0),
        ellipse: { semiMinorAxis: 5000, semiMajorAxis: 5000, material: Cesium.Color.WHITE.withAlpha(0.20) },
        show: false
    });

    addRing({
    position: Cesium.Cartesian3.fromDegrees(0, 0, 0),
    ellipsoid: {
      radii: new Cesium.Cartesian3(250, 250, 250),
      innerRadii: new Cesium.Cartesian3(245, 245, 245),
      minimumCone: Cesium.Math.toRadians(50),
      maximumCone: Cesium.Math.toRadians(50.5),
      material: Cesium.Color.WHITE.withAlpha(1.0),
    },
    show: false,
    });

    addRing({
    position: Cesium.Cartesian3.fromDegrees(0, 0, 0),
    ellipsoid: {
      radii: new Cesium.Cartesian3(500, 500, 500),
      innerRadii: new Cesium.Cartesian3(495, 495, 495),
      minimumCone: Cesium.Math.toRadians(71),
      maximumCone: Cesium.Math.toRadians(71.5),
      material: Cesium.Color.WHITE.withAlpha(1.0),
    },
    show: false,
    });   
    
    addRing({
    position: Cesium.Cartesian3.fromDegrees(0, 0, 0),
    ellipsoid: {
      radii: new Cesium.Cartesian3(1000, 1000, 1000),
      innerRadii: new Cesium.Cartesian3(995, 995, 995),
      minimumCone: Cesium.Math.toRadians(80),
      maximumCone: Cesium.Math.toRadians(80.5),
      material: Cesium.Color.WHITE.withAlpha(1.0),
    },
    show: false,
    });    

    addRing({
    position: Cesium.Cartesian3.fromDegrees(0, 0, 0),
    ellipsoid: {
      radii: new Cesium.Cartesian3(1500, 1500, 1500),
      innerRadii: new Cesium.Cartesian3(1495, 1495, 1495),
      minimumCone: Cesium.Math.toRadians(83),
      maximumCone: Cesium.Math.toRadians(83.5),
      material: Cesium.Color.ORANGE.withAlpha(1.0),
    },
    show: false,
    });   

    addRing({
    position: Cesium.Cartesian3.fromDegrees(0, 0, 0),
    ellipsoid: {
      radii: new Cesium.Cartesian3(1500, 1500, 1500),
      innerRadii: new Cesium.Cartesian3(1495, 1495, 1495),
      minimumCone: Cesium.Math.toRadians(83),
      maximumCone: Cesium.Math.toRadians(83.5),
      material: Cesium.Color.ORANGE.withAlpha(1.0),
    },
    show: false,
    }); 

    addRing({
    position: Cesium.Cartesian3.fromDegrees(0, 0, 0),
    ellipsoid: {
      radii: new Cesium.Cartesian3(2000, 2000, 2000),
      innerRadii: new Cesium.Cartesian3(1995, 1995, 1995),
      minimumCone: Cesium.Math.toRadians(85),
      maximumCone: Cesium.Math.toRadians(85.5),
      material: Cesium.Color.WHITE.withAlpha(1.0),
    },
    show: false,
    }); 

    addRing({
      position: Cesium.Cartesian3.fromDegrees(0, 0, 0),
      ellipsoid: {
      radii: new Cesium.Cartesian3(5000, 5000, 5000),
      innerRadii: new Cesium.Cartesian3(4995, 4995, 4995),
      minimumCone: Cesium.Math.toRadians(88),
      maximumCone: Cesium.Math.toRadians(88.5),
      material: Cesium.Color.WHITE.withAlpha(1.0),
    },
    show: false,
    }); 

    function addLabel(text, radius) {
        const label = viewer.entities.add({
            position: Cesium.Cartesian3.ZERO,
            label: {
            text,
            font: "24px Helvetica",
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            pixelOffset: new Cesium.Cartesian2(0, -10)
            },
            show: false
        });

        // 🔑 Tag radius so updateRingPositions can offset it
        label._ringRadius = radius;

        rings.push(label);
        }

    addLabel("250m", 250);
    addLabel("500m", 500);
    addLabel("1km", 1000);
    addLabel("1.5km", 1500);
    addLabel("2km", 2000);
    addLabel("5km", 5000);

    return rings;
}

export function updateRingPositions(target, rings, Cesium) {
  if (!target) return;

  const center = target.position.getValue(Cesium.JulianDate.now());
  if (!center) return;

  const cartoCenter = Cesium.Cartographic.fromCartesian(center);

  rings.forEach((entity) => {
    // --- Normal rings ---
    if (entity.ellipse || entity.ellipsoid) {
      entity.position = center;
      return;
    }

    // --- Labels ---
    if (entity.label && entity._ringRadius) {
      // Fixed bearing (east)
      const bearing = Cesium.Math.toRadians(90);

      const offsetCarto = new Cesium.Cartographic(
        cartoCenter.longitude +
          (entity._ringRadius / Cesium.Ellipsoid.WGS84.maximumRadius) *
            Math.cos(bearing),
        cartoCenter.latitude +
          (entity._ringRadius / Cesium.Ellipsoid.WGS84.maximumRadius) *
            Math.sin(bearing),
        cartoCenter.height
      );

      entity.position = Cesium.Cartesian3.fromRadians(
        offsetCarto.longitude,
        offsetCarto.latitude,
        offsetCarto.height + 200
      );
    }
  });
}

export function setupOverlayToggles(rings, corridorOverlay) {
    const ringsToggle = document.getElementById("distanceRings");
    ringsToggle.addEventListener("change", () => {
        const visible = ringsToggle.checked;
        rings.forEach(r => r.show = visible);
    });
}

