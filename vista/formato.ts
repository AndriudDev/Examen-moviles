/**
 * Formato de datos de presentación (fechas legibles).
 * Compartido por el listado (TarjetaAvistamiento) y el detalle (RF-04):
 * una sola fuente para que ambas pantallas muestren la fecha igual.
 */

/** ISO parseable → Date; fecha inválida → null (se muestra tal cual). */
function descomponerFecha(iso: string): Date | null {
  const fecha = new Date(iso);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

const dosDigitos = (n: number) => String(n).padStart(2, '0');

/** ISO 8601 → «DD/MM/YYYY» en hora local; fecha inválida se muestra tal cual. */
export function formatearFecha(iso: string): string {
  if (!descomponerFecha(iso)) {
    return iso;
  }
  const fecha = new Date(iso);
  return `${dosDigitos(fecha.getDate())}/${dosDigitos(fecha.getMonth() + 1)}/${fecha.getFullYear()}`;
}

/** ISO 8601 → «HH:MM» local; fecha inválida se muestra tal cual. */
export function formatearHora(iso: string): string {
  if (!descomponerFecha(iso)) {
    return iso;
  }
  const fecha = new Date(iso);
  return `${dosDigitos(fecha.getHours())}:${dosDigitos(fecha.getMinutes())}`;
}

/** ISO 8601 → «DD/MM/YYYY HH:MM» en hora local; fecha inválida se muestra tal cual. */
export function formatearFechaLegible(iso: string): string {
  if (!descomponerFecha(iso)) {
    return iso;
  }
  return `${formatearFecha(iso)} ${formatearHora(iso)}`;
}