import AuthController from "../controllers/authController.js"; // ✅ sin '*'

export default (app) => {
  app.post("/users/login", AuthController.login);
  app.post("/users/register", AuthController.register);
};
