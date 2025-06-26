import homeRoutes from "./homeRoutes.js";
import authRoutes from "./authRoutes.js";
import newsRoutes from "./newsRoutes.js";
import profileRoutes from "./profileRoutes.js";

export default (app) => {
  authRoutes(app);
  homeRoutes(app);
  newsRoutes(app);
  profileRoutes(app);
};