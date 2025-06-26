import HTTP_STATUS_CODES from "../utils/httpStatusCodes.js";
import { db } from "../utils/firebase.js";
import dotenv from "dotenv";
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

export default {
 getProfileById 
};