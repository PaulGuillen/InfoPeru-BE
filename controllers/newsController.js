import axios from "axios";
import HTTP_STATUS_CODES from "../utils/httpStatusCodes.js";
import { Util } from "../utils/util.js";
import xml2js from "xml2js";
import { db } from "../utils/firebase.js";
import RedditResponse from "../models/RedditResponse.js";
import dotenv from "dotenv";
dotenv.config();

const getCountries = async (_, res) => {
  try {
    const snapshot = await db.collection(process.env.COLLECTION_COUNTRIES).get();
 
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

    const response = await axios.get(process.env.GOOGLE_NEWS_URL, {
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

    const allItems = itemsRaw.map((itm) => {
      const rawDate = itm.pubDate || "";
      return {
        title: itm.title || "",
        link: itm.link || "",
        description:(Util.cleanDescription(itm.description) || "") + " ...Leer más?",
        pubDate: Util.formatPubDate(rawDate),
        rawDate,
        source: itm.source
          ? {
              url: itm.source?.$?.url || "",
              name: itm.source._ || "",
            }
          : null,
        guid: itm.guid || null,
      };
    });

    const sortedItems = allItems.sort((a, b) => {
      const dateA = new Date(a.rawDate);
      const dateB = new Date(b.rawDate);
      return dateB - dateA;
    });

    const totalItems = sortedItems.length;
    const totalPages = Math.ceil(totalItems / perPage);
    const currentPage = page > totalPages ? totalPages : page;
    const startIndex = (currentPage - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedItems = sortedItems
      .slice(startIndex, endIndex)
      .map(({ rawDate, ...rest }) => rest);

    return res.status(HTTP_STATUS_CODES.OK).json({
      status: HTTP_STATUS_CODES.OK,
      message: "Noticias de Google",
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

const getGDELT = async (req, res) => {
  try {
    const query = req.query.q || "";
    const mode = req.query.mode || "ArtList";
    const format = req.query.format || "json";
    const page = parseInt(req.query.page, 10) || 1;
    const perPage = parseInt(req.query.perPage, 10) || 10;

    const response = await axios.get(process.env.GDELT_PROJECT_URL, {
      params: { query, mode, format },
    });

    const articles = response.data.articles || [];

    const mappedArticles = articles.map((article) => ({
      url: article.url || "",
      urlMobile: article.url_mobile || "",
      title: article.title || "",
      seenDate: Util.formatSeenDate(article.seendate || ""),
      socialImage: article.socialimage || "",
      domain: article.domain || "",
      language: article.language || "",
      sourceCountry: article.sourcecountry || "",
    }));

    const sortedArticles = Util.sortBySeenDateDesc(mappedArticles);

    const totalItems = sortedArticles.length;
    const totalPages = Math.ceil(totalItems / perPage);
    const currentPage = Math.min(page, totalPages);
    const startIndex = (currentPage - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedItems = sortedArticles.slice(startIndex, endIndex);

    return res.status(HTTP_STATUS_CODES.OK).json({
      status: HTTP_STATUS_CODES.OK,
      message: "Noticias GDELT",
      data: {
        items: paginatedItems,
        totalItems,
        totalPages,
        currentPage,
        perPage,
      },
    });
  } catch (error) {
    console.error("Error al obtener noticias de GDELT:", error.message);
    return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      message: "Error al obtener noticias de GDELT",
    });
  }
};

const getRedditNews = async (req, res) => {
  try {
    const country = req.query.country || "worldnews";
    const page = parseInt(req.query.page, 10) || 1;
    const perPage = parseInt(req.query.perPage, 10) || 10;

    const url = `${process.env.REDDIT_BASE_URL}/r/${country}/new.json`;

    const response = await axios.get(url, {
      headers: {
        "User-Agent": process.env.REDDIT_USER_AGENT,
      },
    });

    const redditResponse = new RedditResponse(response.data);
    const allPosts = redditResponse.data.children;

    const sortedPosts = allPosts.sort((a, b) => b.createdUtc - a.createdUtc);

    const totalItems = sortedPosts.length;
    const totalPages = Math.ceil(totalItems / perPage);
    const currentPage = Math.min(page, totalPages);
    const startIndex = (currentPage - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedItems = sortedPosts.slice(startIndex, endIndex);

    return res.status(HTTP_STATUS_CODES.OK).json({
      status: HTTP_STATUS_CODES.OK,
      message: "Noticias de Reddit",
      data: {
        items: paginatedItems,
        totalItems,
        totalPages,
        currentPage,
        perPage,
      },
    });
  } catch (error) {
    console.error("Error al obtener noticias de Reddit:", error);
    return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      message: "Error al obtener noticias de Reddit",
    });
  }
};

export default {
  getCountries,
  getGoogle,
  getGDELT,
  getRedditNews,
};