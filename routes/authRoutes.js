const AuthController = require("../controllers/authController.js");

module.exports = (app) => {

  app.post("/users/login", AuthController.login);

  app.post("/users/register", AuthController.register);

  app.post("/users/recoveryPassword", AuthController.recoveryPassword);
};