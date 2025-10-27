// Pure JS (no JSX) to keep .js extension safe with Vite
import React, { createContext, useContext, useMemo, useRef } from 'react';

const PostsContext = createContext(null);

export function PostsProvider({ children }) {
    const byId = useRef(new Map());
    const setMany = (arr = []) => { for (const p of arr) if (p && p.id != null) byId.current.set(p.id, p); };
    const setOne = (p) => { if (p && p.id != null) byId.current.set(p.id, p); };
    const getOne = (id) => byId.current.get(id);
    const value = useMemo(() => ({ setMany, setOne, getOne }), []);
    return React.createElement(PostsContext.Provider, { value }, children);
}

export function usePostsCache() {
    const ctx = useContext(PostsContext);
    if (!ctx) throw new Error('usePostsCache must be used within PostsProvider');
    return ctx;
}
