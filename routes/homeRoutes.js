import HomeController from "../controllers/homeController.js";

export default (app) => {
  app.get("/home/dollarQuote", HomeController.getDollarQuote);
  app.get("/home/uit", HomeController.getUit);
  app.get("/home/gratitude", HomeController.getGratitude);
  app.get("/home/section", HomeController.getSections);
  app.get("/home/syncDollarQuote", HomeController.getSyncDollarQuote);
};