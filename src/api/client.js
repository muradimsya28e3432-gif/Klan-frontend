// Backend ünvanı: sondakı "/" və səhvən yazılmış "/api" avtomatik silinir
const clean = (v = '') => String(v).trim().replace(/\/+$/, '').replace(/\/api$/, '');
const BASE = clean(import.meta.env.VITE_API_URL);

if (import.meta.env.PROD && !BASE) {
  console.error('VITE_API_URL təyin olunmayıb! Sorğular Netlify-a gedəcək və 404 qaytaracaq. Netlify → Environment variables bölməsində əlavə edib yenidən deploy edin.');
}

// Backend cavabı: { success, data } və ya { success:false, message }
export async function api(path, { method = 'GET', body, token } = {}) {
  const t = token === undefined ? localStorage.getItem('token') : token;
  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(t ? { Authorization: `Bearer ${t}` } : {}) },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  let json = null;
  try { json = await res.json(); } catch { /* boş cavab */ }
  if (!res.ok || !json || !json.success) {
    const err = new Error((json && json.message) || 'Xəta baş verdi');
    err.status = res.status;
    throw err;
  }
  return json.data;
}