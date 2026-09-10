import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { View } from 'react-native';

import { color } from '../vista/tema';
import { ToastEnraiz } from '../vista/Toast';

/**
 * Tema del navegador de pila (expo-router): sin él, el header web se
 * pinta con el tema claro por defecto (fondo gris, borde #D8D8D8).
 * Se define con los mismos colores de `vista/tema.ts` para que el
 * chrome del Stack se funda con el cuerpo de la app.
 */
const temaOscuro = {
  dark: true,
  colors: {
    primary: color.verdeClaro,
    background: color.fondo,
    card: color.superficie,
    text: color.texto,
    border: color.borde,
    notification: color.peligro,
  } as const,
  fonts: DefaultTheme.fonts,
};

/**
 * Layout raíz: navegación tipo pila nativa (RF-06).
 * El header nativo se oculta: cada pantalla dibuja su propia cabecera
 * compartida (`vista/Cabecera.tsx`, style.md §4.1) y mantiene la vuelta
 * al origen con sus botones, además del gesto/hardware back del sistema.
 */
export default function LayoutRaiz() {
  return (
    <ThemeProvider value={temaOscuro}>
      <View style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
        {/* Confirmación toast: vive sobre el Stack para sobrevivir a la navegación. */}
        <ToastEnraiz />
      </View>
    </ThemeProvider>
  );
}