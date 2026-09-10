import type { Avistamiento } from '../../modelo/Avistamiento';
import { leerAvistamientoPorId } from '../../modelo/RepositoryAvistamientos';
import { obtenerLugarLegible } from '../ubicacion';
import { cargarAvistamientoPorId, resolverLugar } from '../ControladorDetalle';

/**
 * Controlador del detalle (RF-04): carga por id y resuelve el lugar legible.
 * El repositorio y el adaptador de ubicación se mockean; aquí se prueba la
 * orquestación (lugar guardado vs. reverse geocoding).
 */
jest.mock('../../modelo/RepositoryAvistamientos', () => ({
  leerAvistamientoPorId: jest.fn(),
}));

jest.mock('../ubicacion', () => ({
  obtenerLugarLegible: jest.fn(),
}));

const mockLeerPorId = jest.mocked(leerAvistamientoPorId);
const mockObtenerLugar = jest.mocked(obtenerLugarLegible);

function avistamiento(sobreescribe: Partial<Avistamiento> = {}): Avistamiento {
  return {
    id: 'abc',
    nombre: 'Chincol',
    cantidad: 3,
    fecha: '2026-09-10T12:00:00.000Z',
    lat: -33.4489,
    lng: -70.6693,
    fotoUri: 'file:///fotos/abc.jpg',
    creadoEn: '2026-09-10T12:00:00.000Z',
    ...sobreescribe,
  };
}

afterEach(() => {
  mockLeerPorId.mockReset();
  mockObtenerLugar.mockReset();
});

describe('cargarAvistamientoPorId', () => {
  test('devuelve el avistamiento del id', async () => {
    const registro = avistamiento();
    mockLeerPorId.mockResolvedValue(registro);

    await expect(cargarAvistamientoPorId('abc')).resolves.toEqual(registro);
  });

  test('id inexistente → undefined (la vista muestra el estado inexistente)', async () => {
    mockLeerPorId.mockResolvedValue(undefined);

    await expect(cargarAvistamientoPorId('nada')).resolves.toBeUndefined();
  });
});

describe('resolverLugar', () => {
  test('con lugar guardado lo usa sin llamar al geocoder', async () => {
    const registro = avistamiento({ lugar: 'Cerro San Cristóbal, Santiago' });

    await expect(resolverLugar(registro)).resolves.toBe('Cerro San Cristóbal, Santiago');
    expect(mockObtenerLugar).not.toHaveBeenCalled();
  });

  test('sin lugar guardado: reverse geocoding de las coordenadas (RF-04)', async () => {
    const registro = avistamiento();
    mockObtenerLugar.mockResolvedValue('Av. Providencia 123, Providencia, Santiago');

    await expect(resolverLugar(registro)).resolves.toBe('Av. Providencia 123, Providencia, Santiago');
    expect(mockObtenerLugar).toHaveBeenCalledWith(-33.4489, -70.6693);
  });

  test('geocoder sin resultado: undefined, la vista degrada con «Lugar no disponible»', async () => {
    mockObtenerLugar.mockResolvedValue(undefined);

    await expect(resolverLugar(avistamiento())).resolves.toBeUndefined();
  });
});