/**
 * Traducción de `weather_code` (WMO) a texto e ícono legibles (RF-02).
 * Capa Modelo: no conoce pantallas, solo la presentación de datos.
 * Patrón Factory (stack.md §9): un código numérico produce el par
 * texto + ícono con el que la UI muestra la condición.
 */

export type CondicionClima = { condicion: string; icono: string };

type RangoWmo = {
  desde: number;
  hasta: number;
  condicion: string;
  icono: string;
};

/**
 * Tabla de códigos WMO de stack.md §6.3: la API entrega el código como número
 * (0 = despejado, 61 = lluvia…); traducir a texto e ícono es parte de RF-02.
 */
const TABLA_WMO: readonly RangoWmo[] = [
  { desde: 0, hasta: 0, condicion: 'Despejado', icono: '☀️' },
  { desde: 1, hasta: 2, condicion: 'Mayormente despejado', icono: '🌤️' },
  { desde: 3, hasta: 3, condicion: 'Nublado', icono: '☁️' },
  { desde: 45, hasta: 48, condicion: 'Niebla', icono: '🌫️' },
  { desde: 51, hasta: 57, condicion: 'Llovizna', icono: '🌦️' },
  { desde: 61, hasta: 67, condicion: 'Lluvia', icono: '🌧️' },
  { desde: 71, hasta: 77, condicion: 'Nieve', icono: '❄️' },
  { desde: 80, hasta: 82, condicion: 'Chubascos', icono: '🌦️' },
  { desde: 85, hasta: 86, condicion: 'Chubascos de nieve', icono: '🌨️' },
  { desde: 95, hasta: 99, condicion: 'Tormenta', icono: '⛈️' },
];

const DESCONOCIDO: CondicionClima = { condicion: 'Condición desconocida', icono: '❔' };

/** Devuelve la condición legible de un `weather_code`; fuera de tabla → desconocido. */
export function traducirCodigoWmo(codigo: number): CondicionClima {
  const rango = TABLA_WMO.find((r) => codigo >= r.desde && codigo <= r.hasta);
  return rango ? { condicion: rango.condicion, icono: rango.icono } : DESCONOCIDO;
}