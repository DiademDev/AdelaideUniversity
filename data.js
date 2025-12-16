export async function loadCZML(viewer, Cesium) {
    const dataSourcePromise = Cesium.CzmlDataSource.load("data.czml");
    const ds = await viewer.dataSources.add(dataSourcePromise);
    return ds.entities.values;
}