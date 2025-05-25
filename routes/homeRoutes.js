const HomeController = require("../controllers/homeController.js");

module.exports = (app) => {
  app.get("/home/dollarQuote", HomeController.getDollarQuote);
  
  // app.get("/users/sections", HomeController.register);

  // app.get("home/dollarQuote",HomeController.recoveryPassword);

  // app.get("home/uit",HomeController.recoveryPassword);
};