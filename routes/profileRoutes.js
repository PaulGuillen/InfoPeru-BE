import ProfileController from "../controllers/profileController.js";
export default (app) => {
  app.get("/users/profile/:id", ProfileController.getProfileById);
};
