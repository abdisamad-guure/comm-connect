import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FiArrowLeft, FiEdit2, FiHeart, FiMapPin, FiMessageCircle, FiSend, FiTrash2 } from 'react-icons/fi';
import Avatar from '../components/Avatar';
import { EmptyState, ErrorState, LoadingState } from '../components/AsyncState';
import Modal from '../components/Modal';
import PostForm from '../components/forms/PostForm';
import { useAuth } from '../hooks/useAuth';
import { commentService } from '../services/comments';
import { getMediaUrl } from '../services/api';
import { postService } from '../services/posts';
import { formatDate, getErrorMessage, isOwner } from '../utils/formatters';

export default function PostDetailPage() {
  const { postId } = useParams();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [post, setPost] = useState(null); const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [actionError, setActionError] = useState(''); const [editing, setEditing] = useState(false); const [liking, setLiking] = useState(false);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();
  const navigate = useNavigate();

  const loadPost = useCallback(async () => {
    setLoading(true); setError('');
    try { const [postResponse, commentResponse] = await Promise.all([postService.get(postId), commentService.list(postId, { limit: 100 })]); setPost(postResponse.data.post); setComments(commentResponse.data.comments); }
    catch (requestError) { setError(getErrorMessage(requestError)); }
    finally { setLoading(false); }
  }, [postId]);
  useEffect(() => { loadPost(); }, [loadPost]);

  const canManage = isOwner(post, user) || isAdmin;
  const likedByUser = post?.likes?.some((id) => (typeof id === 'object' ? id._id : id) === user?._id);

  async function toggleLike() {
    if (!isAuthenticated) { navigate('/login', { state: { from: `/posts/${postId}` } }); return; }
    setLiking(true); setActionError('');
    try { const response = await postService.toggleLike(postId); setPost((current) => ({ ...current, likes: response.data.liked ? [...current.likes, user._id] : current.likes.filter((id) => (typeof id === 'object' ? id._id : id) !== user._id) })); }
    catch (requestError) { setActionError(getErrorMessage(requestError)); }
    finally { setLiking(false); }
  }

  async function submitComment(values) {
    setActionError('');
    try { const response = await commentService.create({ post: postId, content: values.content.trim() }); setComments((current) => [response.data.comment, ...current]); reset(); }
    catch (requestError) { setActionError(getErrorMessage(requestError)); }
  }

  async function deleteComment(commentId) {
    if (!window.confirm('Delete this comment?')) return;
    try { await commentService.remove(commentId); setComments((current) => current.filter((comment) => comment._id !== commentId)); } catch (requestError) { setActionError(getErrorMessage(requestError)); }
  }
  async function updatePost(payload) { const response = await postService.update(postId, payload); setPost(response.data.post); setEditing(false); }
  async function deletePost() { if (!window.confirm('Delete this post and its comments?')) return; try { await postService.remove(postId); navigate('/posts'); } catch (requestError) { setActionError(getErrorMessage(requestError)); } }

  if (loading) return <div className="page-container"><LoadingState label="Loading post..." /></div>;
  if (error) return <div className="page-container"><ErrorState message={error} onRetry={loadPost} /></div>;
  if (!post) return null;
  return <div className="page-container max-w-4xl"><Link className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-teal-700" to="/posts"><FiArrowLeft /> All posts</Link><article className="surface overflow-hidden">{post.image && <img className="max-h-[32rem] w-full object-cover" src={getMediaUrl(post.image)} alt="" />}<div className="p-5 sm:p-8"><div className="flex flex-wrap items-start justify-between gap-4"><div className="flex items-center gap-3"><Avatar user={post.author} /><div><p className="font-semibold text-slate-900">{post.author?.name}</p><p className="flex items-center gap-1 text-sm text-slate-500">{post.author?.location && <FiMapPin />}{post.author?.location || 'Community member'} · {formatDate(post.createdAt)}</p></div></div>{canManage && <div className="flex gap-2"><button className="button-secondary !p-2.5" onClick={() => setEditing(true)} aria-label="Edit post"><FiEdit2 /></button><button className="rounded-lg border border-rose-200 p-2.5 text-rose-700 hover:bg-rose-50" onClick={deletePost} aria-label="Delete post"><FiTrash2 /></button></div>}</div><h1 className="mt-7 text-3xl font-bold tracking-tight text-slate-900">{post.title}</h1><p className="mt-4 whitespace-pre-wrap leading-7 text-slate-700">{post.content}</p><div className="mt-7 flex items-center gap-3 border-t border-slate-100 pt-5"><button className={`button-secondary ${likedByUser ? '!border-rose-200 !bg-rose-50 !text-rose-700' : ''}`} disabled={liking} onClick={toggleLike}><FiHeart className={likedByUser ? 'fill-current' : ''} />{post.likes?.length || 0} {post.likes?.length === 1 ? 'like' : 'likes'}</button><span className="inline-flex items-center gap-2 text-sm text-slate-500"><FiMessageCircle />{comments.length} comments</span></div>{actionError && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{actionError}</p>}</div></article><section className="mt-8"><h2 className="text-xl font-bold text-slate-900">Discussion</h2>{isAuthenticated ? <form className="surface mt-4 p-4" onSubmit={handleSubmit(submitComment)}><label className="sr-only" htmlFor="comment">Add a comment</label><textarea id="comment" className="input" rows="3" placeholder="Add a thoughtful comment..." {...register('content', { required: 'Write a comment before posting', maxLength: { value: 2000, message: 'Comment is too long' } })} />{errors.content && <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>}<div className="mt-3 flex justify-end"><button className="button-primary !py-2" disabled={isSubmitting}><FiSend />{isSubmitting ? 'Posting...' : 'Post comment'}</button></div></form> : <div className="surface mt-4 p-5 text-sm text-slate-600"><Link className="font-semibold text-teal-700" to="/login">Log in</Link> to join this discussion.</div>}<div className="mt-5 space-y-4">{comments.length ? comments.map((comment) => <article className="surface p-4" key={comment._id}><div className="flex gap-3"><Avatar user={comment.author} size="sm" /><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-slate-900">{comment.author?.name}</p><p className="text-xs text-slate-500">{formatDate(comment.createdAt)}</p></div>{(isOwner(comment, user) || isAdmin) && <button className="text-sm font-semibold text-rose-700" onClick={() => deleteComment(comment._id)}>Delete</button>}</div><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{comment.content}</p></div></div></article>) : <EmptyState title="No comments yet" message="Start a helpful conversation." />}</div></section>{editing && <Modal title="Edit post" onClose={() => setEditing(false)}><PostForm post={post} onSubmit={updatePost} onCancel={() => setEditing(false)} /></Modal>}</div>;
}
