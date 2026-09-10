/**
 * Entidad de dominio del avistamiento.
 * Capa Modelo: no conoce pantallas ni periféricos, solo datos y reglas.
 */

export type Clima = {
  /** °C, current.temperature_2m */
  temperaturaC: number;
  /** weather_code traducido a texto, ej. "Lluvia ligera" */
  condicion: string;
  /** ícono de la condición */
  icono: string;
  /** tercer dato: % de humedad relativa, current.relative_humidity_2m */
  humedadPct: number;
  /** weather_code crudo, se conserva como histórico */
  weatherCode: number;
  /** ISO 8601 del momento en que se consultó */
  consultadoEn: string;
};

export type Avistamiento = {
  id: string;
  /** texto libre; «no identificada» es válido (RF-01) */
  nombre: string;
  /** entero >= 1 (RF-01) */
  cantidad: number;
  /** ISO 8601, automática y editable (RF-01) */
  fecha: string;
  notas?: string;
  /** GPS del dispositivo (RF-01) */
  lat: number;
  lng: number;
  /** lugar legible, resultado del reverse geocoding (RF-04) */
  lugar?: string;
  /** ausente si la API falló o no hay red (RF-02) */
  clima?: Clima;
  /** URI del archivo de foto persistente (RF-05) */
  fotoUri: string;
  /** ISO 8601 de creación */
  creadoEn: string;
};

/** Datos que capturan los periféricos antes de validar/guardar. */
export type BorradorAvistamiento = {
  nombre: string;
  cantidad: string;
  fecha: string;
  notas?: string;
  fotoUri?: string;
  coordenadas?: { lat: number; lng: number };
  /** clima del momento si la API respondió; ausente si falló (RF-02) */
  clima?: Clima;
};

export function nuevaFechaLocal(): string {
  return new Date().toISOString();
}

export function nuevaId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}