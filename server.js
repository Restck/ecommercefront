import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Ruta correcta del build Angular 17/18/19
const DIST_FOLDER = path.join(__dirname, "dist", "ecommerce-angular19", "browser");

// Servir archivos estáticos
app.use(express.static(DIST_FOLDER));

// Catch-all sin wildcard (Express 5)
app.use((req, res) => {
  res.sendFile(path.join(DIST_FOLDER, "index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Frontend running on port ${PORT}`);
  console.log(`📁 Serving from: ${DIST_FOLDER}`);
});
