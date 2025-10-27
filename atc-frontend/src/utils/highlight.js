export function highlight(text, query) {
    if (!text || !query) return text;
    const q = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(${q})`, 'ig');
    return text.split(re).map((part, i) =>
        re.test(part) ? `<mark style="background:#e9f7ef;color:#1f2a1f;border-radius:4px;padding:0 2px">${part}</mark>` : part
    ).join('');
}
