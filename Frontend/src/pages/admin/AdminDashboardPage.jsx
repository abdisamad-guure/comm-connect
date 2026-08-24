import { useCallback, useEffect, useState } from 'react';
import { FiAlertTriangle, FiCalendar, FiFileText, FiUsers } from 'react-icons/fi';
import { ErrorState, LoadingState } from '../../components/AsyncState';
import { eventService } from '../../services/events';
import { postService } from '../../services/posts';
import { reportService } from '../../services/reports';
import { userService } from '../../services/users';
import { getErrorMessage } from '../../utils/formatters';

const cards = [[FiUsers, 'Total users', 'users', 'text-blue-700 bg-blue-50'], [FiFileText, 'Total posts', 'posts', 'text-teal-700 bg-teal-50'], [FiAlertTriangle, 'Total reports', 'reports', 'text-amber-700 bg-amber-50'], [FiCalendar, 'Total events', 'events', 'text-violet-700 bg-violet-50'], [FiAlertTriangle, 'Pending reports', 'pending', 'text-rose-700 bg-rose-50']];

export default function AdminDashboardPage() {
  const [state, setState] = useState({ loading: true, error: '', stats: {} });
  const loadDashboard = useCallback(async () => { setState((current) => ({ ...current, loading: true, error: '' })); try { const [users, posts, reports, events, pendingReports] = await Promise.all([userService.list({ limit: 1 }), postService.list({ limit: 1 }), reportService.list({ limit: 1 }), eventService.list({ limit: 1 }), reportService.list({ limit: 1, status: 'pending' })]); setState({ loading: false, error: '', stats: { users: users.meta.total, posts: posts.meta.total, reports: reports.meta.total, events: events.meta.total, pending: pendingReports.meta.total } }); } catch (requestError) { setState((current) => ({ ...current, loading: false, error: getErrorMessage(requestError) })); } }, []);
  useEffect(() => { loadDashboard(); }, [loadDashboard]);
  if (state.loading) return <LoadingState label="Loading dashboard..." />;
  if (state.error) return <ErrorState message={state.error} onRetry={loadDashboard} />;
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{cards.map(([Icon, label, key, classes]) => <article className="surface p-5" key={key}><span className={`grid h-11 w-11 place-items-center rounded-xl text-xl ${classes}`}><Icon /></span><p className="mt-5 text-3xl font-bold text-slate-900">{state.stats[key] ?? 0}</p><p className="mt-1 text-sm font-medium text-slate-600">{label}</p></article>)}</div>;
}
