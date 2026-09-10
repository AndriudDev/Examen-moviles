/**
 * Formato de datos de presentación (fechas legibles).
 * Compartido por el listado (TarjetaAvistamiento) y el detalle (RF-04):
 * una sola fuente para que ambas pantallas muestren la fecha igual.
 */

/** ISO 8601 → «DD/MM/YYYY HH:MM» en hora local; fecha inválida se muestra tal cual. */
export function formatearFechaLegible(iso: string): string {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) {
    return iso;
  }
  const dosDigitos = (n: number) => String(n).padStart(2, '0');
  return (
    `${dosDigitos(fecha.getDate())}/${dosDigitos(fecha.getMonth() + 1)}/${fecha.getFullYear()} ` +
    `${dosDigitos(fecha.getHours())}:${dosDigitos(fecha.getMinutes())}`
  );
}