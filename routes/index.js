const homeRoutes = require("./homeRoutes");
const authRoutes = require("./authRoutes");
const newsRoutes = require("./newsRoutes");

module.exports = (app) => {
  authRoutes(app);
  homeRoutes(app);
  newsRoutes(app);
};