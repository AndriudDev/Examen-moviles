import type { Avistamiento } from '../../modelo/Avistamiento';
import { leerAvistamientos } from '../../modelo/RepositoryAvistamientos';
import { cargarAvistamientos, filtrarPorNombre } from '../ControladorListado';

/**
 * Controlador del listado (RF-03): carga del repositorio ordenada por fecha
 * desc y filtro por nombre insensible a mayúsculas. El repositorio se mockea.
 */
jest.mock('../../modelo/RepositoryAvistamientos', () => ({
  leerAvistamientos: jest.fn(),
}));

const mockLeer = jest.mocked(leerAvistamientos);

function avistamiento(id: string, fecha: string, nombre = 'Chincol'): Avistamiento {
  return {
    id,
    nombre,
    cantidad: 2,
    fecha,
    lat: -33.4489,
    lng: -70.6693,
    fotoUri: 'file:///fotos/abc.jpg',
    creadoEn: fecha,
  };
}

afterEach(() => {
  mockLeer.mockReset();
});

describe('cargarAvistamientos', () => {
  test('ordena del más reciente al más antiguo por fecha', async () => {
    mockLeer.mockResolvedValue([
      avistamiento('viejo', '2026-09-09T12:00:00.000Z'),
      avistamiento('nuevo', '2026-09-11T12:00:00.000Z'),
      avistamiento('medio', '2026-09-10T12:00:00.000Z'),
    ]);

    const lista = await cargarAvistamientos();

    expect(lista.map((a) => a.id)).toEqual(['nuevo', 'medio', 'viejo']);
  });

  test('fecha ISO inválida se ordena como la más antigua', async () => {
    mockLeer.mockResolvedValue([
      avistamiento('fecha-rota', '2026-13-45'),
      avistamiento('reciente', '2026-09-11T12:00:00.000Z'),
    ]);

    const lista = await cargarAvistamientos();

    expect(lista.map((a) => a.id)).toEqual(['reciente', 'fecha-rota']);
  });

  test('sin registros devuelve lista vacía', async () => {
    mockLeer.mockResolvedValue([]);

    await expect(cargarAvistamientos()).resolves.toEqual([]);
  });
});

describe('filtrarPorNombre', () => {
  const lista = [
    avistamiento('1', '2026-09-11T12:00:00.000Z', 'Chincol del campo'),
    avistamiento('2', '2026-09-11T12:00:00.000Z', 'Golondrina chilena'),
  ];

  test('texto vacío devuelve la lista tal cual', () => {
    expect(filtrarPorNombre(lista, '')).toBe(lista);
    expect(filtrarPorNombre(lista, '   ')).toBe(lista);
  });

  test('busca por subcadena, insensible a mayúsculas y recorta espacios', () => {
    expect(filtrarPorNombre(lista, 'CHINC')).toEqual([lista[0]]);
    expect(filtrarPorNombre(lista, '  chincol  ')).toEqual([lista[0]]);
    expect(filtrarPorNombre(lista, 'lona')).toEqual([]);
    expect(filtrarPorNombre(lista, 'chile')).toEqual([lista[1]]);
  });

  test('sin coincidencias devuelve lista vacía', () => {
    expect(filtrarPorNombre(lista, 'zorro')).toEqual([]);
  });
});