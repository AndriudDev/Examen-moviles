import { nuevaFechaLocal, nuevaId } from '../Avistamiento';

/**
 * Fábricas de entidad (RF-01/RF-04): ids únicos y fecha automática, ambos
 * usados por el controlador de registro.
 */
describe('modelo/Avistamiento — fábricas', () => {
  test('nuevaId produce ids únicos con formato base36', () => {
    const ids = Array.from({ length: 200 }, () => nuevaId());
    expect(new Set(ids).size).toBe(200);
    for (const id of ids) {
      expect(id).toMatch(/^[a-z0-9]+$/);
      expect(id.length).toBeGreaterThanOrEqual(10);
    }
  });

  test('nuevaFechaLocal es una ISO 8601 parseable del momento actual', () => {
    const antes = Date.now();
    const iso = nuevaFechaLocal();
    expect(Date.parse(iso)).not.toBeNaN();
    expect(Date.parse(iso)).toBeGreaterThanOrEqual(antes);
    expect(Date.parse(iso)).toBeLessThanOrEqual(Date.now());
  });
});