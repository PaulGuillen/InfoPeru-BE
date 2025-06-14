const axios = require("axios");
const HTTP_STATUS_CODES = require("../utils/httpStatusCodes");
const {
  EXTERNAL_APIS,
  HEADERS,
  COLLECTION_GRATITUDE,
  COLLECTION_SECTION,
  COLLECTION_HOME_IMAGES,
} = require("../utils/constants");

const { db } = require("../utils/firebase");

const getDollarQuote = async (_, res) => {
  try {
    
    const [dollarRes, snapshot] = await Promise.all([
      axios.get(EXTERNAL_APIS.DOLLAR_QUOTE, {
        headers: {
          "User-Agent": HEADERS.USER_AGENT,
        },
      }),
      db.collection(COLLECTION_HOME_IMAGES).where("isDollarInfo", "==", true).limit(1).get(),
    ]);

    const dollarData = dollarRes.data;

    let imageUrl = null;
    let iconImage = null;
    if (!snapshot.empty) {
      const docData = snapshot.docs[0].data();
      imageUrl = docData.imageUrl;
      iconImage = docData.iconImage;
    }

    const enrichedData = {
      ...dollarData,
      imageUrl,
      iconImage,
    };

    return res.status(HTTP_STATUS_CODES.OK).json({
      status: HTTP_STATUS_CODES.OK,
      message: "Cotización obtenida exitosamente",
      data: enrichedData,
    });
  } catch (error) {
    console.error("Error al obtener cotización o imagen:", error.message);
    return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      message: "Error al obtener la cotización del dólar",
    });
  }
};

const getUit = async (_, res) => {
  try {
    const [uitRes, snapshot] = await Promise.all([
      axios.get(EXTERNAL_APIS.UIT, {
        headers: {
          "User-Agent": HEADERS.USER_AGENT,
        },
      }),
      db.collection(COLLECTION_HOME_IMAGES).where("isUITInfo", "==", true).limit(1).get(),
    ]);

    const uitData = uitRes.data;

    let imageUrl = null;
    let iconImage = null;
    if (!snapshot.empty) {
      const docData = snapshot.docs[0].data();
      imageUrl = docData.imageUrl || null;
      iconImage = docData.iconImage || null;
    }

    const enrichedData = {
      ...uitData,
      imageUrl,
      iconImage,
    };

    return res.status(HTTP_STATUS_CODES.OK).json({
      status: HTTP_STATUS_CODES.OK,
      message: "Valor de la UIT obtenido exitosamente",
      data: enrichedData,
    });
  } catch (error) {
    console.error("Error al obtener la UIT:", error.message);
    return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      message: "Error al obtener la UIT",
    });
  }
};

const getGratitude = async (_, res) => {
  try {
    const snapshot = await db.collection(COLLECTION_GRATITUDE).get();

    const gratitudeList = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.status(HTTP_STATUS_CODES.OK).json({
      status: HTTP_STATUS_CODES.OK,
      message: "Lista de gratitudes obtenida correctamente",
      data: gratitudeList,
    });
  } catch (error) {
    console.error("Error al obtener gratitudes:", error.message);
    return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      message: "Error al obtener la lista de gratitudes",
    });
  }
};

const getSections = async (_, res) => {
  try {
    const snapshot = await db.collection(COLLECTION_SECTION).get();

    const gratitudeList = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.status(HTTP_STATUS_CODES.OK).json({
      status: HTTP_STATUS_CODES.OK,
      message: "Lista de secciones obtenida correctamente",
      data: gratitudeList,
    });
  } catch (error) {
    console.error("Error al obtener secciones:", error.message);
    return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      message: "Error al obtener la lista de secciones",
    });
  }
};

module.exports = {
  getDollarQuote,
  getUit,
  getGratitude,
  getSections,
};