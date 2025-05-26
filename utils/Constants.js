require("dotenv").config();

module.exports = {
  EMAILJS_USER_ID: process.env.EMAILJS_USER_ID,
  EMAILJS_SERVICE_ID: process.env.EMAILJS_SERVICE_ID,
  EMAILJS_TEMPLATE_ID: process.env.EMAILJS_TEMPLATE_ID,

  EXTERNAL_APIS: {
    DOLLAR_QUOTE: process.env.DOLLAR_QUOTE_URL,
    UIT: process.env.UIT_URL,
  },
  HEADERS: {
    USER_AGENT: process.env.USER_AGENT,
  },

  COLLECTION_GRATITUDE: process.env.COLLECTION_GRATITUDE,
};