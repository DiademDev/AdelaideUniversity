export function setupBuildingToggles(options) {
  const {
    targetHighlights = [],
    distanceRings = [],
    buildingTargets = {},
    updateRingPositions,
    Cesium,
    setActiveBuilding
  } = options;

  const toggleIds = ["buildingState1", "buildingState2", "buildingState3", "buildingState4", "buildingState5"];
  const buildingIds = ["B1", "B2", "B3", "B4", "B5"];

  toggleIds.forEach((toggleId, index) => {
    const toggle = document.getElementById(toggleId);
    if (!toggle) return;

    toggle.addEventListener("change", () => {
      if (!toggle.checked) return;

      const buildingId = buildingIds[index];
      setActiveBuilding(buildingId);

      // Show only the corresponding highlight
      targetHighlights.forEach((h, i) => {
        if (h && h.show !== undefined) {
          h.show = i === index;
        }
      });

      // Uncheck other toggles
      toggleIds.forEach((otherId, i) => {
        if (i !== index) {
          const otherToggle = document.getElementById(otherId);
          if (otherToggle) otherToggle.checked = false;
        }
      });

      // Update distance rings safely
      const targetSphere = buildingTargets[buildingId];
      if (targetSphere) {
        updateRingPositions(targetSphere, distanceRings, Cesium);
      }
    });
  });
}
