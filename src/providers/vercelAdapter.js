// src/providers/vercelAdapter.js
// Minimal adapter for Vercel operations used by server-side functions.
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
  // opts may include templateProjectId, envVars
  // This is a minimal example that triggers a deployment via Vercel's deployments API.
  if (!VERCEL_TOKEN || !VERCEL_PROJECT_ID) {
    return { url: null, ok: false, reason: 'vercel not configured' };
  }

  const apiUrl = `https://api.vercel.com/v13/deployments`;
  const payload = {
    name: `env-${linkId}`,
    // Add real fields as needed per Vercel API
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
  // Trigger a deploy hook or set a project-level flag. Here we prefer deploy hook via env var
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
