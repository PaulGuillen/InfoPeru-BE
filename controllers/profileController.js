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

const createPost = async (req, res) => {
  const postsRef = db.collection(process.env.COLLECTION_POSTS);
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
  const postsRef = db.collection(process.env.COLLECTION_POSTS);
  const { id } = req.params;

  try {
    const postRef = postsRef.doc(id);
    await db.runTransaction(async (t) => {
      const doc = await t.get(postRef);
      if (!doc.exists) throw new Error("Comentario no encontrado");
      const currentLikes = doc.data().likes || 0;
      t.update(postRef, { likes: currentLikes + 1 });
    });

    res
      .status(200)
      .json({ status: 200, message: "Like agregado correctamente" });
  } catch (error) {
    res
      .status(500)
      .json({ status: 500, message: "Error al incrementar like", error });
  }
};

const getAllPosts = async (_req, res) => {
  const postsRef = db.collection(process.env.COLLECTION_POSTS);

  try {
    const snapshot = await postsRef.orderBy("createdAt", "desc").get();

    const posts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const data = posts.filter((post) => post.toPublic === true);

    res.status(200).json({
      status: 200,
      posts,
      data,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Error al obtener posts",
      error,
    });
  }
};

export default {
  getProfileById,
  updateProfileById,
  createPost,
  incrementLike,
  getAllPosts,
};
