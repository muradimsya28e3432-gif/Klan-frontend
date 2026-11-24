import { createSlice, isFulfilled, isRejected } from '@reduxjs/toolkit';

// modal: null | createClan | topUp
const OK = {
  'clans/create/fulfilled': 'Klan yaradıldı',
  'clans/join/fulfilled': 'İstək göndərildi. Klan sahibinin cavabını gözləyin',
  'clans/leave/fulfilled': 'Klandan çıxdınız',
  'clans/accept/fulfilled': 'Oyunçu klana qəbul edildi',
  'clans/reject/fulfilled': 'İstək rədd edildi',
  'friends/send/fulfilled': 'Dostluq istəyi göndərildi',
  'friends/accept/fulfilled': 'Dost əlavə olundu',
  'friends/reject/fulfilled': 'İstək rədd edildi',
  'friends/remove/fulfilled': 'Dostluq silindi',
  'wallet/devConfirm/fulfilled': 'Balans artırıldı',
  'wallet/requestPayout/fulfilled': 'Çıxarış sorğusu göndərildi',
  'admin/createDuel/fulfilled': 'Yeni duel yaradıldı',
  'admin/finishDuel/fulfilled': 'Duel bitirildi',
  'admin/approve/fulfilled': 'Çıxarış təsdiqləndi',
  'admin/reject/fulfilled': 'Çıxarış rədd edildi, pul qaytarıldı',
  'admin/withdraw/fulfilled': 'Gəlir çıxarıldı',
  'admin/endSeason/fulfilled': 'Mövsüm bitirildi, medallar verildi',
  // YENİ
  'tournaments/join/fulfilled': 'Turnirə qoşuldunuz',
  'community/create/fulfilled': 'Paylaşım əlavə olundu',
  'shop/buy/fulfilled': 'Məhsul alındı',
  'shop/equip/fulfilled': 'Məhsul istifadəyə verildi',
};
const CLOSE_MODAL = ['clans/create/fulfilled', 'wallet/devConfirm/fulfilled'];
// arxa plan sorğularında xəta bildirişi göstərilmir
const SILENT = [
  'auth/', 'progress/', 'friends/list', 'friends/incoming', 'clanHub/',
  'tournaments/list', 'community/list', 'community/comments', 'shop/list',
];

const message = (a) => {
  if (a.type === 'duel/sendGift/fulfilled') return `${a.payload.gift.name} göndərildi`;
  if (a.type === 'admin/ban/fulfilled') return a.payload.isBanned ? 'İstifadəçi bloklandı' : 'Blok götürüldü';
  return OK[a.type];
};

const slice = createSlice({
  name: 'ui',
  initialState: { tab: 'home', modal: null, toast: null },
  reducers: {
    setTab: (s, a) => { s.tab = a.payload; },
    openModal: (s, a) => { s.modal = a.payload; },
    closeModal: (s) => { s.modal = null; },
    showToast: (s, a) => { s.toast = { id: Date.now(), ...a.payload }; }, // { type, text }
    clearToast: (s) => { s.toast = null; },
  },
  extraReducers: (b) => {
    b.addMatcher(isFulfilled, (s, a) => {
      const text = message(a);
      if (text) s.toast = { id: Date.now(), type: 'success', text };
      if (CLOSE_MODAL.includes(a.type)) s.modal = null;
    })
      .addMatcher((a) => isRejected(a) && typeof a.payload === 'string' && !SILENT.some((p) => a.type.startsWith(p)), (s, a) => {
        s.toast = { id: Date.now(), type: 'error', text: a.payload };
      });
  },
});

export const { setTab, openModal, closeModal, showToast, clearToast } = slice.actions;
export default slice.reducer;