import * as Location from 'expo-location';

import { capturarCoordenadas, conTiempoMaximo, obtenerLugarLegible } from '../ubicacion';

/**
 * Adaptador de ubicación (stack.md §9, patrón Adapter): expo-location se
 * mockea para probar permisos, GPS con timeout y reverse geocoding sin
 * periféricos ni red.
 */
jest.mock('expo-location', () => ({
  Accuracy: { High: 5 },
  getForegroundPermissionsAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  reverseGeocodeAsync: jest.fn(),
}));

const mockPermisoActual = jest.mocked(Location.getForegroundPermissionsAsync);
const mockPedirPermiso = jest.mocked(Location.requestForegroundPermissionsAsync);
const mockPosicion = jest.mocked(Location.getCurrentPositionAsync);
const mockReverseGeocode = jest.mocked(Location.reverseGeocodeAsync);

const permiso = (granted: boolean) => ({ granted } as never);

afterEach(() => {
  jest.useRealTimers();
  jest.clearAllMocks();
});

describe('capturarCoordenadas (RF-01)', () => {
  test('con permiso concedido captura directo, sin pedirlo de nuevo', async () => {
    mockPermisoActual.mockResolvedValue(permiso(true));
    mockPosicion.mockResolvedValue({
      coords: { latitude: -33.4489, longitude: -70.6693 },
    } as never);

    await expect(capturarCoordenadas()).resolves.toEqual({ lat: -33.4489, lng: -70.6693 });
    expect(mockPedirPermiso).not.toHaveBeenCalled();
  });

  test('sin permiso: lo pide y, si lo concede, captura igual', async () => {
    mockPermisoActual.mockResolvedValue(permiso(false));
    mockPedirPermiso.mockResolvedValue(permiso(true));
    mockPosicion.mockResolvedValue({ coords: { latitude: 1, longitude: 2 } } as never);

    await expect(capturarCoordenadas()).resolves.toEqual({ lat: 1, lng: 2 });
    expect(mockPedirPermiso).toHaveBeenCalledTimes(1);
  });

  test('permiso rechazado: lanza con aviso claro y la app no se rompe', async () => {
    mockPermisoActual.mockResolvedValue(permiso(false));
    mockPedirPermiso.mockResolvedValue(permiso(false));

    await expect(capturarCoordenadas()).rejects.toThrow('GPS');
    expect(mockPosicion).not.toHaveBeenCalled();
  });

  test('GPS sin señal: propaga el error para que la vista muestre el fallo', async () => {
    mockPermisoActual.mockResolvedValue(permiso(true));
    mockPosicion.mockRejectedValue(new Error('GPS sin señal'));

    await expect(capturarCoordenadas()).rejects.toThrow('GPS sin señal');
  });
});

describe('conTiempoMaximo', () => {
  test('promesa que llega a tiempo: devuelve su valor', async () => {
    await expect(conTiempoMaximo(Promise.resolve('ok'), 5_000)).resolves.toBe('ok');
  });

  test('promesa que excede el límite: rechaza con el aviso de operación lenta', async () => {
    jest.useFakeTimers();
    const lenta = Promise.withResolvers<string>().promise;
    const pendiente = conTiempoMaximo(lenta, 1_000);
    const esperaRechazo = expect(pendiente).rejects.toThrow('La operación tardó demasiado.');

    jest.advanceTimersByTime(1_000);
    await esperaRechazo;
  });
});

describe('obtenerLugarLegible (RF-04)', () => {
  test('sin permiso: undefined y no consulta el geocoder', async () => {
    mockPermisoActual.mockResolvedValue(permiso(false));

    await expect(obtenerLugarLegible(-33.4489, -70.6693)).resolves.toBeUndefined();
    expect(mockReverseGeocode).not.toHaveBeenCalled();
  });

  test('con permiso: devuelve la dirección formateada del geocoder', async () => {
    mockPermisoActual.mockResolvedValue(permiso(true));
    mockReverseGeocode.mockResolvedValue([{ formattedAddress: 'Av. Providencia 123, Santiago' }] as never);

    await expect(obtenerLugarLegible(1, 2)).resolves.toBe('Av. Providencia 123, Santiago');
    expect(mockReverseGeocode).toHaveBeenCalledWith({ latitude: 1, longitude: 2 });
  });

  test('dirección armada por componentes cuando no hay formattedAddress', async () => {
    mockPermisoActual.mockResolvedValue(permiso(true));
    mockReverseGeocode.mockResolvedValue([
      { name: 'Mirador', streetNumber: 123, street: 'Av. Norte', district: 'Centro', city: 'Santiago' },
    ] as never);

    await expect(obtenerLugarLegible(1, 2)).resolves.toBe(
      'Mirador, 123 Av. Norte, Centro, Santiago',
    );
  });

  test('geocoder sin resultados: undefined', async () => {
    mockPermisoActual.mockResolvedValue(permiso(true));
    mockReverseGeocode.mockResolvedValue([]);

    await expect(obtenerLugarLegible(1, 2)).resolves.toBeUndefined();
  });

  test('error del geocoder: undefined, nunca lanza (RF-04 degrada «no disponible»)', async () => {
    mockPermisoActual.mockResolvedValue(permiso(true));
    mockReverseGeocode.mockRejectedValue(new Error('sin red'));

    await expect(obtenerLugarLegible(1, 2)).resolves.toBeUndefined();
  });

  test('geocoding lento: timeout a los 8 s y undefined', async () => {
    jest.useFakeTimers();
    mockPermisoActual.mockResolvedValue(permiso(true));
    mockReverseGeocode.mockImplementation(() => Promise.withResolvers().promise);

    const pendiente = obtenerLugarLegible(1, 2);
    const espera = expect(pendiente).resolves.toBeUndefined();

    await jest.advanceTimersByTimeAsync(8_000);
    await espera;
  });
});