import HTTP_STATUS_CODES from "../utils/httpStatusCodes.js";
import { auth, db } from "../utils/firebase.js";

async function login(req, res, next) {
  const { email, type, googleToken } = req.body;

  try {
    if (type === "classic") {
      const userRecord = await auth.getUserByEmail(email);
      const uid = userRecord.uid;

      return res.status(HTTP_STATUS_CODES.OK).json({
        status: HTTP_STATUS_CODES.OK,
        message: "Inicio de sesión exitoso",
        uid: uid,
      });
    }

    if (type === "google" && googleToken) {
      const decodedToken = await auth.verifyIdToken(googleToken);
      const uid = decodedToken.uid;
      return res.status(HTTP_STATUS_CODES.OK).json({
        status: HTTP_STATUS_CODES.OK,
        message: "Inicio de sesión con Google exitoso",
        uid: uid,
      });
    }

    return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
      status: HTTP_STATUS_CODES.BAD_REQUEST,
      message: "Tipo de inicio de sesión no válido o token de Google faltante",
    });
  } catch (error) {
    console.error("Error en el inicio de sesión:", error);
    return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      message: "Error en el inicio de sesión",
    });
  }
}

async function register(req, res, next) {
  const { name, lastname, email, password } = req.body;

  try {
    const userRecord = await auth.createUser({
      email: email,
      password: password,
      displayName: name,
      disabled: false,
    });
    const uid = userRecord.uid;

    const userRef = db.collection("users").doc(uid);
    const user = {
      uid: uid,
      name: name,
      lastname: lastname,
      phone: "",
      birthdate: "",
      email: email,
      password: password,
    };

    await userRef.set(user);

    return res.status(HTTP_STATUS_CODES.OK).json({
      status: HTTP_STATUS_CODES.OK,
      message: "Usuario registrado exitosamente",
      uid: uid,
    });
  } catch (error) {
    console.error("Error al registrar usuario:", error);

    let mensajeError = "Error al registrar usuario";

    if (error.code === "auth/email-already-exists") {
      mensajeError = "El correo electrónico ya está en uso por otra cuenta.";
    }

    return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      message: mensajeError,
    });
  }
}

export default {
  login,
  register,
};
