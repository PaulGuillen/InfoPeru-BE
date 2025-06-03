const NewsController = require("../controllers/newsController.js");

module.exports = (app) => {
  app.get("/news/countries", NewsController.getCountries);

  app.get("/news/google", NewsController.getGoogle);

  app.get("/news/gdelt", NewsController.getGDELT);

  app.get("/news/reddit", NewsController.getRedditNews);
};
