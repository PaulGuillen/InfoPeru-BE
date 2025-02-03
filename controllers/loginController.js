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
    const { email} = req.body;

    try {
      const userRecord = await admin.auth().getUserByEmail(email);
      const uid = userRecord.uid;

      res.status(HTTP_STATUS_CODES.OK).json({
        status: HTTP_STATUS_CODES.OK,
        message: "Inicio de sesión exitoso",
        uid: uid,
      });
    } catch (error) {
      console.error("Error de inicio de sesión:", error);
      res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
        status: HTTP_STATUS_CODES.NOT_FOUND,
        message: "Credenciales de inicio de sesión incorrectas",
      });
    }
  },

};
