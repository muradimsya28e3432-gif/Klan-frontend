// Backend məbləğləri qəpiklə saxlayır: 100 qəpik = 1 AZN
export const azn = (q = 0) => `${(q / 100).toFixed(2)} AZN`;
export const toQepik = (v) => Math.round(Number(String(v).replace(',', '.')) * 100);
export const initial = (name = '?') => (name[0] || '?').toUpperCase();
export const fmtDate = (d) => new Date(d).toLocaleString('az-AZ', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
export const fmtCard = (v) => String(v).replace(/\D/g, '').slice(0, 19).replace(/(.{4})/g, '$1 ').trim();