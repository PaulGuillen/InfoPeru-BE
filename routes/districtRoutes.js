import DistrictController from "../controllers/districtController.js";

export default (app) => {
  app.post("/districts/emergencies/upload-structured", DistrictController.uploadEmergenciesStructured);
  app.get("/districts/emergencies/local_emergency/all", DistrictController.getAllSerenazgoData);

};