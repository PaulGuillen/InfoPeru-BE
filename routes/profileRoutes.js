import ProfileController from "../controllers/profileController.js";
export default (app) => {
  app.get("/users/profile/:id", ProfileController.getProfileById);
  app.put("/users/profile/update/:id", ProfileController.updateProfileById);
};
