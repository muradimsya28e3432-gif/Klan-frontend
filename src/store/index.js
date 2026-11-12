import { configureStore } from '@reduxjs/toolkit';
import auth from '../redux/authSlice';
import wallet from '../redux/walletSlice';
import duel from '../redux/duelSlice';
import chat from '../redux/chatSlice';
import clans from '../redux/clansSlice';
import users from '../redux/usersSlice';
import admin from '../redux/adminSlice';
import ui from '../redux/uiSlice';

export const store = configureStore({ reducer: { auth, wallet, duel, chat, clans, users, admin, ui } });

// Token dəyişən kimi sinxron olaraq localStorage-ə yazılır (komponent effektlərindən əvvəl)
let lastToken = store.getState().auth.token;
store.subscribe(() => {
  const token = store.getState().auth.token;
  if (token === lastToken) return;
  lastToken = token;
  if (token) localStorage.setItem('token', token); else localStorage.removeItem('token');
});