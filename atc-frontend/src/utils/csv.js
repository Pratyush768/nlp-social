export function toCSV(rows) {
    const headers = ['user','created_at','location','likes','retweets','text'];
    const escape = (s) => `"${String(s ?? '').replace(/"/g, '""')}"`;
    const body = rows.map(r => [
        escape(r.user), escape(r.created_at), escape(r.location_text),
        r.likes ?? 0, r.retweets ?? 0, escape(r.text)
    ].join(','));
    return [headers.join(','), ...body].join('\n');
}
export function downloadCSV(filename, rows) {
    const csv = toCSV(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
}
