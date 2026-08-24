import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiEdit3, FiPlus } from 'react-icons/fi';
import { EmptyState, ErrorState, LoadingState } from '../components/AsyncState';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import PostCard from '../components/PostCard';
import PostForm from '../components/forms/PostForm';
import { useAuth } from '../hooks/useAuth';
import { postService } from '../services/posts';
import { getErrorMessage } from '../utils/formatters';

export default function PostsPage() {
  const { isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  const loadPosts = useCallback(async () => {
    setLoading(true); setError('');
    try { const response = await postService.list({ limit: 100 }); setPosts(response.data.posts); }
    catch (requestError) { setError(getErrorMessage(requestError)); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { loadPosts(); }, [loadPosts]);

  async function createPost(payload) {
    await postService.create(payload);
    setIsComposerOpen(false);
    await loadPosts();
  }

  return <div className="page-container"><PageHeader eyebrow="Community feed" title="Posts from your neighbours" description="Share updates, ask for help, and keep the conversation going." action={isAuthenticated ? <button className="button-primary" onClick={() => setIsComposerOpen(true)}><FiEdit3 /> Create post</button> : <Link className="button-primary" to="/login"><FiPlus /> Log in to post</Link>} />{loading ? <LoadingState label="Loading posts..." /> : error ? <ErrorState message={error} onRetry={loadPosts} /> : posts.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{posts.map((post) => <PostCard key={post._id} post={post} />)}</div> : <EmptyState title="No posts found" message="Start the conversation by creating the first post." action={isAuthenticated && <button className="button-primary" onClick={() => setIsComposerOpen(true)}>Create post</button>} />}{isComposerOpen && <Modal title="Create a post" onClose={() => setIsComposerOpen(false)}><PostForm onSubmit={createPost} onCancel={() => setIsComposerOpen(false)} /></Modal>}</div>;
}
