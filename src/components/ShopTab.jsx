import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ShoppingBag, Hourglass, Loader2, Check, SearchX } from 'lucide-react';
import { fetchShopItems, buyItem, equipItem } from '../redux/shopSlice';
import { azn } from '../utils/money';

const CATS = [['all', 'Hamısı'], ['avatar', 'Avatarlar'], ['frame', 'Çərçivələr'], ['badge', 'Nişanlar'], ['other', 'Digər']];

export default function ShopTab() {
  const dispatch = useDispatch();
  const { items, loading, missing } = useSelector((s) => s.shop);
  const balance = useSelector((s) => s.wallet.balance);
  const [cat, setCat] = useState('all');
  const [busy, setBusy] = useState(null);

  useEffect(() => { dispatch(fetchShopItems()); }, [dispatch]);

  const act = async (action, id) => { setBusy(id); await dispatch(action(id)); setBusy(null); };
  const shown = cat === 'all' ? items : items.filter((i) => i.category === cat);

  return (
    <div className="page-wrap max-w-[1100px] flex-grow">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="icon-tile"><ShoppingBag size={28} /></div>
          <div>
            <h2 className="title-page">Mağa<span className="text-pink">za</span></h2>
            <p className="text-sub mt-1">Avatar, çərçivə, nişan və digər virtual məhsullar.</p>
          </div>
        </div>
        <span className="badge badge-ok !h-10 !px-4 !text-[14px]">Balans: {azn(balance)}</span>
      </div>

      {missing ? (
        <div className="card text-center py-12">
          <Hourglass size={56} className="mx-auto text-violet mb-4" />
          <p className="title-card">Mağaza tezliklə aktiv olacaq</p>
          <p className="text-sub mt-1">Server tərəfi hələ hazır deyil. Bir az sonra yenidən yoxlayın.</p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {CATS.map(([v, l]) => (
              <button key={v} onClick={() => setCat(v)} className={`pill ${cat === v ? 'pill-on' : ''}`}>{l}</button>
            ))}
            {loading && <Loader2 size={18} className="animate-spin text-tx3" />}
          </div>

          {!loading && shown.length === 0 ? (
            <div className="card text-center py-12">
              <SearchX size={56} className="mx-auto text-violet mb-4" />
              <p className="title-card">Məhsul tapılmadı</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {shown.map((i) => (
                <div key={i.id} className={`card card-hover !p-4 flex flex-col text-center ${i.equipped ? 'card-glow' : ''}`}>
                  <div className="text-[48px] leading-none my-3">{i.icon || '🛍️'}</div>
                  <p className="text-[15px] font-bold truncate">{i.name}</p>
                  {i.description && <p className="text-[12px] text-tx3 mt-1 line-clamp-2">{i.description}</p>}
                  <p className="text-[16px] font-extrabold text-mint mt-2 mb-3">{azn(i.price)}</p>

                  <div className="mt-auto">
                    {i.equipped ? (
                      <button disabled className="btn btn-secondary btn-sm w-full"><Check /> İstifadədə</button>
                    ) : i.owned ? (
                      <button disabled={busy === i.id} onClick={() => act(equipItem, i.id)} className="btn btn-green btn-sm w-full">
                        {busy === i.id && <Loader2 className="animate-spin" />} İstifadə et
                      </button>
                    ) : (
                      <button disabled={busy === i.id || balance < i.price} onClick={() => act(buyItem, i.id)} className="btn btn-primary btn-sm w-full">
                        {busy === i.id && <Loader2 className="animate-spin" />} {balance < i.price ? 'Balans çatmır' : 'Al'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}