import { useCallback, useEffect, useState } from 'react';
import { FiSearch, FiTrash2, FiUsers } from 'react-icons/fi';
import Avatar from '../../components/Avatar';
import { EmptyState, ErrorState, LoadingState } from '../../components/AsyncState';
import { useAuth } from '../../hooks/useAuth';
import { userService } from '../../services/users';
import { formatDate, getErrorMessage } from '../../utils/formatters';

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removingId, setRemovingId] = useState(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await userService.list({ limit: 100, search: query || undefined });
      setUsers(response.data.users);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  function submit(event) {
    event.preventDefault();
    setQuery(search.trim());
  }

  async function remove(member) {
    const confirmed = window.confirm(`Remove ${member.name}? Their posts, comments, reports, event attendance, and notifications will also be removed.`);
    if (!confirmed) return;
    setRemovingId(member._id);
    setError('');
    try {
      await userService.remove(member._id);
      setUsers((current) => current.filter((item) => item._id !== member._id));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div>
      <div className="mb-7">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">People</p>
        <h2 className="mt-2 text-3xl font-bold text-slate-900">Users</h2>
        <p className="mt-2 text-slate-600">Search registered members and remove accounts when necessary.</p>
      </div>
      <form className="surface mb-6 flex gap-3 p-3" onSubmit={submit}>
        <label className="sr-only" htmlFor="user-search">Search users</label>
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-3 text-slate-400" />
          <input id="user-search" className="input pl-10" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email, or location" />
        </div>
        <button className="button-primary">Search</button>
      </form>
      {error && <div className="mb-5"><ErrorState message={error} onRetry={loadUsers} /></div>}
      {loading ? <LoadingState label="Loading users..." /> : users.length ? (
        <div className="surface overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
              <tr><th className="px-5 py-3 font-semibold">Member</th><th className="px-5 py-3 font-semibold">Location</th><th className="px-5 py-3 font-semibold">Role</th><th className="px-5 py-3 font-semibold">Joined</th><th className="px-5 py-3 text-right font-semibold">Actions</th></tr>
            </thead>
            <tbody>
              {users.map((member) => (
                <tr className="border-b border-slate-100 last:border-0" key={member._id}>
                  <td className="px-5 py-4"><div className="flex items-center gap-3"><Avatar user={member} size="sm" /><div><p className="font-semibold text-slate-900">{member.name}</p><p className="text-slate-500">{member.email}</p></div></div></td>
                  <td className="px-5 py-4 text-slate-600">{member.location || '—'}</td>
                  <td className="px-5 py-4"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-700">{member.role}</span></td>
                  <td className="px-5 py-4 text-slate-600">{formatDate(member.createdAt)}</td>
                  <td className="px-5 py-4 text-right">{member.role === 'admin' || member._id === user?._id ? <span className="text-xs font-medium text-slate-400">Protected</span> : <button className="inline-flex items-center gap-2 rounded-lg border border-rose-200 px-3 py-2 font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60" disabled={removingId === member._id} onClick={() => remove(member)}><FiTrash2 />{removingId === member._id ? 'Removing...' : 'Remove'}</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <EmptyState title="No users found" message="Try a different search term." action={<FiUsers className="text-2xl text-slate-400" />} />}
    </div>
  );
}
