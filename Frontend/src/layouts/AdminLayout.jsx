import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiBell, FiCalendar, FiFileText, FiHome, FiLogOut, FiMessageCircle, FiShield, FiVolume2, FiUsers } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';

const links = [
  ['Overview', '/admin', FiHome], ['Users', '/admin/users', FiUsers], ['Posts', '/admin/posts', FiFileText], ['Comments', '/admin/comments', FiMessageCircle], ['Reports', '/admin/reports', FiFileText], ['Events', '/admin/events', FiCalendar], ['Announcements', '/admin/announcements', FiVolume2], ['Notifications', '/admin/notifications', FiBell],
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="page-container py-2 sm:py-4">
      <div className="lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8">
        <aside className="mb-6 flex flex-col overflow-x-auto rounded-xl border border-slate-200 bg-white p-2 lg:mb-0 lg:min-h-[calc(100vh-2rem)]">
          <p className="px-3 py-3 font-bold tracking-tight text-slate-900">Community Connect</p>
          <nav className="flex min-w-max gap-1 lg:flex-col" aria-label="Admin navigation">
            {links.map(([label, path, Icon]) => <NavLink key={path} end={path === '/admin'} to={path} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold ${isActive ? 'bg-teal-700 text-white' : 'text-slate-600 hover:bg-slate-100'}`}><Icon />{label}</NavLink>)}
          </nav>
          <div className="mt-4 border-t border-slate-200 px-2 pt-4 lg:mt-auto">
            <div className="flex items-center gap-3 px-2 py-2">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-teal-100 text-teal-700"><FiShield /></span>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">Admin</p>
                <p className="truncate text-sm font-semibold text-slate-800">{user?.name}</p>
              </div>
            </div>
            <button className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-50" onClick={handleLogout}><FiLogOut /> Logout</button>
          </div>
        </aside>
        <div>
          <div className="mb-6 flex justify-end"><NavLink className="button-secondary !py-2" to="/"><FiArrowLeft /> Visit the website</NavLink></div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
