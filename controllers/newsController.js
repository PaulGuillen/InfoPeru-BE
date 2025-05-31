const axios = require("axios");
const HTTP_STATUS_CODES = require("../utils/httpStatusCodes");
const { EXTERNAL_APIS, COLLECTION_COUNTRIES } = require("../utils/constants");
const xml2js = require("xml2js");
const { db } = require("../utils/firebase");

const getCountries = async (_, res) => {
  try {
    const snapshot = await db.collection(COLLECTION_COUNTRIES).get();

    const countries = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const orderedCountries = countries.toSorted((a, b) => {
      const priority = (country) => {
        switch (country.title) {
          case "Perú":
            return 1;
          case "Argentina":
            return 2;
          case "México":
            return 3;
          default:
            return 4;
        }
      };

      return priority(a) - priority(b);
    });

    return res.status(HTTP_STATUS_CODES.OK).json({
      status: HTTP_STATUS_CODES.OK,
      message: "Países obtenidos exitosamente",
      data: orderedCountries,
    });
  } catch (error) {
    console.error("Error al obtener países:", error);
    return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      message: "Error al obtener países",
    });
  }
};

const getGoogle = async (req, res) => {
  try {
    const query = req.query.q || "";
    const hl = req.query.hl || "es";

    const page = parseInt(req.query.page, 10) || 1;
    const perPage = parseInt(req.query.perPage, 10) || 10;

    const response = await axios.get(EXTERNAL_APIS.GOOGLE_NEWS, {
      params: { q: query, hl: hl },
      responseType: "text",
    });

    const xmlData = response.data;
    const parserOptions = {
      explicitArray: false,
      ignoreAttrs: false,
      trim: true,
    };
    const parsed = await xml2js.parseStringPromise(xmlData, parserOptions);

    let itemsRaw = [];
    if (parsed?.rss?.channel?.item) {
      itemsRaw = Array.isArray(parsed.rss.channel.item)
        ? parsed.rss.channel.item
        : [parsed.rss.channel.item];
    }

    const allItems = itemsRaw.map((itm) => ({
      title: itm.title || "",
      link: itm.link || "",
      description: itm.description || "",
      pubDate: itm.pubDate || "",
      source: itm.source
        ? {
            url: itm.source?.$?.url || "",
            name: itm.source._ || "",
          }
        : null,
      guid: itm.guid || null,
    }));

    const totalItems = allItems.length;
    const totalPages = Math.ceil(totalItems / perPage);
    const currentPage = page > totalPages ? totalPages : page;

    const startIndex = (currentPage - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedItems = allItems.slice(startIndex, endIndex);

    return res.status(HTTP_STATUS_CODES.OK).json({
      status: HTTP_STATUS_CODES.OK,
      message: "Noticias de Google obtenidas exitosamente",
      data: {
        items: paginatedItems,
        totalItems,
        totalPages, 
        currentPage, 
        perPage, 
      },
    });
  } catch (error) {
    console.error("Error al obtener Google News RSS:", error);
    return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      message: "Error al obtener noticias de Google",
    });
  }
};

module.exports = {
  getCountries,
  getGoogle,
};