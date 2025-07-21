import ProfileController from "../controllers/profileController.js";
export default (app) => {
  app.get("/users/profile/:id", ProfileController.getProfileById);
  app.put("/users/profile/update/:id", ProfileController.updateProfileById);
  app.post("/users/posts", ProfileController.createPost);
  app.patch("/users/posts/like/:id", ProfileController.incrementLike);
  app.get("/users/posts", ProfileController.getAllPosts);
};