const axios = require("axios");
const HTTP_STATUS_CODES = require("../utils/httpStatusCodes");
const {
  COLLECTION_COUNTRIES,
} = require("../utils/constants");

const { db } = require("../utils/firebase");

const getCountries = async (_, res) => {
  try {
     const snapshot = await db.collection(COLLECTION_COUNTRIES).get();

    const countries = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

   const orderedCountries = countries.toSorted((a, b) => {
      const priority = country => {
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

module.exports = {
  getCountries,
};