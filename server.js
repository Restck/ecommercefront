import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Servir estáticos desde /dist/browser
app.use(express.static(path.join(__dirname, "dist", "browser")));

// 🚫 IMPORTANTÍSIMO: NO usar "*" en Express 5
// Catch-all: debe ser SIN RUTA
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "dist", "browser", "index.html"));
});

app.listen(PORT, () =>
  console.log(`🚀 Frontend running on port ${PORT}`)
);
