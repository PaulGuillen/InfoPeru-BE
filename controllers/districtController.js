import fs from "fs";
import path from "path";
import { db } from "../utils/firebase.js";

const filePath = path.join(process.cwd(), "scrapping", "emergencias.json");

const uploadEmergenciesStructured = async (_req, res) => {
  try {
    const rawData = fs.readFileSync(filePath, "utf8");
    const emergencias = JSON.parse(rawData);

    const { general = [], civil_defense = [], local_emergency = {} } = emergencias;
    const { lima = [], provinces = [] } = local_emergency;

    const serenazgoRef = db.collection("district").doc("serenazgo");

    // Actualizar fecha
    await serenazgoRef.set({ updatedAt: new Date().toISOString() }, { merge: true });

    // Crear batch para performance
    const batch = db.batch();

    const writeSubcollection = (collectionName, dataArray) => {
      dataArray.forEach((item) => {
        const docRef = serenazgoRef.collection(collectionName).doc();
        batch.set(docRef, item);
      });
    };

    // Guardar cada subcolección
    writeSubcollection("general", general);
    writeSubcollection("civil_defense", civil_defense);
    writeSubcollection("lima", lima);
    writeSubcollection("provinces", provinces);

    await batch.commit();

    return res.status(200).json({
      status: 200,
      message: "✅ Emergencias subidas correctamente como subcolecciones.",
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

const getAllSerenazgoData = async (_req, res) => {
  try {
    const serenazgoRef = db.collection("district").doc("serenazgo");

    // Obtener metadatos del doc principal
    const doc = await serenazgoRef.get();
    if (!doc.exists) {
      return res.status(404).json({
        status: 404,
        message: "No se encontró el documento serenazgo",
      });
    }

    const metadata = doc.data();

    // Obtener subcolecciones
    const [generalSnap, civilSnap, limaSnap, provincesSnap] = await Promise.all([
      serenazgoRef.collection("general").get(),
      serenazgoRef.collection("civil_defense").get(),
      serenazgoRef.collection("lima").get(),
      serenazgoRef.collection("provinces").get(),
    ]);

    const toList = (snap) => snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return res.status(200).json({
      status: 200,
      updatedAt: metadata.updatedAt || null,
      general: toList(generalSnap),
      civil_defense: toList(civilSnap),
      local_emergency: {
        lima: toList(limaSnap),
        provinces: toList(provincesSnap),
      },
    });
  } catch (error) {
    console.error("❌ Error al obtener serenazgo completo:", error);
    return res.status(500).json({
      status: 500,
      message: "Error al obtener los datos de serenazgo",
      error: error.message,
    });
  }
};

export default {
  uploadEmergenciesStructured,
  getAllSerenazgoData,
};