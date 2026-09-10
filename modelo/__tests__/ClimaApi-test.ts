import { construirClima } from '../ClimaApi';

/**
 * `construirClima` (payload de Open-Meteo → `Clima`) está separada del fetch
 * precisamente para probarse sin red (fase 8). Estos tests cubren el contrato:
 * payload completo → `Clima` con la condición traducida; faltante o inválido
 * → `null` (la app guarda el registro igual, sin clima, RF-02).
 */
describe('construirClima', () => {
  test('payload válido produce el Clima completo con condición traducida', () => {
    const clima = construirClima({
      current: { temperature_2m: 18.4, relative_humidity_2m: 62, weather_code: 61 },
    });

    expect(clima).not.toBeNull();
    expect(clima?.temperaturaC).toBe(18.4);
    expect(clima?.humedadPct).toBe(62);
    expect(clima?.weatherCode).toBe(61);
    expect(clima?.condicion).toBe('Lluvia');
    expect(clima?.icono).toBe('🌧️');
    expect(Date.parse(clima!.consultadoEn)).not.toBeNaN();
  });

  const casosInvalidos: Array<[string, unknown]> = [
    ['sin objeto current', {}],
    ['sin temperatura', { current: { relative_humidity_2m: 62, weather_code: 61 } }],
    ['sin humedad', { current: { temperature_2m: 18.4, weather_code: 61 } }],
    ['sin weather_code', { current: { temperature_2m: 18.4, relative_humidity_2m: 62 } }],
    [
      'campos no numéricos',
      { current: { temperature_2m: 'cálido', relative_humidity_2m: 62, weather_code: 61 } },
    ],
  ];

  test.each(casosInvalidos)('payload inválido (%s) → null', (_nombre, payload) => {
    expect(construirClima(payload as Parameters<typeof construirClima>[0])).toBeNull();
  });

  test('datos inválidos también devuelven null', () => {
    expect(construirClima(undefined as never)).toBeNull();
    expect(construirClima(null as never)).toBeNull();
  });
});