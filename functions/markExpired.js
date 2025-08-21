// functions/markExpired.js
// Scheduled Edge Function example for Supabase (or similar) to mark expired links and send notifications.
// Deploy as a scheduled function and set environment variables for email provider if needed.

import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

// ENV variables expected in function runtime
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY; // service role key for server-side updates
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY; // optional
const FROM_EMAIL = process.env.FROM_EMAIL || 'no-reply@example.com';
const VERCEL_DEPLOY_HOOK_URL_READONLY = process.env.VERCEL_DEPLOY_HOOK_URL_READONLY; // optional

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, { auth: { persistSession: false } });

export default async function handler(req, res) {
  try {
    // query expired active links
    const { data: expiredLinks, error } = await supabase
      .from('enlaces')
      .select('*')
      .eq('tipo', 'expira')
      .eq('estado', 'Activo')
      .lt('expiracion', new Date().toISOString());

    if (error) throw error;

    for (const link of expiredLinks || []) {
      // mark as Caducado and adminAvisado true
      const { error: upErr } = await supabase
        .from('enlaces')
        .update({ estado: 'Caducado', adminAvisado: true })
        .eq('id', link.id);
      if (upErr) {
        console.error('Error updating link', link.id, upErr);
        continue;
      }

      // Optional: send notification to admin or client
      if (SENDGRID_API_KEY) {
        try {
          await sendEmail(link.email, `Su enlace ha caducado`, `Hola ${link.nombre}, su enlace ha caducado.`);
        } catch (e) {
          console.error('Error sending email for link', link.id, e);
        }
      }

      // Optional: trigger Vercel deploy to a read-only build if configured
      if (VERCEL_DEPLOY_HOOK_URL_READONLY) {
        try {
          await fetch(VERCEL_DEPLOY_HOOK_URL_READONLY, { method: 'POST', body: JSON.stringify({ linkId: link.id }) });
        } catch (e) {
          console.error('Error triggering Vercel read-only deploy hook for link', link.id, e);
        }
      }
    }

    return res.status(200).json({ updated: expiredLinks.length });
  } catch (err) {
    console.error('Scheduled markExpired error', err);
    return res.status(500).json({ error: err.message || err });
  }
}

async function sendEmail(to, subject, text) {
  const body = {
    personalizations: [{ to: [{ email: to }] }],
    from: { email: FROM_EMAIL },
    subject,
    content: [{ type: 'text/plain', value: text }],
  };

  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`SendGrid error: ${res.status} ${txt}`);
  }
}
