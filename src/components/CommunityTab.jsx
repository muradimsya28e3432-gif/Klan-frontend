import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Users, Hourglass, Loader2, Send, MessageSquare } from 'lucide-react';
import { fetchPosts, createPost, reactPost, fetchComments, addComment } from '../redux/communitySlice';
import { fmtDate, initial } from '../utils/money';

const REACTIONS = [['like', '👍'], ['fire', '🔥'], ['heart', '❤️']];
const authorOf = (p) => (p.author && p.author.username) || p.authorName || p.username || 'İstifadəçi';

function PostCard({ p }) {
  const dispatch = useDispatch();
  const comments = useSelector((s) => s.community.comments[p.id]);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');

  const toggle = () => {
    if (!open && !comments) dispatch(fetchComments(p.id));
    setOpen(!open);
  };
  const send = async () => {
    const t = text.trim();
    if (!t) return;
    const r = await dispatch(addComment({ id: p.id, text: t }));
    if (addComment.fulfilled.match(r)) setText('');
  };

  return (
    <div className="card !p-4 md:!p-5 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-pink border-2 border-pink2 font-bold flex items-center justify-center shrink-0">{initial(authorOf(p))}</div>
        <div className="min-w-0">
          <p className="text-[15px] font-bold truncate">{authorOf(p)}</p>
          <p className="text-[12px] text-tx3">{fmtDate(p.createdAt)}</p>
        </div>
      </div>

      <p className="text-[15px] text-tx whitespace-pre-wrap break-words">{p.text}</p>

      <div className="flex flex-wrap items-center gap-2">
        {REACTIONS.map(([k, e]) => {
          const on = p.myReaction === k;
          return (
            <button key={k} onClick={() => dispatch(reactPost({ id: p.id, type: k }))}
              className={`h-9 px-3 rounded-xl text-[13px] font-bold border transition ${on ? 'bg-pink/15 border-pink text-pink' : 'bg-field border-line2 text-tx2 hover:text-white'}`}>
              {e} {(p.reactions && p.reactions[k]) || 0}
            </button>
          );
        })}
        <button onClick={toggle} className="h-9 px-3 rounded-xl text-[13px] font-bold border bg-field border-line2 text-tx2 hover:text-white inline-flex items-center gap-1.5 ml-auto">
          <MessageSquare size={14} /> {p.commentsCount || 0} şərh
        </button>
      </div>

      {open && (
        <div className="border-t border-line pt-3 space-y-2.5">
          {!comments ? <Loader2 className="animate-spin text-tx3" /> : comments.length === 0 ? (
            <p className="text-[13px] text-tx3">Hələ şərh yoxdur.</p>
          ) : comments.map((c, i) => (
            <div key={c.id || i} className="row-item !py-2 text-[14px]">
              <strong className="text-pink">{authorOf(c)}:</strong> <span className="text-tx">{c.text}</span>
            </div>
          ))}
          <div className="flex gap-2">
            <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} maxLength={300} placeholder="Şərh yaz..." className="input !h-11" />
            <button onClick={send} aria-label="Göndər" className="btn btn-primary !h-11 !w-11 !px-0 shrink-0"><Send /></button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CommunityTab() {
  const dispatch = useDispatch();
  const { posts, loading, missing, posting } = useSelector((s) => s.community);
  const [text, setText] = useState('');

  useEffect(() => { dispatch(fetchPosts()); }, [dispatch]);

  const publish = async () => {
    const t = text.trim();
    if (!t) return;
    const r = await dispatch(createPost(t));
    if (createPost.fulfilled.match(r)) setText('');
  };

  return (
    <div className="page-wrap max-w-[800px] flex-grow">
      <div className="flex items-center gap-4 mb-6">
        <div className="icon-tile"><Users size={28} /></div>
        <div>
          <h2 className="title-page">İc<span className="text-pink">ma</span></h2>
          <p className="text-sub mt-1">Paylaşımlar, şərhlər və reaksiyalar.</p>
        </div>
      </div>

      {missing ? (
        <div className="card text-center py-12">
          <Hourglass size={56} className="mx-auto text-violet mb-4" />
          <p className="title-card">İcma tezliklə aktiv olacaq</p>
          <p className="text-sub mt-1">Server tərəfi hələ hazır deyil. Bir az sonra yenidən yoxlayın.</p>
        </div>
      ) : (
        <>
          <div className="card mb-5 space-y-3">
            <textarea value={text} onChange={(e) => setText(e.target.value)} maxLength={500} placeholder="Nə düşünürsən?" className="input !h-24 py-3 resize-none" />
            <div className="flex items-center justify-between gap-3">
              <span className="hint">{text.length}/500</span>
              <button onClick={publish} disabled={posting || !text.trim()} className="btn btn-primary">
                {posting ? <Loader2 className="animate-spin" /> : <Send />} Paylaş
              </button>
            </div>
          </div>

          {loading && posts.length === 0 && <Loader2 className="animate-spin text-tx3" />}
          {!loading && posts.length === 0 && <p className="text-sub">Hələ paylaşım yoxdur. İlk paylaşımı sən et!</p>}

          <div className="space-y-4">
            {posts.map((p) => <PostCard key={p.id} p={p} />)}
          </div>
        </>
      )}
    </div>
  );
}