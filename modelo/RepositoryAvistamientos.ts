import AsyncStorage from '@react-native-async-storage/async-storage';
import { Directory, File, Paths } from 'expo-file-system';

import type { Avistamiento } from './Avistamiento';

/**
 * Repositorio de avistamientos (RF-05).
 *
 * Fase 1: implementa únicamente la ruta de guardado que consume el registro
 * (RF-01). «AsyncStorage (metadatos) + fotos como archivos persistentes»
 * (stack.md §5): la foto capturada por la cámara vive en la caché temporal del
 * dispositivo; al guardar se copia al almacenamiento persistente de la app y
 * el registro guarda la URI de ese archivo. La lectura (listar/cargar) llega
 * con la fase de listado (RF-03).
 */
const CLAVE_LISTA = 'avistaves.registros';
const CARPETA_FOTOS = 'avistaves-fotos';

async function leerLista(): Promise<Avistamiento[]> {
  const contenido = await AsyncStorage.getItem(CLAVE_LISTA);
  if (!contenido) {
    return [];
  }
  try {
    const lista = JSON.parse(contenido);
    return Array.isArray(lista) ? lista : [];
  } catch {
    return [];
  }
}

/** Copia la foto de la caché temporal de la cámara al almacenamiento persistente. */
async function moverFotoAArchivoPersistente(avistamiento: Avistamiento): Promise<void> {
  // Web: la foto es un data URI (no hay sistema de archivos); ya es autosuficiente.
  if (avistamiento.fotoUri.startsWith('data:') || avistamiento.fotoUri.includes(`/${CARPETA_FOTOS}/`)) {
    return;
  }

  const carpeta = new Directory(Paths.document, CARPETA_FOTOS);
  carpeta.create({ idempotent: true, intermediates: true });

  const origen = new File(avistamiento.fotoUri);
  const extension = origen.extension || '.jpg';
  const destino = new File(carpeta, `${avistamiento.id}${extension}`);

  await origen.copy(destino, { overwrite: true });
  avistamiento.fotoUri = destino.uri;
}

/**
 * Guarda un avistamiento ya validado: persiste la foto y añade los metadatos
 * a AsyncStorage, de modo que sobrevivan al cierre de la app (RF-05).
 */
export async function guardarAvistamiento(avistamiento: Avistamiento): Promise<void> {
  await moverFotoAArchivoPersistente(avistamiento);

  const lista = await leerLista();
  lista.push(avistamiento);
  await AsyncStorage.setItem(CLAVE_LISTA, JSON.stringify(lista));
}