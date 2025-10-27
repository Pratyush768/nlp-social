import React, { useEffect, useState } from 'react';

export default function AppShell({ title = 'Disaster Posts Viewer', sidebar, children }) {
    const [online, setOnline] = useState(navigator.onLine);
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'nature');

    useEffect(() => {
        const on = () => setOnline(true);
        const off = () => setOnline(false);
        window.addEventListener('online', on);
        window.addEventListener('offline', off);
        return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
    }, []);

    useEffect(() => {
        localStorage.setItem('theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    return (
        <div className="ns-app" data-theme={theme}>
            <style>{`
        :root{
          --bg:#f4f7f3; --ink:#1f2a1f; --dim:#5a6b58; --leaf:#2f8f5b; --moss:#4da66f;
          --soft:#f7faf6; --cream:#fffdf6; --surface:#ffffff;
          --border:rgba(29,43,29,0.08); --shadow:0 12px 40px rgba(41,63,41,0.10);
          --glass:rgba(255,255,255,0.75); --max:1280px;
        }
        [data-theme="nature-dark"]{
          --bg:#0b100d; --ink:#e7f2ea; --dim:#a9b7a8; --leaf:#8fd4aa; --moss:#b6e2c7;
          --soft:#0f1a13; --cream:#0b120d; --surface:#101713; --border:rgba(200,230,210,0.12);
          --glass:rgba(20,28,23,0.6); --shadow:0 18px 54px rgba(0,0,0,0.35);
        }
        .ns-app{
          min-height:100vh; color:var(--ink);
          background:
            radial-gradient(1400px 600px at 10% -10%, rgba(191,232,201,0.38), transparent 60%),
            radial-gradient(1200px 500px at 110% -20%, rgba(116,174,138,0.22), transparent 60%),
            var(--bg);
          display:flex; flex-direction:column;
        }
        .ns-header{ position:sticky; top:0; z-index:40; background:var(--glass); backdrop-filter: blur(8px) saturate(140%); border-bottom:1px solid var(--border); }
        .ns-topbar{ max-width:var(--max); margin:0 auto; padding:8px 18px; display:flex; align-items:center; gap:10px; justify-content:flex-end; font-size:12px; color:var(--dim); }
        .ns-topbar .pill{ padding:4px 8px; border-radius:999px; border:1px solid var(--border); background:var(--cream); }
        .ns-nav{ max-width:var(--max); margin:0 auto; padding:10px 18px 14px; display:flex; align-items:center; gap:14px; justify-content:space-between; }
        .ns-brand{ font-size:22px; font-weight:800; letter-spacing:.3px; }
        .ns-actions{ display:flex; gap:10px; }
        .ns-btn{ height:34px; padding:0 12px; border-radius:10px; cursor:pointer; border:1px solid var(--border); color:var(--ink); background: linear-gradient(135deg,#e9f7ef,#dff3ea); }
        .ns-btn:hover{ transform:translateY(-1px); box-shadow:0 8px 18px rgba(28,58,35,0.12); }
        .ns-hero{ max-width:var(--max); margin:10px auto 0; padding:0 18px 6px; }
        .ns-heroBox{
          border:1px solid var(--border); border-radius:16px; box-shadow:var(--shadow);
          background:
            linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,0.82)),
            radial-gradient(800px 100px at 10% 0%, rgba(191,232,201,0.30), transparent 60%),
            radial-gradient(800px 100px at 90% 0%, rgba(77,166,111,0.18), transparent 60%);
          padding:16px 18px; display:flex; align-items:center; justify-content:space-between; gap:10px;
        }
        .ns-subbar{ position:sticky; top:64px; z-index:35; max-width:var(--max); margin:8px auto 0; padding:0 18px 8px; }
        .ns-sub{ border:1px solid var(--border); border-radius:12px; background:var(--glass); backdrop-filter: blur(8px) saturate(140%); padding:8px 10px; box-shadow:var(--shadow); display:flex; align-items:center; gap:10px; justify-content:space-between; font-size:12px; color:var(--dim); }
        .ns-main{ max-width:var(--max); margin:12px auto; padding:0 18px 18px; display:grid; gap:14px; grid-template-columns: 1fr; align-items:start; }
        @media (min-width: 1040px){ .ns-main{ grid-template-columns: minmax(0,1fr) 340px; } }
        .ns-card{ border:1px solid var(--border); border-radius:14px; background: linear-gradient(180deg,var(--surface),var(--cream)); box-shadow:var(--shadow); }
        .ns-side{ position:sticky; top:122px; display:flex; flex-direction:column; gap:12px; }
        .ns-sideSection{ padding:14px; }
        .ns-sideTitle{ font-size:14px; color:var(--dim); margin-bottom:8px; }
        .ns-footer{ margin-top:auto; border-top:1px solid var(--border); background:var(--glass); }
        .ns-footInner{ max-width:var(--max); margin:0 auto; padding:12px 18px; font-size:12px; color:var(--dim); }
      `}</style>

            <header className="ns-header">
                <div className="ns-topbar">
                    <span className="pill" aria-live="polite">{online ? 'Online' : 'Offline'}</span>
                    <select aria-label="Theme" className="pill" value={theme} onChange={(e) => setTheme(e.target.value)} style={{ cursor:'pointer', background:'var(--cream)' }}>
                        <option value="nature">Nature light</option>
                        <option value="nature-dark">Nature dark</option>
                        <option value="system">System</option>
                    </select>
                </div>
                <div className="ns-nav">
                    <div className="ns-brand">{title}</div>
                    <div className="ns-actions">
                        <button className="ns-btn">Open Demo</button>
                        <button className="ns-btn">Docs</button>
                    </div>
                </div>
                <div className="ns-hero">
                    <div className="ns-heroBox">
                        <div>
                            <div style={{ fontSize: 16, fontWeight: 700 }}>Hyper‑Local Disaster Intelligence</div>
                            <div style={{ color: 'var(--dim)', fontSize: 13 }}>Community posts + AI insights, presented clearly and calmly</div>
                        </div>
                        <div className="ns-actions">
                            <span className="pill">Nature theme</span>
                        </div>
                    </div>
                </div>
                <div className="ns-subbar">
                    <div className="ns-sub">
                        <div>Tips: “/” focuses search, ←/→ paginates.</div>
                        <div>Palette: leaf, moss, cream, soft.</div>
                    </div>
                </div>
            </header>

            <div className="ns-main">
                <section className="ns-card" style={{ padding: 12 }}>{children}</section>

                <aside className="ns-side">
                    <div className="ns-card ns-sideSection">
                        <div className="ns-sideTitle">Today’s Snapshot</div>
                        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
                            <div><div style={{ fontSize:12, color:'var(--dim)' }}>Total</div><div style={{ fontSize:18, fontWeight:800 }}>—</div></div>
                            <div><div style={{ fontSize:12, color:'var(--dim)' }}>Incidents</div><div style={{ fontSize:18, fontWeight:800, color:'var(--leaf)' }}>—</div></div>
                            <div><div style={{ fontSize:12, color:'var(--dim)' }}>Sensors</div><div style={{ fontSize:18, fontWeight:800, color:'var(--moss)' }}>—</div></div>
                        </div>
                    </div>

                    <div className="ns-card ns-sideSection">
                        <div className="ns-sideTitle">Quick Filters</div>
                        <div style={{ display:'grid', gap:6 }}>
                            <label><input type="checkbox" /> Earthquake</label>
                            <label><input type="checkbox" /> Flood</label>
                            <label><input type="checkbox" /> Heatwave</label>
                            <label><input type="checkbox" /> Landslide</label>
                        </div>
                    </div>

                    <div className="ns-card ns-sideSection">
                        <div className="ns-sideTitle">About</div>
                        <div style={{ color:'var(--dim)', fontSize:13 }}>
                            Curated community posts with location, engagement, and optional NLP analysis.
                        </div>
                    </div>

                    {sidebar}
                </aside>
            </div>

            <footer className="ns-footer">
                <div className="ns-footInner">© {new Date().getFullYear()} LifeLine360 • React + Vite • Nature Theme</div>
            </footer>
        </div>
    );
}
