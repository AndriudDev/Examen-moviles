import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { color, sombra, tamano } from './tema';

let registrarLlamada: ((mensaje: string) => void) | undefined;

/**
 * Punto de entrada para cualquier pantalla: pide que se muestre el toast
 * de confirmación alojado en la raíz de la app.
 */
export function mostrarToast(mensaje: string): void {
  registrarLlamada?.(mensaje);
}

/** Cuánto tiempo permanece visible antes de desvanecerse (como LENGTH_SHORT nativo). */
const DURACION_VISIBLE_MS = 2200;

/** Manejador del timer de auto-ocultado del toast (`setTimeout` de RN devuelve `number`). */
type TimerAutoOcultado = number;

/**
 * Toast de confirmación global (style.md §3.1: superficie elevada, borde de
 * éxito y sombra nivel 2). Vive en la raíz (`_layout.tsx`) para sobrevivir a
 * la navegación: tras guardar un avistamiento se muestra el aviso y la
 * pantalla pasa al listado sin perder el mensaje. Sin dependencias: aparece
 * y desaparece con Animated y se auto-oculta con un timer.
 */
export function ToastEnraiz() {
  const [toast, setToast] = useState<{ id: number; mensaje: string } | null>(null);
  const opacidad = useRef(new Animated.Value(0)).current;
  const timer = useRef<TimerAutoOcultado | undefined>(undefined);

  useEffect(() => {
    registrarLlamada = (mensaje: string) => {
      // Una nueva llamada reemplaza al aviso anterior: cancela su ocultado.
      clearTimeout(timer.current);
      opacidad.stopAnimation();
      setToast({ id: Date.now(), mensaje });
      Animated.timing(opacidad, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }).start(() => {
        timer.current = setTimeout(() => {
          Animated.timing(opacidad, {
            toValue: 0,
            duration: 260,
            useNativeDriver: true,
          }).start(() => setToast(null));
        }, DURACION_VISIBLE_MS);
      });
    };
    return () => {
      registrarLlamada = undefined;
      clearTimeout(timer.current);
      opacidad.stopAnimation();
    };
  }, [opacidad]);

  if (!toast) {
    return null;
  }

  return (
    <Animated.View pointerEvents="none" style={[estilo.contenedor, { opacity: opacidad }]}>
      <View style={estilo.tarjeta}>
        <Text style={estilo.icono}>✓</Text>
        <Text style={estilo.mensaje} numberOfLines={2}>
          {toast.mensaje}
        </Text>
      </View>
    </Animated.View>
  );
}

const estilo = StyleSheet.create({
  /** Contenedor absoluto sobre todo el Stack; centra la tarjeta al ancho de la pantalla. */
  contenedor: {
    position: 'absolute',
    left: 0,
    right: 0,
    // Sobre el FAB del listado (64px + margen 24px): el aviso no tapa la acción nueva.
    bottom: tamano.espacioGrande + 72,
    alignItems: 'center',
  },
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tamano.espacio,
    backgroundColor: color.superficieElevada,
    borderWidth: 1,
    borderColor: color.exito,
    borderRadius: tamano.radioPildora,
    paddingVertical: 12,
    paddingHorizontal: tamano.espacio,
    maxWidth: '88%',
    ...sombra.nivel2,
  },
  icono: {
    color: color.verdeClaro, // ✓ AA sobre superficieElevada (6.8:1)
    fontSize: 18,
    fontWeight: '700',
  },
  mensaje: {
    color: color.texto,
    fontSize: 16,
    fontWeight: '600',
  },
});