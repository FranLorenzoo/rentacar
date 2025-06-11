import "./styles.css";

export const PropertyCard: React.FC<AutoAlquiler> = (props) => (
  <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 mx-2">
    <img
      src={
        props.img_url ||
        "https://www.shutterstock.com/image-vector/car-icon-vector-illustration-isolated-260nw-1380837278.jpg"
      }
      alt={`${props.marca} ${props.modelo}`}
      className="h-48 w-full object-cover rounded-t-2xl"
    />
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-1 line-clamp-1">
        {props.marca} {props.modelo}
      </h3>
      <p className="text-gray-600 text-sm mb-2">
        Tipo: {props.tipo}
      </p>
      <div className="text-green-600 font-bold text-lg mb-2">
        ${props.precio_diario} / día
      </div>
      <p className="text-gray-600 text-sm mb-2">
        Pasajeros: {props.cantidad_pasajeros}
      </p>
      <p className="text-gray-600 text-sm mb-2">
        Combustible: {props.combustible}
      </p>
      <p className="text-gray-600 text-sm mb-2">
        Aire acondicionado: {props.tiene_aire ? "Sí" : "No"}
      </p>
      <p className="text-gray-600 text-sm mb-2">
        GPS: {props.tiene_gps ? "Sí" : "No"}
      </p>
      <p className="text-gray-600 text-sm mb-2">
        Silla bebé: {props.tiene_bebesilla ? "Sí" : "No"}
      </p>
      <p className="text-gray-600 text-sm mb-2">
        Estado: {props.activo ? "Disponible" : "No disponible"}
      </p>
    </div>
  </div>
);
export default PropertyCard;

export interface AutoAlquiler {
  id: number;
  marca: string;
  modelo: string;
  tipo: string;
  combustible: string;
  cantidad_pasajeros: number;
  precio_diario: number;
  tiene_aire: boolean;
  tiene_gps: boolean;
  tiene_bebesilla: boolean;
  activo: boolean;
  automatico: boolean;
  fechas_ocupado: { inicio: string; fin: string }[];
  img_url: string;
}
