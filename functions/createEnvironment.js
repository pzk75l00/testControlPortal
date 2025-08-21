// functions/createEnvironment.js
// Example server-side handler to provision an environment for a link.
// This function should be deployed as an Edge Function and secured.
// functions/createEnvironment.js
// Example server-side handler to provision an environment for a link.
// This function should be deployed as an Edge Function and secured.

import { createClient } from '@supabase/supabase-js';
import { provisionEnvironment } from './vercelAdapter';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, { auth: { persistSession: false } });

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const body = await req.json();
    const { id } = body || {};
    if (!id) return res.status(400).json({ error: 'Missing id' });

    // Lookup link
    const { data: rows, error: selErr } = await supabase.from('enlaces').select('*').eq('id', id).limit(1);
    if (selErr) throw selErr;
    if (!rows || rows.length === 0) return res.status(404).json({ error: 'Link not found' });
    const link = rows[0];

  // Use adapter to provision environment (Vercel for now)
  const result = await provisionEnvironment(id, { templateProjectId: process.env.VERCEL_PROJECT_ID });
  let provisionedUrl = null;
  if (result && result.ok) provisionedUrl = result.url || (result.data && result.data.url) || null;
  if (!provisionedUrl) provisionedUrl = `https://envs.example.com/${id}`;

    // Update DB to mark environment created
    const { error: upErr } = await supabase.from('enlaces').update({ entornoClienteCreado: true, url: provisionedUrl }).eq('id', id);
    if (upErr) throw upErr;

    return res.status(200).json({ link: { entornoClienteCreado: true, url: provisionedUrl } });
  } catch (err) {
    console.error('createEnvironment error', err);
    return res.status(500).json({ error: err.message || err });
  }
}
