import type { Auto } from "../rent-a-car-agent/types.js"; // ajustá el path según tu proyecto

import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

export function loadJsonFromAgent(relativePath: string): Auto[] {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // Ruta base: apps/agents/src/utils -> subir dos niveles hasta agents/
  const agentRoot = path.resolve(__dirname, "../../");
  const filePath = path.join(agentRoot, relativePath);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Archivo no encontrado: ${filePath}`);
  }

  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data);
}
