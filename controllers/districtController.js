// controllers/districtController.js
import fs from "fs";
import path from "path";
import { db } from "../utils/firebase.js";

const filePath = path.join(process.cwd(), "scrapping", "emergencias.json");

const parseAndWriteSection = async (sectionName, sectionData) => {
  const docRef = db.collection("district").doc(sectionName);

  const data = Array.isArray(sectionData)
    ? sectionData
    : sectionData.data || [];

  await docRef.set({
    data,
    updatedAt: new Date().toISOString(),
  });
};

const uploadEmergenciesStructured = async (_req, res) => {
  try {
    const rawData = fs.readFileSync(filePath, "utf8");
    const emergencias = JSON.parse(rawData);

    const {
      general = [],
      civil_defense = [],
      local_emergency = {},
      police = {},
      firefighters = {},
    } = emergencias;

    await parseAndWriteSection("general", general);
    await parseAndWriteSection("civil_defense", civil_defense);
    await parseAndWriteSection("lima", local_emergency.lima || []);
    await parseAndWriteSection("provinces", local_emergency.provinces || []);
    await parseAndWriteSection("police_lima", police.lima || []);
    await parseAndWriteSection("police_provinces", police.provinces || []);
    await parseAndWriteSection("firefighters_lima", firefighters.lima || []);
    await parseAndWriteSection(
      "firefighters_provinces",
      firefighters.provinces || []
    );

    return res.status(200).json({
      status: 200,
      message: "✅ Emergencias subidas correctamente por sección.",
    });
  } catch (error) {
    console.error("❌ Error en uploadEmergenciesStructured:", error);
    return res.status(500).json({
      status: 500,
      message: "Error al subir emergencias",
      error: error.message,
    });
  }
};

const getSection = async (req, res, sectionName) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;

    const doc = await db.collection("district").doc(sectionName).get();

    if (!doc.exists) {
      return res.status(404).json({
        status: 404,
        message: `No se encontró la sección '${sectionName}'`,
      });
    }

    const docData = doc.data();
    const fullData = docData.data || [];
    const total = fullData.length;
    const startIndex = (page - 1) * perPage;
    const paginatedData = fullData.slice(startIndex, startIndex + perPage);

    return res.status(200).json({
      status: 200,
      data: paginatedData,
      pagination: {
        total,
        perPage,
        currentPage: page,
        totalPages: Math.ceil(total / perPage),
      },
    });
  } catch (error) {
    console.error(`❌ Error al obtener sección '${sectionName}':`, error);
    return res.status(500).json({
      status: 500,
      message: `Error al obtener sección '${sectionName}'`,
      error: error.message,
    });
  }
};

const addDistrictSection = async (req, res) => {
  try {
    const sections = req.body;

    if (!Array.isArray(sections) || sections.length === 0) {
      return res.status(400).json({
        status: 400,
        message: "El cuerpo debe ser un array de secciones.",
      });
    }

    for (const section of sections) {
      const { title, image, type } = section;
      if (!title || !image || !type) {
        return res.status(400).json({
          status: 400,
          message: "Cada sección debe tener title, image y type.",
        });
      }
    }

    const docRef = db.collection("district").doc("section");
    await docRef.set({
      data: sections,
      updatedAt: new Date().toISOString(),
    });

    return res.status(201).json({
      status: 201,
      message: `✅ ${sections.length} sección(es) guardadas correctamente en district/section.`,
      data: sections,
    });
  } catch (error) {
    console.error("❌ Error en addDistrictSection:", error);
    return res.status(500).json({
      status: 500,
      message: "Error al guardar las secciones",
      error: error.message,
    });
  }
};

const getDistrictSection = async (_req, res) => {
  try {
    const doc = await db.collection("district").doc("section").get();

    if (!doc.exists) {
      return res.status(404).json({
        status: 404,
        message: "No se encontró la sección 'section'",
      });
    }

    const docData = doc.data();
    const sectionData = docData.data || [];

    return res.status(200).json({
      status: 200,
      data: sectionData,
    });
  } catch (error) {
    console.error("❌ Error en getDistrictSection:", error);
    return res.status(500).json({
      status: 500,
      message: "Error al obtener las secciones",
      error: error.message,
    });
  }
};


export default {
  uploadEmergenciesStructured,
  addDistrictSection,
  getDistrictSection,
  getGeneral: (req, res) => getSection(req, res, "general"),
  getCivilDefense: (req, res) => getSection(req, res, "civil_defense"),
  getLima: (req, res) => getSection(req, res, "lima"),
  getProvinces: (req, res) => getSection(req, res, "provinces"),
  getPoliceLima: (req, res) => getSection(req, res, "police_lima"),
  getPoliceProvinces: (req, res) => getSection(req, res, "police_provinces"),
  getFirefightersLima: (req, res) => getSection(req, res, "firefighters_lima"),
  getFirefightersProvinces: (req, res) =>
    getSection(req, res, "firefighters_provinces"),
};
