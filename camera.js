export function setupCamera(viewer, Cesium) {
  return function flyToLocationFacingTarget(destination, targetEntity) {
    if (!destination || !targetEntity) return;

    const time = Cesium.JulianDate.now();
    const targetPos = targetEntity.position.getValue(time);
    if (!targetPos) return;

    // Direction: camera destination → target
    const direction = Cesium.Cartesian3.subtract(
      targetPos,
      destination,
      new Cesium.Cartesian3()
    );

    // Convert direction into destination-local ENU frame
    const transform = Cesium.Transforms.eastNorthUpToFixedFrame(destination);
    const inverseTransform = Cesium.Matrix4.inverse(
      transform,
      new Cesium.Matrix4()
    );

    const localDir = Cesium.Matrix4.multiplyByPointAsVector(
      inverseTransform,
      direction,
      new Cesium.Cartesian3()
    );

    // Heading & pitch (Cesium ENU conventions)
    const heading = Math.atan2(localDir.x, localDir.y);
    const pitch = Math.atan2(
      localDir.z,
      Math.sqrt(localDir.x * localDir.x + localDir.y * localDir.y)
    );

    viewer.camera.flyTo({
      destination,
      orientation: {
        heading,
        pitch,
        roll: 0
      },
      duration: 3.0
    });
  };
}


// export function setupCamera(viewer, Cesium) {
//   return function flyToTarget(targetPosition, targetEntity) {
//     if (!targetPosition || !targetEntity) return;

//     const targetPos = targetEntity.position.getValue(Cesium.JulianDate.now());
//     if (!targetPos) return;

//     // Camera offset from target (meters)
//     const range = 700;
//     const pitch = Cesium.Math.toRadians(-45);
//     const heading = 0; // relative, Cesium handles orientation

//     const offset = new Cesium.HeadingPitchRange(
//       heading,
//       pitch,
//       range
//     );

//     viewer.camera.flyToBoundingSphere(
//       new Cesium.BoundingSphere(targetPos, 10),
//       {
//         offset,
//         duration: 3.0
//       }
//     );
//   };
// }


// export function setupCamera(viewer, Cesium) {
//   return function flyToTarget(destination, target) {
//     viewer.camera.flyTo({
//       destination: destination,
//       orientation: {
//         heading: 0,
//         pitch: Cesium.Math.toRadians(-45),
//         roll: 0
//       },
//       // Make the camera look at the target sphere
//       complete: () => {
//         if (target) {
//           const targetPos = target.position.getValue(Cesium.JulianDate.now());
//           viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
//         }
//       },
//       duration: 3.0
//     });
//   };
// }