export function setupTargets(viewer, Cesium) {
    // --- TARGET SPHERES ---

    const targetSphere1 = viewer.entities.add({
        name: "Target sphere1",
        position: Cesium.Cartesian3.fromDegrees(
            138.60256787080962,
            -34.919220563033825,
            50
        ),
        ellipsoid: {
            radii: new Cesium.Cartesian3(10, 10, 10),
            material: Cesium.Color.RED.withAlpha(0.0),
        },
    });

    const targetSphere2 = viewer.entities.add({
        name: "Target sphere2",
        position: Cesium.Cartesian3.fromDegrees(
            138.6058984359953,
            -34.92178121685403,
            50
        ),
        ellipsoid: {
            radii: new Cesium.Cartesian3(10, 10, 10),
            material: Cesium.Color.RED.withAlpha(0.0),
        },
    });

    const targetSphere3 = viewer.entities.add({
        name: "Target sphere3",
        position: Cesium.Cartesian3.fromDegrees(
            138.59141406215926,
            -34.92161099366705,
            50
        ),
        ellipsoid: {
            radii: new Cesium.Cartesian3(10, 10, 10),
            material: Cesium.Color.RED.withAlpha(0.0),
        },
    });

    const targetSphere4 = viewer.entities.add({
        name: "Target sphere4",
        position: Cesium.Cartesian3.fromDegrees(
            138.5927323195081,
            -34.921538826469735,
            50
        ),
        ellipsoid: {
            radii: new Cesium.Cartesian3(10, 10, 10),
            material: Cesium.Color.RED.withAlpha(0.0),
        },
    });

    const targetSphere5 = viewer.entities.add({
        name: "Target sphere5",
        position: Cesium.Cartesian3.fromDegrees(
            138.59064511672662,
            -34.92379219880367,
            50
        ),
        ellipsoid: {
            radii: new Cesium.Cartesian3(10, 10, 10),
            material: Cesium.Color.RED.withAlpha(0.0),
        },
    });    

    const targetSphereHome = viewer.entities.add({ 
        name: "Target sphere home", 
        position: Cesium.Cartesian3.fromDegrees(
            138.59765833772423,
            -34.9230473015107,
            100
        ),
        ellipsoid: {
            radii: new Cesium.Cartesian3(10, 10, 10),
            material: Cesium.Color.RED.withAlpha(0.0),
        },
    });


    // Return a lookup map
    return {
        B1: targetSphere1,
        B2: targetSphere2,
        B3: targetSphere3,
        B4: targetSphere4,
        B5: targetSphere5,
        HOME: targetSphereHome
    };
}
