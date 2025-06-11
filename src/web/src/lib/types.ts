export interface RangoFecha {
  inicio: string; // formato ISO: "YYYY-MM-DD"
  fin: string;
}

export interface Auto {
  id: number;
  marca: string;
  modelo: string;
  tipo: "económico" | "SUV" | "camioneta" | "familiar" | "auto";
  combustible: "nafta" | "diésel" | "eléctrico" | "híbrido";
  cantidad_pasajeros: number;
  precio_diario: number;
  automatico: boolean;
  tiene_aire: boolean;
  tiene_gps: boolean;
  tiene_bebesilla: boolean;
  fechas_ocupado: RangoFecha[];
  activo: boolean;
  img_url: string;
}
