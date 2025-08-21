// functions/vercelAdapter.js
// Adapter copy placed inside functions/ so Edge Functions can import it directly at runtime.
import fetch from 'node-fetch';

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID;

function headers() {
  const h = { 'Content-Type': 'application/json' };
  if (VERCEL_TOKEN) h.Authorization = `Bearer ${VERCEL_TOKEN}`;
  return h;
}

export async function provisionEnvironment(linkId, opts = {}) {
  if (!VERCEL_TOKEN || !VERCEL_PROJECT_ID) {
    return { url: null, ok: false, reason: 'vercel not configured' };
  }

  const apiUrl = `https://api.vercel.com/v13/deployments`;
  const payload = {
    name: `env-${linkId}`,
  };

  try {
    const res = await fetch(apiUrl, { method: 'POST', headers: headers(), body: JSON.stringify(payload) });
    if (!res.ok) {
      const txt = await res.text();
      return { ok: false, reason: txt };
    }
    const data = await res.json();
    return { ok: true, url: data.url || null, data };
  } catch (e) {
    return { ok: false, reason: e.message };
  }
}

export async function setReadOnly(linkContext) {
  const hook = process.env.VERCEL_DEPLOY_HOOK_URL_READONLY;
  if (!hook) return { ok: false, reason: 'no hook' };
  try {
    const r = await fetch(hook, { method: 'POST', headers: headers(), body: JSON.stringify({ context: linkContext }) });
    return { ok: r.ok };
  } catch (e) {
    return { ok: false, reason: e.message };
  }
}

export async function setEditable(linkContext) {
  const hook = process.env.VERCEL_DEPLOY_HOOK_URL_EDITABLE;
  if (!hook) return { ok: false, reason: 'no hook' };
  try {
    const r = await fetch(hook, { method: 'POST', headers: headers(), body: JSON.stringify({ context: linkContext }) });
    return { ok: r.ok };
  } catch (e) {
    return { ok: false, reason: e.message };
  }
}
