import ProfileController from "../controllers/profileController.js";
export default (app) => {
  app.get("/users/profile/:id", ProfileController.getProfileById);
  app.put("/users/profile/update/:id", ProfileController.updateProfileById);
  app.get("/users/posts", ProfileController.getPosts);
  app.post("/users/comment", ProfileController.createComment);
  app.patch("/users/posts/like/:type/:id/:userId/:increment", ProfileController.incrementLike);
  app.get("/users/comments", ProfileController.getComments);
};