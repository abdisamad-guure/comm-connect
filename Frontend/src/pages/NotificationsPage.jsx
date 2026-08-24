import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBell, FiCheck, FiEye, FiEyeOff, FiTrash2 } from 'react-icons/fi';
import { EmptyState, ErrorState, LoadingState } from '../components/AsyncState';
import PageHeader from '../components/PageHeader';
import { commentService } from '../services/comments';
import { notificationService } from '../services/notifications';
import { formatDate, getErrorMessage } from '../utils/formatters';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState(null);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await notificationService.list({ limit: 100 });
      setNotifications(response.data.notifications);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadNotifications(); }, [loadNotifications]);

  async function markRead(notificationId) {
    setError('');
    try {
      await notificationService.markRead(notificationId);
      setNotifications((current) => current.map((item) => (
        item._id === notificationId ? { ...item, read: true } : item
      )));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }

  async function markAllRead() {
    setError('');
    try {
      await notificationService.markAllRead();
      setNotifications((current) => current.map((item) => ({ ...item, read: true })));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }

  async function toggleCommentVisibility(notification) {
    const hidden = !notification.comment.hidden;
    setActionId(notification._id);
    setError('');
    try {
      await commentService.setVisibility(notification.comment._id, hidden);
      setNotifications((current) => current.map((item) => (
        item._id === notification._id
          ? { ...item, read: true, comment: { ...item.comment, hidden } }
          : item
      )));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setActionId(null);
    }
  }

  async function deleteComment(notification) {
    if (!window.confirm('Delete this comment permanently from your post?')) return;
    setActionId(notification._id);
    setError('');
    try {
      await commentService.remove(notification.comment._id);
      setNotifications((current) => current.filter((item) => item._id !== notification._id));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setActionId(null);
    }
  }

  return (
    <div className="page-container max-w-4xl">
      <PageHeader
        eyebrow="Your updates"
        title="Notifications"
        description="Keep up with activity related to your posts and reports."
        action={notifications.some((item) => !item.read) && <button className="button-secondary" onClick={markAllRead}><FiCheck /> Mark all read</button>}
      />
      {error && <div className="mb-5"><ErrorState message={error} onRetry={loadNotifications} /></div>}
      {loading ? <LoadingState label="Loading notifications..." /> : notifications.length ? (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const hasCommentActions = notification.type === 'comment' && notification.comment;
            const isWorking = actionId === notification._id;
            return (
              <article className={`surface flex gap-4 p-4 ${notification.read ? 'opacity-80' : 'border-teal-200 bg-teal-50/40'}`} key={notification._id}>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-teal-100 text-teal-700"><FiBell /></span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800">{notification.message}</p>
                  {hasCommentActions && <p className={`mt-2 rounded-lg border px-3 py-2 text-sm ${notification.comment.hidden ? 'border-slate-200 bg-slate-100 text-slate-500 line-through' : 'border-slate-200 bg-white text-slate-700'}`}>{notification.comment.content}</p>}
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <p className="text-xs text-slate-500">{formatDate(notification.createdAt, { dateStyle: 'medium', timeStyle: 'short' })}</p>
                    {notification.post && <Link className="text-xs font-semibold text-teal-700" to={`/posts/${notification.post._id}`}>View post</Link>}
                  </div>
                  {hasCommentActions && <div className="mt-3 flex flex-wrap gap-2">
                    <button className="button-secondary !px-3 !py-2" disabled={isWorking} onClick={() => toggleCommentVisibility(notification)}>{notification.comment.hidden ? <FiEye /> : <FiEyeOff />}{notification.comment.hidden ? 'Show comment' : 'Hide comment'}</button>
                    <button className="inline-flex items-center gap-2 rounded-lg border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60" disabled={isWorking} onClick={() => deleteComment(notification)}><FiTrash2 /> Delete comment</button>
                  </div>}
                </div>
                {!notification.read && <button className="shrink-0 text-sm font-semibold text-teal-700" onClick={() => markRead(notification._id)}>Mark read</button>}
              </article>
            );
          })}
        </div>
      ) : <EmptyState title="You’re all caught up" message="Notifications about your posts and reports will appear here." />}
    </div>
  );
}
