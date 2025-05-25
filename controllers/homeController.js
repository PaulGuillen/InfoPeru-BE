const axios = require("axios");
const HTTP_STATUS_CODES = require("../utils/httpStatusCodes");
const { EXTERNAL_APIS, HEADERS } = require("../utils/constants");

const { auth, db } = require("../utils/firebase");

const getDollarQuote = async (req, res) => {
  try {
    const response = await axios.get(EXTERNAL_APIS.DOLLAR_QUOTE, {
      headers: {
        "User-Agent": HEADERS.USER_AGENT,
      },
    });

    const data = response.data;

    return res.status(HTTP_STATUS_CODES.OK).json({
      status: HTTP_STATUS_CODES.OK,
      message: "Cotización obtenida exitosamente",
      data: data,
    });
  } catch (error) {
    console.error("Error al obtener cotización desde DePeru:", error.message);
    return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      message: "Error al obtener la cotización del dólar",
    });
  }
};

const getUit = async (req, res) => {
  try {
    const response = await axios.get(EXTERNAL_APIS.UIT, {
      headers: {
        "User-Agent": HEADERS.USER_AGENT,
      },
    });

    const data = response.data;

    return res.status(HTTP_STATUS_CODES.OK).json({
      status: HTTP_STATUS_CODES.OK,
      message: "Valor de la UIT obtenido exitosamente",
      data: data,
    });
  } catch (error) {
    console.error("Error al obtener la UIT:", error.message);
    return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      message: "Error al obtener la UIT",
    });
  }
};

module.exports = {
  getDollarQuote,
  getUit,
};