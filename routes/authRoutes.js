const AuthController = require("../controllers/authController.js");

module.exports = (app) => {
  /*
   * POST ROUTES
   */
  app.post("/users/login", AuthController.login);

  app.post("/users/register", AuthController.register);

  app.post("/users/recoveryPassword", AuthController.recoveryPassword);
};
