import HTTP_STATUS_CODES from "../utils/httpStatusCodes.js";
import { db } from "../utils/firebase.js";
import dotenv from "dotenv";
import { Timestamp } from "firebase-admin/firestore";
dotenv.config();

const getProfileById = async (req, res) => {
  try {
    const { id } = req.params;

    const docRef = db.collection(process.env.COLLECTION_USERS).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
        status: HTTP_STATUS_CODES.NOT_FOUND,
        message: "Usuario no encontrado",
      });
    }

    return res.status(HTTP_STATUS_CODES.OK).json({
      status: HTTP_STATUS_CODES.OK,
      message: "Perfil obtenido correctamente",
      data: {
        id: doc.id,
        ...doc.data(),
      },
    });
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      message: "Error al obtener el perfil",
    });
  }
};

const updateProfileById = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const docRef = db.collection(process.env.COLLECTION_USERS).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
        status: HTTP_STATUS_CODES.NOT_FOUND,
        message: "Usuario no encontrado",
      });
    }

    await docRef.update(updatedData);

    return res.status(HTTP_STATUS_CODES.OK).json({
      status: HTTP_STATUS_CODES.OK,
      message: "Perfil actualizado correctamente",
    });
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      message: "Error al actualizar el perfil",
    });
  }
};

const createComment = async (req, res) => {
  const postsRef = db.collection(process.env.COLLECTION_COMMENTS);
  try {
    const { userId, name, lastname, image, comment } = req.body;

    const docRef = postsRef.doc();
    const commentId = docRef.id;

    const newPost = {
      commentId,
      userId,
      name,
      lastname,
      image,
      comment,
      createdAt: Timestamp.now(),
      likes: 0,
    };

    await docRef.set(newPost);

    res.status(201).json({
      status: 201,
      message: "Comentario creado correctamente",
      commentId: commentId,
      data: newPost,
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: 500, message: "Error al crear el comentario", error });
  }
};

const incrementLike = async (req, res) => {
  const { type, id, userId } = req.params;
  const increment = req.params.increment === "true";

  const collectionName =
    type === "comment"
      ? process.env.COLLECTION_COMMENTS
      : process.env.COLLECTION_POSTS;

  const docRef = db.collection(collectionName).doc(id);

  try {
    await db.runTransaction(async (t) => {
      const doc = await t.get(docRef);
      if (!doc.exists) throw new Error("Documento no encontrado");

      const data = doc.data();
      const currentLikes = data.likes || 0;
      const likedBy = data.likedBy || {};

      if (increment) {
        likedBy[userId] = true;
        t.update(docRef, {
          likes: currentLikes + 1,
          likedBy,
        });
      } else {
        delete likedBy[userId];
        t.update(docRef, {
          likes: Math.max(currentLikes - 1, 0),
          likedBy,
        });
      }
    });

    res.status(200).json({
      status: 200,
      message: "Like actualizado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Error al actualizar el like: " + error.message,
    });
  }
};


const getPosts = async (_req, res) => {
  const postsRef = db.collection(process.env.COLLECTION_POSTS);

  try {
    const snapshot = await postsRef.get();

    const posts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const data = posts.filter((post) => post.toPublic === true);

    res.status(200).json({
      status: 200,
      data,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Error al obtener posts" + error.message,
    });
  }
};

const getComments = async (req, res) => {
  const postsRef = db.collection(process.env.COLLECTION_COMMENTS);

  const limit = parseInt(req.query.limit) || 10;
  const lastTimestamp = req.query.lastTimestamp;

  try {
    let query = postsRef.orderBy("createdAt", "desc").limit(limit);

    if (lastTimestamp) {
      const ts = Timestamp.fromMillis(Number(lastTimestamp));
      query = query.startAfter(ts);
    }

    const snapshot = await query.get();

    const comments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const lastVisible = snapshot.docs[snapshot.docs.length - 1];
    const nextPageCursor =
      lastVisible?.data()?.createdAt?.toMillis?.() || null;

    res.status(200).json({
      status: 200,
      comments,
      nextPageCursor,
    });
  } catch (error) {
    console.error("Error al obtener comentarios paginados:", error);
    res.status(500).json({
      status: 500,
      message: "Error al obtener los comentarios",
      error: error.message,
    });
  }
};

export default {
  getProfileById,
  updateProfileById,
  createComment,
  incrementLike,
  getPosts,
  getComments,
};
