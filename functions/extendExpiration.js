// functions/extendExpiration.js
// Edge Function example to extend an enlace's expiration and re-enable editable app in Vercel.

import { createClient } from '@supabase/supabase-js';
import { setEditable } from './vercelAdapter';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY; // use service key in server

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, { auth: { persistSession: false } });

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const body = await req.json();
    const { id, newExpirationISO, extendMinutes } = body || {};
    if (!id) return res.status(400).json({ error: 'Missing id' });

    let newExp = null;
    if (newExpirationISO) {
      newExp = new Date(newExpirationISO).toISOString();
    } else if (extendMinutes && Number(extendMinutes) > 0) {
      const add = Number(extendMinutes);
      // fetch current expiration
      const { data: rows, error: selErr } = await supabase.from('enlaces').select('expiracion').eq('id', id).limit(1);
      if (selErr) throw selErr;
      const current = rows && rows[0] && rows[0].expiracion ? new Date(rows[0].expiracion) : new Date();
      current.setMinutes(current.getMinutes() + add);
      newExp = current.toISOString();
    } else {
      return res.status(400).json({ error: 'Provide newExpirationISO or extendMinutes' });
    }

    // Update the enlace: set new expiration, estado Active, clear adminAvisado and tiempoExtraSolicitado
    const { error: upErr } = await supabase.from('enlaces').update({
      expiracion: newExp,
      estado: 'Activo',
      adminAvisado: false,
      tiempoExtraSolicitado: false,
    }).eq('id', id);

    if (upErr) throw upErr;

    // Trigger adapter to set project editable (deploy or flag)
    try {
      await setEditable({ linkId: id });
    } catch (e) {
      console.error('Error setting editable via adapter', e);
    }

    // Optionally, update a simple app_config table to indicate editable mode (if you prefer flags over deploys)
    try {
      await supabase.from('app_config').upsert([{ key: 'app_readonly', value: false }], { onConflict: 'key' });
    } catch (e) {
      // ignore if app_config table does not exist
    }

    return res.status(200).json({ ok: true, id, newExpiration: newExp });
  } catch (err) {
    console.error('extendExpiration error', err);
    return res.status(500).json({ error: err.message || err });
  }
}
