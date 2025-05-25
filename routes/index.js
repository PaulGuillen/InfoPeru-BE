const homeRoutes = require("./homeRoutes");
const authRoutes = require("./authRoutes");

module.exports = (app) => {
  authRoutes(app);
  homeRoutes(app);
};