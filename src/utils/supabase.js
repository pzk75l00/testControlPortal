// src/utils/supabase.js
// Utilidades para operar con la tabla 'enlaces' en Supabase
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://hmwywvsnmuiactttdahm.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;

// Create a singleton Supabase client to avoid multiple GoTrueClient instances
// during hot-reloading / HMR in development. We store the client on
// globalThis so it's reused across module reloads.
function getGlobalObject() {
  if (typeof window !== 'undefined') return window;
  if (typeof global !== 'undefined') return global;
  // fallback: use indirect eval to get the global object in other environments
  try {
    // eslint-disable-next-line no-new-func
    const g = Function('return this')();
    if (g) return g;
  } catch (e) {
    // ignore
  }
  return {}; // ultimate fallback
}

function createSupabaseSingleton() {
  const g = getGlobalObject();
  if (g.__supabase_client) return g.__supabase_client;

  const client = createClient(supabaseUrl, supabaseKey);

  // mark it non-enumerable to avoid accidental exposure when possible
  try {
    Object.defineProperty(g, '__supabase_client', {
      value: client,
      writable: false,
      configurable: true,
    });
  } catch (e) {
    // fallback if property can't be defined
    try {
      g.__supabase_client = client;
    } catch (err) {
      // ignore - we're on a strict environment where we can't write to global
    }
  }

  return client;
}

export const supabase = createSupabaseSingleton();

const TABLE = 'enlaces';

export async function crearEnlace(data) {
  const { data: result, error } = await supabase.from(TABLE).insert([data]);
  if (error) throw error;
  return result ? result[0] : null;
}

export async function obtenerEnlaces() {
  const { data, error } = await supabase.from(TABLE).select('*');
  if (error) {
    console.error('Error al obtener enlaces:', error.message || error);
    return [];
  }
  return data;
}

export async function actualizarEnlace(id, data) {
  const { error } = await supabase.from(TABLE).update(data).eq('id', id);
  if (error) throw error;
}

export async function borrarEnlace(id) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw error;
}
