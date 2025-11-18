import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Necesario en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 📌 Ruta correcta al build de Angular 19
const DIST_FOLDER = path.join(__dirname, 'dist', 'ecommerce-angular19', 'browser');

// 📌 Servir archivos estáticos
app.use(express.static(DIST_FOLDER));

// 📌 Fallback para Angular (Express 5 NO admite rutas como "/*")
app.get('*', (req, res) => {
  res.sendFile(path.join(DIST_FOLDER, 'index.html'));
});

// 🚀 Inicializar servidor
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Frontend ejecutándose en http://localhost:${PORT}`);
  console.log(`📁 Sirviendo dist desde: ${DIST_FOLDER}`);
});
