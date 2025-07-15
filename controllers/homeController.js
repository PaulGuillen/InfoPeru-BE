import axios from "axios";
import HTTP_STATUS_CODES from "../utils/httpStatusCodes.js";
import { db } from "../utils/firebase.js";
import dotenv from "dotenv";
dotenv.config();

const getDollarQuote = async (_, res) => {
  try {
    const data = await fetchLiveDollarQuote();

    return res.status(200).json({
      status: 200,
      message: "Cotización obtenida exitosamente (live)",
      data,
    });
  } catch (liveError) {
    console.warn("⚠️ API externa falló, intentando obtener backup:", liveError?.message || liveError);

    try {
      const fallbackData = await fetchDollarQuoteFromBackup();

      if (!fallbackData) {
        return res.status(503).json({
          status: 503,
          message: "No se pudo obtener la cotización ni desde la API ni desde backup.",
        });
      }

      return res.status(200).json({
        status: 200,
        message: "Cotización obtenida desde backup de Firebase",
        data: fallbackData,
      });
    } catch (backupError) {
      const errorMessage = backupError?.message || JSON.stringify(backupError);

      console.error("❌ Error al obtener datos desde el backup de Firebase:", errorMessage);

      return res.status(503).json({
        status: 503,
        message: "No se pudo obtener la cotización ni desde la API ni desde backup.",
        error: errorMessage,
      });
    }
  }
};

async function fetchLiveDollarQuote() {
  const externalRes = await axios.get(process.env.DOLLAR_QUOTE_URL, {
    headers: { "User-Agent": process.env.USER_AGENT },
  });

  const apiData = externalRes.data;
  const cotizacion = apiData?.Cotizacion?.[0] ?? {};

  await db.collection("dollarQuote").doc("latest").set({
    ...apiData,
    Compra: cotizacion.Compra ?? 0,
    Venta: cotizacion.Venta ?? 0,
    updatedAt: new Date(),
  });

  const imageSnapshot = await db
    .collection(process.env.COLLECTION_HOME_IMAGES)
    .where("isDollarInfo", "==", true)
    .limit(1)
    .get();

  const imageData = imageSnapshot.empty ? {} : imageSnapshot.docs[0].data();

  return {
    ...apiData,
    Cotizacion: [{ Compra: cotizacion.Compra ?? 0, Venta: cotizacion.Venta ?? 0 }],
    imageUrl: imageData.imageUrl || null,
    iconImage: imageData.iconImage || null,
    source: "live",
  };
}

async function fetchDollarQuoteFromBackup() {
  try {
    const backupDoc = await db.collection("dollarQuote").doc("latest").get();

    if (!backupDoc.exists) {
      const emptyData = {
        Compra: 0,
        Venta: 0,
        DolaresxEuro: 0,
        enlace: "",
        fecha: "",
        importante: "",
        servicio: "",
        sitio: "",
        updatedAt: new Date(),
        source: "empty",
      };

      await db.collection("dollarQuote").doc("latest").set(emptyData);
      return {
        ...emptyData,
        Cotizacion: [{ Compra: 0, Venta: 0 }],
        imageUrl: null,
        iconImage: null,
      };
    }

    const backupData = backupDoc.data();

    const imageSnapshot = await db
      .collection(process.env.COLLECTION_HOME_IMAGES)
      .where("isDollarInfo", "==", true)
      .limit(1)
      .get();

    const imageData = imageSnapshot.empty ? {} : imageSnapshot.docs[0].data();

    return {
      ...backupData,
      Cotizacion: [
        { Compra: backupData.Compra ?? 0, Venta: backupData.Venta ?? 0 }
      ],
      imageUrl: imageData.imageUrl || null,
      iconImage: imageData.iconImage || null,
      source: "backup",
    };
  } catch (err) {
    console.error("❌ Error crítico en backup:", err.message);
    return null;
  }
}

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
