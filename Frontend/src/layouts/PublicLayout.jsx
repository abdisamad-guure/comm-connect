import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { FiBell, FiMenu, FiShield, FiX } from 'react-icons/fi';
import Avatar from '../components/Avatar';
import { useAuth } from '../hooks/useAuth';

const navigation = [
  ['Home', '/'], ['Posts', '/posts'], ['Events', '/events'], ['Reports', '/reports'], ['About', '/about'],
];

const linkClass = ({ isActive }) => `rounded-lg px-3 py-2 text-sm font-semibold transition ${isActive ? 'bg-teal-50 text-teal-800' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`;

export default function PublicLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  async function handleLogout() {
    await logout();
    setIsMenuOpen(false);
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="page-container flex h-16 items-center justify-between gap-3">
          <Link className="flex items-center gap-2 font-bold tracking-tight text-slate-900" to="/">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal-700 text-lg text-white">C</span>
            <span>Community Connect</span>
          </Link>
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
            {navigation.map(([label, path]) => <NavLink className={linkClass} key={path} to={path}>{label}</NavLink>)}
          </nav>
          <div className="hidden items-center gap-2 lg:flex">
            {isAuthenticated ? <>
              <Link className="rounded-lg p-2 text-slate-600 hover:bg-slate-100" to="/notifications" aria-label="Notifications"><FiBell /></Link>
              <Link className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-100" to="/profile"><Avatar user={user} size="sm" /><span className="max-w-24 truncate text-sm font-semibold">{user.name}</span></Link>
              {!isAdmin && <button className="button-secondary !py-2" onClick={handleLogout}>Logout</button>}
              {isAdmin && <Link className="rounded-lg border border-slate-300 p-2.5 text-teal-700 hover:bg-teal-50" to="/admin" aria-label="Admin dashboard" title="Admin dashboard"><FiShield /></Link>}
            </> : <>
              <Link className="button-secondary !py-2" to="/login">Log in</Link>
              <Link className="button-primary !py-2" to="/register">Join community</Link>
              <Link className="rounded-lg border border-slate-300 p-2.5 text-teal-700 hover:bg-teal-50" to="/login?admin=true" aria-label="Admin sign in" title="Admin sign in"><FiShield /></Link>
            </>}
          </div>
          <div className="flex items-center gap-1 lg:hidden">
            {(!isAuthenticated || isAdmin) && <Link className="rounded-lg p-2 text-teal-700 hover:bg-teal-50" to={isAdmin ? '/admin' : '/login?admin=true'} aria-label={isAdmin ? 'Admin dashboard' : 'Admin sign in'}><FiShield /></Link>}
            <button className="rounded-lg p-2 text-slate-700 hover:bg-slate-100" onClick={() => setIsMenuOpen((open) => !open)} aria-expanded={isMenuOpen} aria-label="Toggle navigation">
              {isMenuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>
        {isMenuOpen && <div className="border-t border-slate-200 bg-white px-4 py-3 lg:hidden">
          <nav className="page-container flex flex-col gap-1" aria-label="Mobile navigation">
            {navigation.map(([label, path]) => <NavLink className={linkClass} key={path} to={path} onClick={() => setIsMenuOpen(false)}>{label}</NavLink>)}
            {isAuthenticated ? <>
              <NavLink className={linkClass} to="/profile" onClick={() => setIsMenuOpen(false)}>Profile</NavLink>
              <NavLink className={linkClass} to="/notifications" onClick={() => setIsMenuOpen(false)}>Notifications</NavLink>
              {!isAdmin && <button className="mt-2 text-left text-sm font-semibold text-rose-700" onClick={handleLogout}>Log out</button>}
            </> : <>
              <NavLink className={linkClass} to="/login" onClick={() => setIsMenuOpen(false)}>Log in</NavLink>
              <NavLink className={linkClass} to="/register" onClick={() => setIsMenuOpen(false)}>Join community</NavLink>
            </>}
          </nav>
        </div>}
      </header>
      <main className="py-8 sm:py-10"><Outlet /></main>
      <footer className="mt-10 border-t border-slate-200 bg-white py-8"><div className="page-container flex flex-col gap-2 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between"><p>© {new Date().getFullYear()} Community Connect</p><p>Built for a stronger, better-informed community.</p></div></footer>
    </div>
  );
}
