import { createSlice, isFulfilled, isRejected } from '@reduxjs/toolkit';

// tab: duel | klans | search | wallet | profile | admin ; modal: null | createClan | topUp
const OK = {
  'clans/create/fulfilled': 'Klan yaradıldı',
  'clans/join/fulfilled': 'Klana qoşuldunuz',
  'clans/leave/fulfilled': 'Klandan çıxdınız',
  'wallet/devConfirm/fulfilled': 'Balans artırıldı',
  'wallet/requestPayout/fulfilled': 'Çıxarış sorğusu göndərildi',
  'admin/createDuel/fulfilled': 'Yeni duel yaradıldı',
  'admin/finishDuel/fulfilled': 'Duel bitirildi',
  'admin/approve/fulfilled': 'Çıxarış təsdiqləndi',
  'admin/reject/fulfilled': 'Çıxarış rədd edildi, pul qaytarıldı',
  'admin/withdraw/fulfilled': 'Gəlir çıxarıldı',
};
const CLOSE_MODAL = ['clans/create/fulfilled', 'wallet/devConfirm/fulfilled'];

const message = (a) => {
  if (a.type === 'duel/sendGift/fulfilled') return `${a.payload.gift.name} göndərildi`;
  if (a.type === 'admin/ban/fulfilled') return a.payload.isBanned ? 'İstifadəçi bloklandı' : 'Blok götürüldü';
  return OK[a.type];
};

const slice = createSlice({
  name: 'ui',
  initialState: { tab: 'duel', modal: null, toast: null },
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
      // bütün uğursuz thunk-lar xəta bildirişi göstərir (giriş formu özü göstərir)
      .addMatcher((a) => isRejected(a) && typeof a.payload === 'string' && !a.type.startsWith('auth/'), (s, a) => {
        s.toast = { id: Date.now(), type: 'error', text: a.payload };
      });
  },
});

export const { setTab, openModal, closeModal, showToast, clearToast } = slice.actions;
export default slice.reducer;