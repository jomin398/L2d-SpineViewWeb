const setups = {
    tempChrModelData: [
        {
            name: "arona",
            url: "./asset/arona/arona_workpage.json",
            metadata: {
                spineAtlasSuffix: ".atlas"
            }
        }
    ]
}
var l2dSpine = null;
window.onload = () => {
   l2dSpine = new l2dSpineModule();
   l2dSpine.init();
};