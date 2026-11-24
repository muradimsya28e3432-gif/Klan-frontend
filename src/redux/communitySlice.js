import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../api/client';
import { logout } from './authSlice';

// comments: { [postId]: [...] }
const initialState = { posts: [], loading: false, missing: false, posting: false, comments: {} };

// GET /community/posts -> [{ id, text, author:{id,username}, createdAt, reactions:{like,fire,heart}, myReaction, commentsCount }]
export const fetchPosts = createAsyncThunk(
  'community/list',
  async (_, { rejectWithValue }) => {
    try { return await api('/community/posts?limit=30'); }
    catch (e) { return rejectWithValue(e.message, { status: e.status }); }
  },
  { condition: (_, { getState }) => !getState().community.missing },
);

// POST /community/posts { text } -> yeni post
export const createPost = createAsyncThunk('community/create', async (text, { rejectWithValue }) => {
  try { return await api('/community/posts', { method: 'POST', body: { text } }); }
  catch (e) { return rejectWithValue(e.message); }
});

// POST /community/posts/:id/react { type } -> yenilənmiş post (reactions, myReaction)
export const reactPost = createAsyncThunk('community/react', async ({ id, type }, { rejectWithValue }) => {
  try { return await api(`/community/posts/${id}/react`, { method: 'POST', body: { type } }); }
  catch (e) { return rejectWithValue(e.message); }
});

// GET /community/posts/:id/comments
export const fetchComments = createAsyncThunk('community/comments', async (id, { rejectWithValue }) => {
  try { return { id, items: await api(`/community/posts/${id}/comments?limit=50`) }; }
  catch (e) { return rejectWithValue(e.message); }
});

// POST /community/posts/:id/comments { text } -> yeni şərh
export const addComment = createAsyncThunk('community/comment', async ({ id, text }, { rejectWithValue }) => {
  try { return { id, item: await api(`/community/posts/${id}/comments`, { method: 'POST', body: { text } }) }; }
  catch (e) { return rejectWithValue(e.message); }
});

const slice = createSlice({
  name: 'community',
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(logout, () => initialState)
      .addCase(fetchPosts.pending, (s) => { s.loading = true; })
      .addCase(fetchPosts.fulfilled, (s, a) => { s.loading = false; s.posts = Array.isArray(a.payload) ? a.payload : []; })
      .addCase(fetchPosts.rejected, (s, a) => {
        s.loading = false;
        if (a.meta.status === 404) s.missing = true;
      })
      .addCase(createPost.pending, (s) => { s.posting = true; })
      .addCase(createPost.fulfilled, (s, a) => { s.posting = false; if (a.payload) s.posts.unshift(a.payload); })
      .addCase(createPost.rejected, (s) => { s.posting = false; })
      .addCase(reactPost.fulfilled, (s, a) => {
        const p = s.posts.find((x) => x.id === a.meta.arg.id);
        if (p && a.payload) Object.assign(p, a.payload);
      })
      .addCase(fetchComments.fulfilled, (s, a) => { s.comments[a.payload.id] = Array.isArray(a.payload.items) ? a.payload.items : []; })
      .addCase(addComment.fulfilled, (s, a) => {
        const { id, item } = a.payload;
        s.comments[id] = [...(s.comments[id] || []), item];
        const p = s.posts.find((x) => x.id === id);
        if (p) p.commentsCount = (p.commentsCount || 0) + 1;
      });
  },
});

export default slice.reducer;