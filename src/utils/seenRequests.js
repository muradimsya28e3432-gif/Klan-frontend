// Oflayn olanda rədd edilmiş istəklərin mesajı yalnız BİR dəfə göstərilsin deyə ID-ləri yadda saxlayır
const KEY = 'seenRejectedRequests';

const read = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
};

// hələ göstərilməmiş rədd olunmuş istəklər
export const unseenRejected = (items = []) => {
  const seen = new Set(read());
  return items.filter((r) => r.status === 'rejected' && !seen.has(r.id));
};

// rədd olunmuş bütün istəkləri "göstərilib" kimi qeyd edir
export const markRejectedSeen = (items = []) => {
  const ids = new Set(read());
  items.filter((r) => r.status === 'rejected').forEach((r) => ids.add(r.id));
  try { localStorage.setItem(KEY, JSON.stringify([...ids].slice(-100))); } catch { /* yer yoxdursa keçirik */ }
};