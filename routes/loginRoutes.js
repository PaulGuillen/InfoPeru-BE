const LoginController = require("../controllers/loginController.js");

module.exports = (app) => {
  /*
   * POST ROUTES
   */
  app.post("/users/login", LoginController.login);

  //app.post("/users/createUser", LoginController.createUser);
};
