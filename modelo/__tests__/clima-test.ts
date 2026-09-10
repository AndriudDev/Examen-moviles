import { traducirCodigoWmo } from '../clima';

/**
 * Traducción WMO → texto + ícono (RF-02, patrón Factory en stack.md §9):
 * la tabla de stack.md §6.3 con los límites exactos de cada rango.
 */
describe('traducirCodigoWmo', () => {
  const casos: Array<[number, string, string]> = [
    [0, 'Despejado', '☀️'],
    [1, 'Mayormente despejado', '🌤️'],
    [2, 'Mayormente despejado', '🌤️'],
    [3, 'Nublado', '☁️'],
    [45, 'Niebla', '🌫️'],
    [48, 'Niebla', '🌫️'],
    [51, 'Llovizna', '🌦️'],
    [57, 'Llovizna', '🌦️'],
    [61, 'Lluvia', '🌧️'],
    [67, 'Lluvia', '🌧️'],
    [71, 'Nieve', '❄️'],
    [77, 'Nieve', '❄️'],
    [80, 'Chubascos', '🌦️'],
    [82, 'Chubascos', '🌦️'],
    [85, 'Chubascos de nieve', '🌨️'],
    [86, 'Chubascos de nieve', '🌨️'],
    [95, 'Tormenta', '⛈️'],
    [99, 'Tormenta', '⛈️'],
  ];

  test.each(casos)('código WMO %i → «%s» (%s)', (codigo, condicion, icono) => {
    expect(traducirCodigoWmo(codigo)).toEqual({ condicion, icono });
  });

  test.each([-1, 4, 50, 58, 68, 78, 83, 87, 100])(
    'código fuera de la tabla (%i) → «Condición desconocida»',
    (codigo) => {
      expect(traducirCodigoWmo(codigo)).toEqual({ condicion: 'Condición desconocida', icono: '❔' });
    },
  );
});