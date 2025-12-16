export function setupBuildingToggles(Cesium, viewer, buildingTargets, distanceRings, updateRingPositions, highlights) {
    let activeBuilding = null;
    let currentTarget = null;
    let currentIndex = 0;


    const toggle1 = document.getElementById("buildingState1");
    const toggle2 = document.getElementById("buildingState2");
    const toggle3 = document.getElementById("buildingState3");
    const toggle4 = document.getElementById("buildingState4");


    function activate(index, key, highlightKey) {
    activeBuilding = key;
    currentTarget = buildingTargets[key];
    currentIndex = index;


    highlights.h1.show = highlightKey === 1;
    highlights.h2.show = highlightKey === 2;
    highlights.h3.show = highlightKey === 3;
    highlights.h4.show = highlightKey === 4;


    toggle1.checked = highlightKey === 1;
    toggle2.checked = highlightKey === 2;
    toggle3.checked = highlightKey === 3;
    toggle4.checked = highlightKey === 4;


    updateRingPositions(currentTarget, distanceRings, Cesium);
    }


    toggle1.addEventListener("change", () => { if (toggle1.checked) activate(0, "B1", 1); });
    toggle2.addEventListener("change", () => { if (toggle2.checked) activate(1, "B2", 2); });
    toggle3.addEventListener("change", () => { if (toggle3.checked) activate(2, "B3", 3); });
    toggle4.addEventListener("change", () => { if (toggle4.checked) activate(3, "B4", 4); });


    return { get activeBuilding() { return activeBuilding; }, get currentTarget() { return currentTarget; } };
}