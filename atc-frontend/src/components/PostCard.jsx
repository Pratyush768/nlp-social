import React, { useMemo, useState } from 'react';
import Toast from './Toast.jsx';

const CARD_STYLE = {
    border:'1px solid rgba(29,43,29,0.08)', borderRadius:14, padding:14,
    background:'linear-gradient(180deg,#ffffff,#fffdf6)', boxShadow:'0 10px 30px rgba(41,63,41,0.08)',
    transition:'transform .12s ease, box-shadow .12s ease',
};
const BADGE_STYLE = {
    display:'inline-flex', alignItems:'center', gap:6, padding:'4px 8px',
    borderRadius:999, border:'1px solid rgba(29,43,29,0.08)', background:'#f7faf6',
    color:'#425343', fontSize:12,
};

function relativeTime(iso) {
    if (!iso) return null;
    const then = new Date(iso); if (Number.isNaN(+then)) return null;
    const diff = Date.now() - then.getTime();
    const s = Math.floor(diff/1000), m = Math.floor(s/60), h = Math.floor(m/60), d = Math.floor(h/24);
    if (s < 45) return 'just now';
    if (m < 60) return `${m} min${m === 1 ? '' : 's'} ago`;
    if (h < 24) return `${h} hour${h === 1 ? '' : 's'} ago`;
    if (d < 7) return `${d} day${d === 1 ? '' : 's'} ago`;
    return then.toLocaleString();
}

export default React.memo(function PostCard({ post, onDetailsClick }) {
    const [hover, setHover] = useState(false);
    const [toast, setToast] = useState('');
    const user = post?.user || 'Unknown';
    const rt = useMemo(() => relativeTime(post?.created_at), [post?.created_at]);
    const snippet = (post?.text || '').slice(0, 160) + ((post?.text || '').length > 160 ? '…' : '');

    const copyText = async () => { await navigator.clipboard.writeText(post?.text || ''); setToast('Copied post text'); };

    return (
        <div
            style={{ ...CARD_STYLE, transform: hover ? 'translateY(-2px)' : 'translateY(0)' }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            className="enter-anim"
        >
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
                <div aria-hidden style={{
                    width:36, height:36, borderRadius:'50%', display:'grid', placeItems:'center',
                    color:'#0f2d1d', fontWeight:600,
                    background:'conic-gradient(from 180deg, #bfe8c9, #7ecf9d 40%, #4da66f 70%, #bfe8c9)',
                    border:'1px solid rgba(29,43,29,0.12)',
                }}>{(user[0] || 'U').toUpperCase()}</div>
                <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:700, color:'#1f2a1f' }}>{user}</div>
                    <div style={{ fontSize:12, color:'#5a6b58' }}>{rt || '—'}</div>
                </div>
                <button
                    onClick={() => onDetailsClick(post.id)}
                    style={{
                        height:32, padding:'0 12px', borderRadius:10, cursor:'pointer',
                        border:'1px solid rgba(29,43,29,0.08)', color:'#1f2a1f', background:'linear-gradient(135deg,#e9f7ef,#dff3ea)',
                    }}
                >Details</button>
            </div>

            <div style={{ color:'#394a3b', marginBottom:10, lineHeight:1.35 }} dangerouslySetInnerHTML={{ __html: post._hl || snippet }} />

            <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                {typeof post?.likes === 'number' && <span style={BADGE_STYLE}>❤ {post.likes.toLocaleString()}</span>}
                {typeof post?.retweets === 'number' && <span style={BADGE_STYLE}>↻ {post.retweets.toLocaleString()}</span>}
                {post?.location_text && <span style={BADGE_STYLE}>📍 {post.location_text}</span>}
                <span style={{ marginLeft:'auto', display:'flex', gap:6 }}>
          <button onClick={copyText} style={{ ...BADGE_STYLE, cursor:'pointer' }}>Copy</button>
        </span>
            </div>

            {toast && <Toast text={toast} onDone={() => setToast('')} />}
        </div>
    );
});
