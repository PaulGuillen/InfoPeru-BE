import AuthController from "../controllers/authController.js";
export default (app) => {
  app.post("/users/login", AuthController.login);
  app.post("/users/register", AuthController.register);
};
