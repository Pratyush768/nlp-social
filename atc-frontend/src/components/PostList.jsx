// PostList.jsx (Nature / Premium + UX polish)
import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import PostCard from './PostCard';

function ShimmerList({ count = 6 }) {
  return (
      <div className="nl-grid enter-anim">
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="nl-card shimmer" />
        ))}
      </div>
  );
}

export default function PostList({ onSelectPost }) {
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(() => {
    const saved = Number(localStorage.getItem('perPage') || 10);
    return Number.isFinite(saved) && saved > 0 ? saved : 10;
  });
  const [query, setQuery] = useState(() => localStorage.getItem('query') || '');
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [sortBy, setSortBy] = useState('recent'); // recent | likes | retweets
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const cacheRef = useRef(new Map());

  // Debounce the search box for snappier typing
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 250);
    return () => clearTimeout(t);
  }, [query]);

  // Persist basic prefs
  useEffect(() => localStorage.setItem('perPage', String(perPage)), [perPage]);
  useEffect(() => localStorage.setItem('query', query), [query]);

  // Fetch page (with cache + abort)
  useEffect(() => {
    const ctrl = new AbortController();
    const key = `${page}-${perPage}`;
    const cached = cacheRef.current.get(key);

    setError('');
    setLoading(!cached);
    if (cached) {
      setPosts(cached.posts);
      setTotal(cached.total);
    }

    async function fetchPage() {
      try {
        const res = await axios.get('http://localhost:5000/api/posts', {
          params: { page, per_page: perPage },
          signal: ctrl.signal,
        });
        const data = res.data || { posts: [], total: 0 };
        cacheRef.current.set(key, data);
        setPosts(data.posts);
        setTotal(data.total);
        setLastUpdated(Date.now());
      } catch (e) {
        if (e.name !== 'CanceledError' && e.name !== 'AbortError') {
          setError(e?.response?.data?.message || e?.message || 'Failed to fetch posts');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchPage();
    return () => ctrl.abort();
  }, [page, perPage]);

  // Prefetch next page into cache for instant Next press
  useEffect(() => {
    const nextPage = page + 1;
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    if (nextPage > totalPages) return;
    const nextKey = `${nextPage}-${perPage}`;
    if (cacheRef.current.has(nextKey)) return;

    const ctrl = new AbortController();
    axios
        .get('http://localhost:5000/api/posts', {
          params: { page: nextPage, per_page: perPage },
          signal: ctrl.signal,
        })
        .then((res) => {
          const data = res.data || { posts: [], total: 0 };
          cacheRef.current.set(nextKey, data);
        })
        .catch(() => {/* silent prefetch failure */});
    return () => ctrl.abort();
  }, [page, perPage, total]);

  // Smooth scroll to top on page change for better continuity
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  // Keyboard shortcuts: ←/→ paginate, "/" focus search
  const searchRef = useRef(null);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') setPage((p) => p + 1);
      if (e.key === 'ArrowLeft') setPage((p) => Math.max(1, p - 1));
      if (e.key === '/' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Derived data: filter + sort on current page
  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    let arr = posts;
    if (q) {
      arr = arr.filter((p) =>
          (p.text || '').toLowerCase().includes(q) ||
          (p.user || '').toLowerCase().includes(q)
      );
    }
    if (sortBy === 'likes') {
      arr = [...arr].sort((a, b) => (b.likes || 0) - (a.likes || 0));
    } else if (sortBy === 'retweets') {
      arr = [...arr].sort((a, b) => (b.retweets || 0) - (a.retweets || 0));
    } else {
      arr = [...arr].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    }
    return arr;
  }, [posts, debouncedQuery, sortBy]);

  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const handleRefresh = () => {
    cacheRef.current.delete(`${page}-${perPage}`);
    setLoading(true);
    setError('');
    setPerPage((p) => p); // retrigger
  };

  const start = total ? (page - 1) * perPage + 1 : 0;
  const end = total ? Math.min(total, page * perPage) : 0;

  // Export current page (filtered) to JSON (nice for quick checks)
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `posts_page_${page}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
      <div className="nl-wrap" role="region" aria-label="Posts list">
        {/* Nature palette + component styles */}
        <style>{`
        :root{
          --nl-bg:#f4f7f3; --nl-surface:#ffffff; --nl-soft:#f7faf6;
          --nl-ink:#1f2a1f; --nl-dim:#5a6b58;
          --nl-leaf:#2f8f5b; --nl-moss:#4da66f; --nl-mint:#bfe8c9; --nl-cream:#fffdf6;
          --nl-border:rgba(29,43,29,0.08); --nl-shadow:0 10px 30px rgba(41,63,41,0.08);
          --nl-glass:rgba(255,255,255,0.7);
        }
        .nl-wrap{
          color:var(--nl-ink);
          background:
            radial-gradient(1400px 600px at 10% -10%, rgba(191,232,201,0.45), transparent 60%),
            radial-gradient(1200px 500px at 110% -20%, rgba(116,174,138,0.25), transparent 60%),
            var(--nl-bg);
          border-radius:18px; padding:18px;
        }
        .nl-hero{
          background:
            linear-gradient(180deg, rgba(255,255,255,0.85), rgba(255,255,255,0.75)),
            radial-gradient(800px 120px at 10% 0%, rgba(191,232,201,0.35), transparent 60%),
            radial-gradient(800px 120px at 90% 0%, rgba(77,166,111,0.2), transparent 60%);
          backdrop-filter:saturate(150%) blur(6px);
          border:1px solid var(--nl-border); border-radius:16px;
          padding:16px; display:flex; align-items:center; justify-content:space-between; margin-bottom:14px;
          box-shadow:var(--nl-shadow);
        }
        .nl-title{ font-size:20px; letter-spacing:.2px; }
        .nl-pill{ display:inline-flex; align-items:center; gap:8px; background:var(--nl-cream);
          border:1px solid var(--nl-border); border-radius:999px; padding:6px 10px; color:var(--nl-dim); }

        .nl-toolbar{
          position:sticky; top:8px; z-index:5;
          background:var(--nl-glass); backdrop-filter:blur(8px) saturate(140%);
          border:1px solid var(--nl-border); border-radius:12px; padding:10px; margin-bottom:12px;
          display:flex; align-items:center; gap:10px; box-shadow:var(--nl-shadow);
        }
        .nl-input, .nl-select{
          height:34px; border-radius:10px; border:1px solid var(--nl-border);
          background:var(--nl-soft); color:var(--nl-ink); padding:0 10px; outline:none;
        }
        .nl-input::placeholder{ color:#7a8b78; }
        .nl-btn{
          height:34px; padding:0 12px; border-radius:10px; border:1px solid var(--nl-border);
          background:linear-gradient(135deg,#e9f7ef,#dff3ea); color:var(--nl-ink); cursor:pointer;
          transition:transform .12s ease, box-shadow .12s ease, opacity .12s ease;
        }
        .nl-btn:hover{ transform:translateY(-1px); box-shadow:0 6px 16px rgba(28,58,35,0.12); }
        .nl-btn:disabled{ opacity:.45; cursor:not-allowed; transform:none; }
        .nl-line{ flex:1; height:1px; background:var(--nl-border); }
        .nl-badge{ font-size:12px; color:var(--nl-dim); }

        .nl-grid{ display:grid; gap:12px; grid-template-columns:repeat(1,minmax(0,1fr)); }
        @media (min-width:640px){ .nl-grid{ grid-template-columns:repeat(2,minmax(0,1fr)); } }
        @media (min-width:900px){ .nl-grid{ grid-template-columns:repeat(3,minmax(0,1fr)); } }

        .nl-card{
          height:138px; border-radius:14px; border:1px solid var(--nl-border);
          background:linear-gradient(180deg, var(--nl-surface), var(--nl-cream));
          box-shadow:var(--nl-shadow);
        }
        .shimmer{
          position:relative; overflow:hidden;
          background-image:linear-gradient(90deg, rgba(77,166,111,0.08), rgba(77,166,111,0.16), rgba(77,166,111,0.08));
          background-size:200% 100%; animation:nl-shimmer 1.3s linear infinite;
        }
        @keyframes nl-shimmer{ 0%{ background-position:200% 0; } 100%{ background-position:-200% 0; } }

        .nl-msg{
          border:1px dashed var(--nl-border); border-radius:12px; padding:16px; text-align:center;
          color:var(--nl-dim); background:var(--nl-soft);
        }
        .nl-pager{ display:flex; align-items:center; gap:8px; margin-top:12px; justify-content:center; }

        .enter-anim{ animation: nl-enter .18s ease-out; }
        @keyframes nl-enter{ from { opacity: .0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

        {/* Header */}
        <div className="nl-hero" aria-live="polite">
          <div className="nl-title">Posts</div>
          <div className="nl-pill">
            <span>Showing</span>
            <strong>{start ? `${start}–${end}` : '0–0'}</strong>
            <span>of</span>
            <strong>{total.toLocaleString()}</strong>
            {lastUpdated && <span style={{ marginLeft: 8, color: '#5a6b58' }}>· updated {new Date(lastUpdated).toLocaleTimeString()}</span>}
          </div>
        </div>

        {/* Toolbar */}
        <div className="nl-toolbar" role="toolbar" aria-label="List controls">
          <input
              ref={searchRef}
              className="nl-input"
              placeholder="Search text or user…  (press / to focus)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search posts"
          />
          <select
              className="nl-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort posts"
          >
            <option value="recent">Recent</option>
            <option value="likes">Likes</option>
            <option value="retweets">Retweets</option>
          </select>
          <select
              className="nl-select"
              value={perPage}
              onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
              aria-label="Per page"
          >
            {[10, 20, 50].map(n => <option key={n} value={n}>{n} / page</option>)}
          </select>
          <button className="nl-btn" onClick={handleRefresh} aria-label="Refresh">Refresh</button>
          <button className="nl-btn" onClick={exportJSON} aria-label="Export JSON">Export</button>
          <div className="nl-line" />
          <div className="nl-badge" aria-live="polite">
            {total ? `Page ${page} of ${Math.max(1, Math.ceil(total / perPage))}` : 'Ready'}
          </div>
        </div>

        {/* Content */}
        {error && (
            <div className="nl-msg" role="alert">
              {error} — <button className="nl-btn" onClick={handleRefresh} style={{ height: 28 }}>Retry</button>
            </div>
        )}

        {loading && !error && <ShimmerList count={6} />}

        {!loading && !error && filtered.length === 0 && (
            <div className="nl-msg" aria-live="polite">No posts to display.</div>
        )}

        {!loading && !error && filtered.length > 0 && (
            <div className="nl-grid enter-anim">
              {filtered.map(post => (
                  <div
                      key={post.id}
                      style={{ transition: 'transform .12s ease, box-shadow .12s ease' }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <PostCard post={post} onDetailsClick={onSelectPost} />
                  </div>
              ))}
            </div>
        )}

        {/* Pagination */}
        <div className="nl-pager" role="navigation" aria-label="Pagination">
          <button className="nl-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={!canPrev} aria-label="Previous page">Prev</button>
          <button className="nl-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={!canNext} aria-label="Next page">Next</button>
        </div>
      </div>
  );
}
