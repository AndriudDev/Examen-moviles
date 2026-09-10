import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Clima } from '../Avistamiento';
import { consultarClima } from '../ClimaApi';

/**
 * `consultarClima` (RF-02): caché por ubicación con TTL, timeout con
 * AbortController y 1 reintento, sin red real. El `fetch` global se mockea
 * para cubrir: caché válida (sin llamada a la API), caché expirada, respuesta
 * válida, HTTP no-OK, red caída, payload inválido y fallos de la caché que
 * nunca bloquean el resultado del clima (la app guarda igual, sin clima).
 */
const COORDENADAS = { lat: -33.4489, lng: -70.6693 };
/** `claveUbicacion` redondea a ~2 decimales (≈1 km): -33.45, -70.67. */
const CLAVE_CACHE = 'avistaves.clima.-33.45.-70.67';

const fetchMock = jest.fn();
const fetchOriginal = globalThis.fetch;

afterEach(() => {
  fetchMock.mockReset();
  AsyncStorage.clear();
});

beforeAll(() => {
  (globalThis as { fetch: unknown }).fetch = fetchMock;
});

afterAll(() => {
  (globalThis as { fetch: unknown }).fetch = fetchOriginal;
});

function climaEnCache(consultadoEn: string): Clima {
  return {
    temperaturaC: 15.2,
    condicion: 'Despejado',
    icono: '☀️',
    humedadPct: 60,
    weatherCode: 0,
    consultadoEn,
  };
}

type RespuestaMock = { ok: boolean; json: () => Promise<unknown> };

const respuestaOk = (payload: unknown): RespuestaMock => ({ ok: true, json: async () => payload });
const payloadValido = () => ({
  current: { temperature_2m: 18.4, relative_humidity_2m: 62, weather_code: 61 },
});

describe('consultarClima — caché por ubicación', () => {
  test('caché válida (menos de 15 min): devuelve el clima sin llamar a la API', async () => {
    const enCache = climaEnCache(new Date().toISOString());
    await AsyncStorage.setItem(CLAVE_CACHE, JSON.stringify(enCache));

    await expect(consultarClima(COORDENADAS)).resolves.toEqual(enCache);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('caché expirada: consulta la API y reemplaza la caché', async () => {
    const expirada = climaEnCache(new Date(Date.now() - 16 * 60_000).toISOString());
    await AsyncStorage.setItem(CLAVE_CACHE, JSON.stringify(expirada));
    fetchMock.mockResolvedValue(respuestaOk(payloadValido()));

    const clima = await consultarClima(COORDENADAS);

    expect(clima?.temperaturaC).toBe(18.4);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const guardada = JSON.parse((await AsyncStorage.getItem(CLAVE_CACHE))!) as Clima;
    expect(Date.parse(guardada.consultadoEn)).toBeGreaterThan(Date.parse(expirada.consultadoEn));
  });

  test('error al leer la caché no bloquea: consulta la API igual', async () => {
    const spyGetItem = jest
      .spyOn(AsyncStorage, 'getItem')
      .mockRejectedValueOnce(new Error('caché rota'));
    fetchMock.mockResolvedValue(respuestaOk(payloadValido()));

    const clima = await consultarClima(COORDENADAS);

    expect(clima).not.toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    spyGetItem.mockRestore();
  });
});

describe('consultarClima — llamada a Open-Meteo', () => {
  test('respuesta válida: clima traducido + parámetros correctos en la URL', async () => {
    fetchMock.mockResolvedValue(respuestaOk(payloadValido()));

    const clima = await consultarClima(COORDENADAS);

    expect(clima).toMatchObject({
      temperaturaC: 18.4,
      humedadPct: 62,
      weatherCode: 61,
      condicion: 'Lluvia',
      icono: '🌧️',
    });
    const [url, opciones] = fetchMock.mock.calls[0] as [string, { signal?: unknown }];
    expect(url).toContain('latitude=-33.4489');
    expect(url).toContain('longitude=-70.6693');
    expect(url).toContain('current=temperature_2m,relative_humidity_2m,weather_code');
    expect(opciones?.signal).toBeDefined();
    // y el resultado se guarda en caché para la próxima consulta
    expect(await AsyncStorage.getItem(CLAVE_CACHE)).not.toBeNull();
  });

  test('HTTP no-OK: reintenta una vez y devuelve null', async () => {
    fetchMock.mockResolvedValue({ ok: false, json: async () => ({}) });

    await expect(consultarClima(COORDENADAS)).resolves.toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  test('red caída: reintenta una vez y devuelve null sin lanzar (RF-02)', async () => {
    fetchMock.mockRejectedValue(new Error('sin red'));

    await expect(consultarClima(COORDENADAS)).resolves.toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  test('payload inválido: null (la app guarda el registro sin clima)', async () => {
    fetchMock.mockResolvedValue(respuestaOk({ current: {} }));

    await expect(consultarClima(COORDENADAS)).resolves.toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  test('fallo al escribir la caché no descarta el clima obtenido', async () => {
    const spySetItem = jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('sin espacio'));
    fetchMock.mockResolvedValue(respuestaOk(payloadValido()));

    await expect(consultarClima(COORDENADAS)).resolves.toMatchObject({ temperaturaC: 18.4 });
    spySetItem.mockRestore();
  });
});