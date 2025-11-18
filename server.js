import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// 📌 Carpeta correcta del build Angular 17–19
const DIST_FOLDER = path.join(__dirname, "dist", "ecommerce-angular19", "browser");

// 📌 Servir archivos estáticos
app.use(express.static(DIST_FOLDER, {
  maxAge: "1y", // Cache de producción
  index: false  // Muy importante para evitar conflictos en Express 5
}));

// 📌 Fallback Angular (sin usar "*" en Express 5)
app.get("/*", (req, res) => {
  res.sendFile(path.join(DIST_FOLDER, "index.html"));
});

// 🚀 Servidor
app.listen(PORT, () => {
  console.log(`🚀 Frontend ejecutándose en http://localhost:${PORT}`);
  console.log(`📁 Sirviendo dist desde: ${DIST_FOLDER}`);
});
