import axios from "axios";
import HTTP_STATUS_CODES from "../utils/httpStatusCodes.js";
import { db } from "../utils/firebase.js";
import dotenv from "dotenv";
dotenv.config();

const getDollarQuote = async (_, res) => {
  try {
    const [dollarQuoteRes, imageSnapshot] = await Promise.all([
      axios.get("https://deperu.com/api/rest/cotizaciondolar.json", {
        headers: {
          "User-Agent": "devpaul",
        },
      }),
      db
        .collection(process.env.COLLECTION_HOME_IMAGES)
        .where("isDollarInfo", "==", true)
        .limit(1)
        .get(),
    ]);

    const dollarRes = dollarQuoteRes.data;
    let imageUrl = null;
    let iconImage = null;

    if (!imageSnapshot.empty) {
      const imageData = imageSnapshot.docs[0].data();
      imageUrl = imageData.imageUrl || null;
      iconImage = imageData.iconImage || null;
    }

    const enrichedData = {
      ...dollarRes,
      imageUrl,
      iconImage,
    };

    return res.status(HTTP_STATUS_CODES.OK).json({
      status: HTTP_STATUS_CODES.OK,
      message: "Cotización obtenida exitosamente",
      data: enrichedData,
    });
  } catch (error) {
    const status =
      error.response?.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR;
    const message =
      error.response?.data?.message || error.message || "Error desconocido";

    console.error("Error al obtener cotización o imagen:", message);

    return res.status(status).json({
      status,
      message: `Error al obtener la cotización del dólar: ${message}`,
    });
  }
};

const getUit = async (_, res) => {
  try {
    const [uitRes, snapshot] = await Promise.all([
      axios.get(process.env.UIT_URL, {
        headers: {
          "User-Agent": process.env.USER_AGENT,
        },
      }),
      db
        .collection(process.env.COLLECTION_HOME_IMAGES)
        .where("isUITInfo", "==", true)
        .limit(1)
        .get(),
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
    const snapshot = await db
      .collection(process.env.COLLECTION_GRATITUDE)
      .get();

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
    const [snapshot] = await Promise.all([
      db.collection(process.env.COLLECTION_SECTION).get(),
    ]);

    const sectionList = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.status(HTTP_STATUS_CODES.OK).json({
      status: HTTP_STATUS_CODES.OK,
      message: "Lista de secciones obtenida correctamente",
      data: sectionList,
    });
  } catch (error) {
    console.error("Error al obtener secciones:", error.message);
    return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      message: "Error al obtener la lista de secciones",
    });
  }
};

const getSyncDollarQuote = async (_, res) => {
  try {
    const response = await axios.get(process.env.DOLLAR_QUOTE_URL, {
      headers: {
        "User-Agent": process.env.USER_AGENT,
      },
    });

    const data = response.data;

    const quote = {
      Compra: data?.Cotizacion?.[0]?.Compra || null,
      Venta: data?.Cotizacion?.[0]?.Venta || null,
      DolaresxEuro: data?.DolaresxEuro || null,
      enlace: data?.enlace || "",
      fecha: data?.fecha || "",
      importante: data?.importante || "",
      servicio: data?.servicio || "",
      sitio: data?.sitio || "",
    };

    await db.collection("dollarQuote").doc("main").set(quote, { merge: true });

    return res.status(HTTP_STATUS_CODES.OK).json({
      status: HTTP_STATUS_CODES.OK,
      message: "Cotización sincronizada exitosamente",
      data: quote,
    });
  } catch (error) {
    const status =
      error.response?.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR;
    const message =
      error.response?.data?.message || error.message || "Error desconocido";

    console.error("Error al sincronizar dólar:", message);
    return res.status(status).json({
      status,
      message: `Error al sincronizar dólar: ${message}`,
    });
  }
};

export default {
  getDollarQuote,
  getUit,
  getGratitude,
  getSections,
  getSyncDollarQuote,
};
