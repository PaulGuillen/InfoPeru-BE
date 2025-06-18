const admin = require("firebase-admin");
const Constants = require("../utils/constants");

const serviceAccount = {
  type: Constants.FIREBASE_TYPE,
  project_id: Constants.FIREBASE_PROJECT_ID,
  private_key_id: Constants.FIREBASE_PRIVATE_KEY_ID,
  private_key: Constants.FIREBASE_PRIVATE_KEY,
  client_email: Constants.FIREBASE_CLIENT_EMAIL,
  client_id: Constants.FIREBASE_CLIENT_ID,
  auth_uri: Constants.FIREBASE_AUTH_URI,
  token_uri: Constants.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: Constants.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: Constants.FIREBASE_CLIENT_X509_CERT_URL,
  universe_domain: Constants.FIREBASE_UNIVERSE_DOMAIN,
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const auth = admin.auth();
const db = admin.firestore();

module.exports = { admin, auth, db };
