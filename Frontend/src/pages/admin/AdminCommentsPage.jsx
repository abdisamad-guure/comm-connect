import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCheck, FiEdit2, FiMessageCircle, FiTrash2, FiX } from 'react-icons/fi';
import Avatar from '../../components/Avatar';
import { EmptyState, ErrorState, LoadingState } from '../../components/AsyncState';
import { commentService } from '../../services/comments';
import { formatDate, getErrorMessage } from '../../utils/formatters';

export default function AdminCommentsPage() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);

  const loadComments = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await commentService.listAll({ limit: 100 });
      setComments(response.data.comments);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadComments(); }, [loadComments]);

  function beginEdit(comment) {
    setEditingId(comment._id);
    setDraft(comment.content);
    setError('');
  }

  async function save(commentId) {
    if (!draft.trim()) {
      setError('A comment cannot be empty.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const response = await commentService.update(commentId, { content: draft.trim() });
      setComments((current) => current.map((item) => (item._id === commentId ? response.data.comment : item)));
      setEditingId(null);
      setDraft('');
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  }

  async function remove(comment) {
    if (!window.confirm('Remove this comment permanently?')) return;
    setError('');
    try {
      await commentService.remove(comment._id);
      setComments((current) => current.filter((item) => item._id !== comment._id));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }

  return (
    <div>
      <div className="mb-7">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Moderation</p>
        <h2 className="mt-2 text-3xl font-bold text-slate-900">Comments</h2>
        <p className="mt-2 text-slate-600">Review, correct, or remove comments posted by community members.</p>
      </div>
      {error && <div className="mb-5"><ErrorState message={error} onRetry={loadComments} /></div>}
      {loading ? <LoadingState label="Loading comments..." /> : comments.length ? (
        <div className="space-y-3">
          {comments.map((comment) => (
            <article className="surface p-4" key={comment._id}>
              <div className="flex items-start gap-3">
                <Avatar user={comment.author} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{comment.author?.name || 'Deleted user'}</p>
                      <p className="text-xs text-slate-500">{formatDate(comment.createdAt)} · {comment.post ? <Link className="font-medium text-teal-700" to={`/posts/${comment.post._id}`}>{comment.post.title}</Link> : 'Deleted post'}</p>
                    </div>
                    {editingId !== comment._id && <div className="flex gap-2"><button className="button-secondary !p-2.5" onClick={() => beginEdit(comment)} aria-label="Edit comment"><FiEdit2 /></button><button className="rounded-lg border border-rose-200 p-2.5 text-rose-700 hover:bg-rose-50" onClick={() => remove(comment)} aria-label="Remove comment"><FiTrash2 /></button></div>}
                  </div>
                  {editingId === comment._id ? <div className="mt-3"><textarea className="input" rows="3" value={draft} maxLength="2000" onChange={(event) => setDraft(event.target.value)} /><div className="mt-2 flex justify-end gap-2"><button className="button-secondary !py-2" onClick={() => setEditingId(null)} disabled={saving}><FiX /> Cancel</button><button className="button-primary !py-2" onClick={() => save(comment._id)} disabled={saving}><FiCheck /> {saving ? 'Saving...' : 'Save'}</button></div></div> : <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{comment.content}</p>}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : <EmptyState title="No comments found" message="Community comments will appear here." action={<FiMessageCircle className="text-2xl text-slate-400" />} />}
    </div>
  );
}
