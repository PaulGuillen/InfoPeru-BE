import homeRoutes from "./homeRoutes.js";
import authRoutes from "./authRoutes.js";
import newsRoutes from "./newsRoutes.js";

export default (app) => {
  authRoutes(app);
  homeRoutes(app);
  newsRoutes(app);
};