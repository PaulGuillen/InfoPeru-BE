import DistrictController from "../controllers/districtController.js";

export default (app) => {
  app.post(
    "/districts/emergencies/upload-structured",
    DistrictController.uploadEmergenciesStructured
  );

  app.get("/districts/general", DistrictController.getGeneral);
  app.get("/districts/civil_defense", DistrictController.getCivilDefense);

  app.get("/districts/lima", DistrictController.getLima);
  app.get("/districts/provinces", DistrictController.getProvinces);

  app.get("/districts/police_lima", DistrictController.getPoliceLima);
  app.get("/districts/police_provinces", DistrictController.getPoliceProvinces);

  app.get("/districts/firefighters_lima", DistrictController.getFirefightersLima);
  app.get("/districts/firefighters_provinces", DistrictController.getFirefightersProvinces);
};