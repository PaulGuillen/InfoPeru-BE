const HomeController = require("../controllers/homeController.js");

module.exports = (app) => {
  app.get("/home/dollarQuote", HomeController.getDollarQuote);

  app.get("/home/uit", HomeController.getUit);


  // app.get("/users/sections", HomeController.register);

  // app.get("home/dollarQuote",HomeController.recoveryPassword);
};