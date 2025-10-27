import React, { useState } from 'react';
import AppShell from './layout/AppShell.jsx';
import PostList from './components/PostList.jsx';
import PostDetail from './components/PostDetail.jsx';

export default function App() {
    const [selectedPostId, setSelectedPostId] = useState(null);

    return (
        <AppShell title="Disaster Posts Viewer">
            {selectedPostId ? (
                <PostDetail postId={selectedPostId} onBack={() => setSelectedPostId(null)} />
            ) : (
                <PostList onSelectPost={setSelectedPostId} />
            )}
        </AppShell>
    );
}
