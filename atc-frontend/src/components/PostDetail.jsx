import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

function formatRelative(iso) {
    if (!iso) return 'N/A';
    const then = new Date(iso);
    const diffMs = Date.now() - then.getTime();
    const sec = Math.floor(diffMs / 1000), min = Math.floor(sec / 60), hr = Math.floor(min / 60), day = Math.floor(hr / 24);
    if (sec < 45) return 'just now';
    if (min < 60) return `${min} min${min === 1 ? '' : 's'} ago`;
    if (hr < 24) return `${hr} hour${hr === 1 ? '' : 's'} ago`;
    if (day < 7) return `${day} day${day === 1 ? '' : 's'} ago`;
    return then.toLocaleString();
}

function Skeleton() {
    return (
        <div className="pd-card" aria-busy="true" aria-live="polite">
            <div style={{ height: 20, background: 'rgba(77,166,111,0.14)', borderRadius: 8, marginBottom: 10 }} />
            <div style={{ height: 14, background: 'rgba(77,166,111,0.10)', borderRadius: 8, marginBottom: 6 }} />
            <div style={{ height: 14, background: 'rgba(77,166,111,0.10)', borderRadius: 8, marginBottom: 6, width: '80%' }} />
            <div style={{ height: 14, background: 'rgba(77,166,111,0.10)', borderRadius: 8, marginBottom: 6, width: '60%' }} />
        </div>
    );
}

export default function PostDetail({ postId, onBack }) {
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showNLP, setShowNLP] = useState(false);
    const [showRaw, setShowRaw] = useState(false);

    // Instant paint from history.state if provided
    useEffect(() => {
        const cached = history.state?.post;
        if (cached && cached.id === postId) setPost((p) => p || cached);
    }, [postId]);

    useEffect(() => {
        if (!postId) return;
        const ctrl = new AbortController();
        setLoading(true); setError('');

        axios.get(`http://localhost:5000/api/posts/${postId}`, { signal: ctrl.signal })
            .then(res => setPost(res.data))
            .catch(err => {
                if (err.name !== 'AbortError' && err.name !== 'CanceledError') setError(err?.response?.data?.message || err?.message || 'Failed to fetch post');
            })
            .finally(() => setLoading(false));

        return () => ctrl.abort();
    }, [postId]);

    const media = useMemo(() => {
        const m = post?.media || [];
        return Array.isArray(m) ? m.slice(0, 4) : [];
    }, [post]);

    const nlp = post?.nlp || null;
    const sentimentScore = typeof nlp?.sentiment_score === 'number' ? Math.min(1, Math.max(0, nlp.sentiment_score)) : null;
    const categories = Array.isArray(nlp?.categories) ? nlp.categories : [];
    const keywords = Array.isArray(nlp?.keywords) ? nlp.keywords : [];
    const entities = Array.isArray(nlp?.entities) ? nlp.entities : [];
    const toxicity = (nlp?.toxicity && typeof nlp.toxicity === 'object') ? nlp.toxicity : null;

    return (
        <div>
            <style>{`
        .pd-card{ border:1px solid rgba(29,43,29,0.08); border-radius:16px; padding:14px; background: linear-gradient(180deg,#ffffff,#fffdf6); box-shadow:0 10px 30px rgba(41,63,41,0.10); }
        .pd-badge{ display:inline-flex; align-items:center; gap:6px; padding:4px 8px; border-radius:999px; border:1px solid rgba(29,43,29,0.10); background:#f7faf6; color:#1f2a1f; font-size:12px; }
        .pd-btn{ height:32px; padding:0 12px; border-radius:10px; border:1px solid rgba(29,43,29,0.12); color:#1f2a1f; background: linear-gradient(135deg,#e9f7ef,#dff3ea); cursor:pointer; }
        .pd-row{ display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
        .pd-media{ display:grid; gap:8px; grid-template-columns:repeat(2, minmax(0,1fr)); margin:10px 0; }
        .pd-media img, .pd-media video{ width:100%; border-radius:10px; border:1px solid rgba(29,43,29,0.10); }
        .pd-actions{ display:flex; gap:8px; flex-wrap:wrap; margin-bottom:10px; }
        .pd-danger{ color:#7a2b2b; }
        .bar{ width:140px; height:8px; background:#e3efe7; border-radius:999px; overflow:hidden; border:1px solid rgba(29,43,29,0.10); }
        .bar-fill{ height:100%; background:#4da66f; }
        .bar-warn{ background:#c97a7a; }
        .nlp-grid{ display:grid; gap:10px; }
      `}</style>

            <div className="pd-actions">
                <button onClick={onBack} className="pd-btn" aria-label="Back to list">Back</button>
                <button
                    className="pd-btn"
                    onClick={() => {
                        setLoading(true); setError('');
                        const ctrl = new AbortController();
                        axios.get(`http://localhost:5000/api/posts/${postId}`, { signal: ctrl.signal })
                            .then(res => setPost(res.data))
                            .catch(err => {
                                if (err.name !== 'AbortError' && err.name !== 'CanceledError') setError(err?.response?.data?.message || err?.message || 'Failed to fetch post');
                            })
                            .finally(() => setLoading(false));
                    }}
                    aria-label="Refresh"
                >
                    Refresh
                </button>
                {post?.text && (
                    <button className="pd-btn" onClick={() => navigator.clipboard.writeText(post.text)} aria-label="Copy text">
                        Copy text
                    </button>
                )}
            </div>

            {loading && <Skeleton />}

            {!loading && error && (
                <div className="pd-card pd-danger" role="alert">
                    {error}
                    <div style={{ marginTop:8 }}>
                        <button className="pd-btn" onClick={() => { setLoading(true); setError(''); setTimeout(()=>setLoading(false), 300); }}>
                            Retry
                        </button>
                    </div>
                </div>
            )}

            {!loading && !error && post && (
                <article className="pd-card">
                    <header style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
                        <div aria-hidden style={{
                            width:36, height:36, borderRadius:'50%', display:'grid', placeItems:'center',
                            color:'#0f2d1d', fontWeight:600,
                            background:'conic-gradient(from 180deg, #bfe8c9, #7ecf9d 40%, #4da66f 70%, #bfe8c9)',
                            border:'1px solid rgba(29,43,29,0.12)',
                        }}>{(post.user || 'U')[0].toUpperCase()}</div>
                        <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontWeight:700 }}>{post.user || 'Unknown'}</div>
                            <div style={{ fontSize:12, color:'#5a6b58' }}>{formatRelative(post.created_at)} {post.created_at && `(${new Date(post.created_at).toLocaleString()})`}</div>
                        </div>
                        <div className="pd-row">
                            {typeof post.likes === 'number' && <span className="pd-badge">❤ {post.likes.toLocaleString()}</span>}
                            {typeof post.retweets === 'number' && <span className="pd-badge">↻ {post.retweets.toLocaleString()}</span>}
                        </div>
                    </header>

                    <section style={{ color: '#394a3b', marginBottom: 10, whiteSpace: 'pre-wrap', lineHeight: 1.35 }}>
                        {post.text || 'No content available.'}
                    </section>

                    {!!media.length && (
                        <section className="pd-media" aria-label="Attachments">
                            {media.map((m, i) =>
                                m.type === 'video' ? <video key={i} src={m.url} controls /> : <img key={i} src={m.url} alt={`media ${i+1}`} />
                            )}
                        </section>
                    )}

                    <section className="pd-row" style={{ marginBottom:10 }}>
                        <span className="pd-badge">📍 {post.location_text || 'N/A'}</span>
                        {typeof post.confidence === 'number' && <span className="pd-badge">✅ Confidence {Math.round(post.confidence*100)}%</span>}
                    </section>

                    {/* Visual NLP panel */}
                    {nlp && (
                        <section aria-label="NLP analysis" style={{ marginTop: 10 }}>
                            <div className="nlp-grid">
                                {/* Sentiment */}
                                {(nlp.sentiment || sentimentScore != null) && (
                                    <div>
                                        <div style={{ fontSize:12, color:'#5a6b58', marginBottom:4 }}>Sentiment</div>
                                        <div className="pd-row">
                                            {nlp.sentiment && <span className="pd-badge">🧭 {String(nlp.sentiment).toUpperCase()}</span>}
                                            {sentimentScore != null && (
                                                <>
                                                    <div className="bar"><div className="bar-fill" style={{ width: `${Math.round(sentimentScore*100)}%` }} /></div>
                                                    <span style={{ fontSize:12, color:'#5a6b58' }}>{Math.round(sentimentScore*100)}%</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Keywords */}
                                {keywords.length > 0 && (
                                    <div>
                                        <div style={{ fontSize:12, color:'#5a6b58', marginBottom:4 }}>Top keywords</div>
                                        <div className="pd-row">
                                            {keywords.slice(0, 10).map((k, i) => <span key={i} className="pd-badge">🏷 {k}</span>)}
                                        </div>
                                    </div>
                                )}

                                {/* Entities */}
                                {entities.length > 0 && (
                                    <div>
                                        <div style={{ fontSize:12, color:'#5a6b58', marginBottom:4 }}>Named entities</div>
                                        <div style={{ display:'grid', gap:6 }}>
                                            {entities.slice(0, 8).map((e, i) => (
                                                <div key={i} className="pd-row">
                                                    <span className="pd-badge">{e.type || 'ENTITY'}</span>
                                                    <span>{e.text}</span>
                                                    {'score' in e && <span className="pd-badge">conf {Math.round((e.score ?? 0)*100)}%</span>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Categories */}
                                {categories.length > 0 && (
                                    <div>
                                        <div style={{ fontSize:12, color:'#5a6b58', marginBottom:4 }}>Categories</div>
                                        <div style={{ display:'grid', gap:6 }}>
                                            {categories.slice(0, 6).map((c, i) => (
                                                <div key={i} className="pd-row">
                                                    <span className="pd-badge">{c.name || 'Category'}</span>
                                                    {'score' in c && <>
                                                        <div className="bar"><div className="bar-fill" style={{ width: `${Math.round((c.score ?? 0)*100)}%` }} /></div>
                                                        <span style={{ fontSize:12, color:'#5a6b58' }}>{Math.round((c.score ?? 0)*100)}%</span>
                                                    </>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Safety / Toxicity */}
                                {toxicity && (
                                    <div>
                                        <div style={{ fontSize:12, color:'#5a6b58', marginBottom:4 }}>Safety</div>
                                        <div style={{ display:'grid', gap:6 }}>
                                            {Object.entries(toxicity).slice(0, 6).map(([k, v]) => {
                                                const val = Math.min(1, Math.max(0, Number(v) || 0));
                                                return (
                                                    <div key={k} className="pd-row">
                                                        <span className="pd-badge">{k}</span>
                                                        <div className="bar">
                                                            <div className="bar-fill bar-warn" style={{ width: `${Math.round(val*100)}%` }} />
                                                        </div>
                                                        <span style={{ fontSize:12, color:'#5a6b58' }}>{Math.round(val*100)}%</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Raw JSON toggle for debugging */}
                            <div style={{ marginTop:10 }}>
                                <button className="pd-btn" onClick={() => setShowRaw(r => !r)} aria-expanded={showRaw}>
                                    {showRaw ? 'Hide raw JSON' : 'Show raw JSON'}
                                </button>
                                {showRaw && (
                                    <pre style={{ background:'#f7faf6', border:'1px solid rgba(29,43,29,0.10)', padding:10, borderRadius:10, whiteSpace:'pre-wrap', marginTop:8 }}>
                    {JSON.stringify(nlp, null, 2)}
                  </pre>
                                )}
                            </div>
                        </section>
                    )}
                </article>
            )}
        </div>
    );
}
