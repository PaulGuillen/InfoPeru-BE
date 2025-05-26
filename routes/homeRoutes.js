const HomeController = require("../controllers/homeController.js");

module.exports = (app) => {
  app.get("/home/dollarQuote", HomeController.getDollarQuote);

  app.get("/home/uit", HomeController.getUit);

  app.get("/home/gratitude", HomeController.getGratitude);

  // app.get("/users/sections", HomeController.register);
};