const admin = require("firebase-admin");
const HTTP_STATUS_CODES = require("../utils/httpStatusCodes");
const serviceAccount = require("../google_services_firebase.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const auth = admin.auth();
const db = admin.firestore();

module.exports = {
  async login(req, res, next) {
    const { email, type, googleToken } = req.body;

    try {
      // Si el tipo de login es 'classic'
      if (type === "classic") {
        const userRecord = await admin.auth().getUserByEmail(email);
        const uid = userRecord.uid;

        return res.status(HTTP_STATUS_CODES.OK).json({
          status: HTTP_STATUS_CODES.OK,
          message: "Inicio de sesión exitoso",
          uid: uid,
        });
      }

      // Si el tipo de login es 'google', validamos el token de Google
      if (type === "google" && googleToken) {
        // Verificar el token de Google
        const decodedToken = await admin.auth().verifyIdToken(googleToken);
        const uid = decodedToken.uid;

        // Puedes hacer más aquí como crear el usuario en Firestore si es necesario

        return res.status(HTTP_STATUS_CODES.OK).json({
          status: HTTP_STATUS_CODES.OK,
          message: "Inicio de sesión con Google exitoso",
          uid: uid,
        });
      }

      // Si el tipo no es reconocido o falta el token de Google
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
  },
};