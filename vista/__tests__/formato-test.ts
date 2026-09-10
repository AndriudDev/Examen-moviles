import { formatearFecha, formatearFechaLegible, formatearHora } from '../formato';

/**
 * Formato de fechas legibles del listado y el detalle (RF-04). Las
 * aserciones se calculan desde el mismo `Date` para ser deterministas en
 * cualquier zona horaria del runner.
 */
describe('formato de fechas', () => {
  const iso = '2026-09-10T15:04:05.000Z';

  test('formatearFecha → DD/MM/YYYY en hora local', () => {
    const d = new Date(iso);
    const dosDigitos = (n: number) => String(n).padStart(2, '0');
    expect(formatearFecha(iso)).toBe(
      `${dosDigitos(d.getDate())}/${dosDigitos(d.getMonth() + 1)}/${d.getFullYear()}`,
    );
  });

  test('formatearHora → HH:MM en hora local', () => {
    const d = new Date(iso);
    const dosDigitos = (n: number) => String(n).padStart(2, '0');
    expect(formatearHora(iso)).toBe(`${dosDigitos(d.getHours())}:${dosDigitos(d.getMinutes())}`);
  });

  test('formatearFechaLegible une fecha y hora', () => {
    expect(formatearFechaLegible(iso)).toBe(`${formatearFecha(iso)} ${formatearHora(iso)}`);
  });

  test.each(['no-es-fecha', '2026-13-45', ''])(
    'ISO inválido (%j) se muestra tal cual',
    (noFecha) => {
      expect(formatearFecha(noFecha)).toBe(noFecha);
      expect(formatearHora(noFecha)).toBe(noFecha);
      expect(formatearFechaLegible(noFecha)).toBe(noFecha);
    },
  );
});