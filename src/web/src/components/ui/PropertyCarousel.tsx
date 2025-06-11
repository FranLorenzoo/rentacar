import React, { useState, useEffect, useRef } from 'react';
import "../../app/globals.css";

// import { Product } from './PropertyCard';

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




  interface CarouselProps {
    cars: AutoAlquiler[],
    name?: string;
  }

const PropertiesCarousel: React.FC<CarouselProps> = ({cars , name}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);

  // Ajustar items por página según ancho
  useEffect(() => {
    const updateLayout = () => {
      const w = window.innerWidth;
      if (w >= 1024) setItemsPerPage(3);
      else if (w >= 768) setItemsPerPage(2);
      else setItemsPerPage(1);
      setCurrentPage(0);
    };
    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, []);

  const pageCount = Math.ceil(cars.length / itemsPerPage);

  // Desplazar track en cada cambio de página
  useEffect(() => {
    if (wrapperRef.current && trackRef.current) {
      const width = wrapperRef.current.clientWidth;
      trackRef.current.style.transform = `translateX(-${currentPage * width}px)`;
    }
  }, [currentPage, itemsPerPage, cars.length]);

  const prevPage = () => setCurrentPage((p) => Math.max(p - 1, 0));
  const nextPage = () => setCurrentPage((p) => Math.min(p + 1, pageCount - 1));

  // Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };
  const handleTouchEnd = () => {
    if (touchDeltaX.current > 50) prevPage();
    else if (touchDeltaX.current < -50) nextPage();
    touchDeltaX.current = 0;
  };

  return (
    <div className="relative w-full overflow-hidden" ref={wrapperRef}>
      <div
        ref={trackRef}
        className="flex transition-transform duration-300 ease-in-out"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {cars.map((prop) => (
          <div
            key={prop.id}
            className="flex-shrink-0 px-2"
            style={{ width: `${100 / itemsPerPage}%` }}
          >
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl">
              <img
                src={prop.img_url || "https://www.shutterstock.com/image-vector/car-icon-vector-illustration-isolated-260nw-1380837278.jpg"}
                alt="car image"
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <p className="text-gray-600 text-sm mb-2">
                  {prop.automatico ? "Automático" : "Manual"} - {prop.tipo}
                </p>
                <p className="text-lg font-bold text-green-600">
                  {prop.precio_diario.toLocaleString('es-AR', {
                    style: 'currency',
                    currency: 'ARS',
                  })} / día
                </p>
                <p>
                  {prop.marca}-{prop.modelo}
                </p>
                <p className="text-gray-600 text-sm mb-2">
                  Pasajeros: {prop.cantidad_pasajeros}
                </p>
                <p className="text-gray-600 text-sm mb-2">
                  Combustible: {prop.combustible}
                </p>
                <p className="text-gray-600 text-sm mb-2">
                  Aire acondicionado: {prop.tiene_aire ? "Sí" : "No"}
                </p>
                <p className="text-gray-600 text-sm mb-2">
                  GPS: {prop.tiene_gps ? "Sí" : "No"}
                </p>
               
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Flechas de navegación */}
      <button
        onClick={prevPage}
        disabled={currentPage === 0}
        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow disabled:opacity-50"
        aria-label="Anterior"
      >
        ‹
      </button>
      <button
        onClick={nextPage}
        disabled={currentPage === pageCount - 1}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow disabled:opacity-50"
        aria-label="Siguiente"
      >
        ›
      </button>

      {/* Indicadores (dots) */}
      <div className="flex justify-center mt-2 space-x-1">
        {Array.from({ length: pageCount }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentPage(idx)}
            className={`h-2 w-2 rounded-full transition-colors ${
              idx === currentPage ? 'bg-gray-800' : 'bg-gray-300'
            }`}
            aria-label={`Página ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default PropertiesCarousel;
