export function setupCompass(viewer) {
    const compassNeedle = document.getElementById('compassNeedle');
    let lastRotation = 0;

    viewer.scene.postRender.addEventListener(() => {
        const heading = Cesium.Math.toDegrees(viewer.camera.heading);
        const targetRotation = -heading;   // rotate opposite direction

        // Smooth interpolation
        let delta = targetRotation - lastRotation;
        delta = ((delta + 180) % 360) - 180;

        lastRotation += delta * 0.2;

        compassNeedle.style.transform = `rotate(${lastRotation}deg)`;
    });
}