import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// 📌 Ruta correcta del build Angular (Angular 17+ genera dist/browser)
const DIST_FOLDER = path.join(__dirname, "dist/browser");

// 📌 Servir archivos estáticos
app.use(express.static(DIST_FOLDER));

// 📌 Fallback para Angular SPA
app.get("*", (req, res) => {
  res.sendFile(path.join(DIST_FOLDER, "index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Frontend ejecutándose en http://localhost:${PORT}`);
});
