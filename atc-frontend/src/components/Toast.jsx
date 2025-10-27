import React, { useEffect, useState } from 'react';

export default function Toast({ text, onDone, timeout = 1800 }) {
  const [show, setShow] = useState(true);
  useEffect(() => { const t = setTimeout(() => { setShow(false); onDone?.(); }, timeout); return () => clearTimeout(t); }, [timeout, onDone]);
  if (!show) return null;
  return (
    <div style={{
      position:'fixed', bottom:16, right:16, zIndex:60,
      background:'linear-gradient(135deg,#e9f7ef,#dff3ea)', color:'#1f2a1f',
      border:'1px solid rgba(29,43,29,0.12)', borderRadius:10, padding:'10px 12px',
      boxShadow:'0 10px 24px rgba(41,63,41,0.18)'
    }}>
      {text}
    </div>
  );
}
