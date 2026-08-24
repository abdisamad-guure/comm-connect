import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiExternalLink, FiTrash2 } from 'react-icons/fi';
import Avatar from '../../components/Avatar';
import { EmptyState, ErrorState, LoadingState } from '../../components/AsyncState';
import { postService } from '../../services/posts';
import { formatDate, getErrorMessage } from '../../utils/formatters';

export default function AdminPostsPage() {
  const [posts, setPosts] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const loadPosts = useCallback(async () => { setLoading(true); setError(''); try { const response = await postService.list({ limit: 100 }); setPosts(response.data.posts); } catch (requestError) { setError(getErrorMessage(requestError)); } finally { setLoading(false); } }, []);
  useEffect(() => { loadPosts(); }, [loadPosts]);
  async function remove(post) { if (!window.confirm(`Remove “${post.title}”? This also removes its comments.`)) return; try { await postService.remove(post._id); setPosts((current) => current.filter((item) => item._id !== post._id)); } catch (requestError) { setError(getErrorMessage(requestError)); } }
  return <div><div className="mb-7"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Moderation</p><h2 className="mt-2 text-3xl font-bold text-slate-900">Posts</h2><p className="mt-2 text-slate-600">Review the community feed and remove inappropriate content when necessary.</p></div>{loading ? <LoadingState label="Loading posts..." /> : error ? <ErrorState message={error} onRetry={loadPosts} /> : posts.length ? <div className="space-y-3">{posts.map((post) => <article className="surface p-4" key={post._id}><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><div className="flex items-center gap-2"><Avatar user={post.author} size="sm" /><span className="text-sm font-semibold text-slate-700">{post.author?.name}</span><span className="text-xs text-slate-500">{formatDate(post.createdAt)}</span></div><h3 className="mt-3 font-bold text-slate-900">{post.title}</h3><p className="mt-1 line-clamp-2 text-sm text-slate-600">{post.content}</p></div><div className="flex shrink-0 gap-2"><Link className="button-secondary !p-2.5" to={`/posts/${post._id}`} aria-label="View post"><FiExternalLink /></Link><button className="rounded-lg border border-rose-200 p-2.5 text-rose-700 hover:bg-rose-50" onClick={() => remove(post)} aria-label="Remove post"><FiTrash2 /></button></div></div></article>)}</div> : <EmptyState title="No posts found" />}</div>;
}
