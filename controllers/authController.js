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
  },

  async register(req, res, next) {
    const { name, lastname, email, password } = req.body;
    
    try {
      const userRecord = await admin.auth().createUser({
        email: email,
        password: password,
        displayName: name,
        disabled: false
      });
      const uid = userRecord.uid;

      const userRef = db.collection("users").doc(uid);
      const user = {
        uid: uid,
        name: name,
        lastname: lastname,
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
      return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: "Error al registrar usuario",
      });
    }
  },

};