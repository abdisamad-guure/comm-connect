import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { FiArrowRight, FiLock, FiMail, FiUser } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../utils/formatters';

export default function AuthPage({ mode }) {
  const isRegister = mode === 'register';
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const { login, register: registerAccount, isAuthenticated } = useAuth();
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminLogin = !isRegister && new URLSearchParams(location.search).get('admin') === 'true';

  if (isAuthenticated) return <Navigate to="/" replace />;

  async function submit(values) {
    setError('');
    try {
      const user = isRegister ? await registerAccount(values) : await login(values);
      navigate(user.role === 'admin' ? '/admin' : location.state?.from || '/', { replace: true });
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    }
  }

  return <div className="page-container grid min-h-[calc(100vh-13rem)] place-items-center py-6"><div className="grid w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-card md:grid-cols-[0.9fr_1.1fr]"><aside className="hidden bg-teal-800 p-10 text-white md:block"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-200">Community Connect</p><h1 className="mt-6 text-4xl font-bold leading-tight">A better way to stay connected locally.</h1><p className="mt-5 leading-7 text-teal-50">Share updates, discover events, raise concerns, and help make your neighbourhood thrive.</p></aside><section className="p-6 sm:p-10"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">{isRegister ? 'Join the community' : isAdminLogin ? 'Administration' : 'Welcome back'}</p><h1 className="mt-3 text-3xl font-bold text-slate-900">{isRegister ? 'Create your account' : isAdminLogin ? 'Admin sign in' : 'Log in to Community Connect'}</h1><p className="mt-2 text-slate-600">{isRegister ? 'Create an account to post, comment, join events, and report local issues.' : isAdminLogin ? 'Enter your administrator email and password to open the dashboard.' : 'Use your account to continue where you left off.'}</p><form className="mt-8 space-y-4" onSubmit={handleSubmit(submit)} noValidate>{error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}{isRegister && <div><label className="label" htmlFor="name">Full name</label><div className="relative"><FiUser className="absolute left-3 top-3 text-slate-400" /><input id="name" className="input pl-10" autoComplete="name" {...register('name', { required: 'Your name is required', minLength: { value: 2, message: 'Use at least 2 characters' } })} /></div>{errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}</div>}<div><label className="label" htmlFor="email">Email address</label><div className="relative"><FiMail className="absolute left-3 top-3 text-slate-400" /><input id="email" className="input pl-10" type="email" autoComplete="email" {...register('email', { required: 'Your email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address' } })} /></div>{errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}</div><div><label className="label" htmlFor="password">Password</label><div className="relative"><FiLock className="absolute left-3 top-3 text-slate-400" /><input id="password" className="input pl-10" type="password" autoComplete={isRegister ? 'new-password' : 'current-password'} {...register('password', { required: 'A password is required', minLength: { value: 8, message: 'Use at least 8 characters' } })} /></div>{errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}</div><button className="button-primary mt-2 w-full" disabled={isSubmitting}>{isSubmitting ? 'Please wait...' : isRegister ? 'Create account' : isAdminLogin ? 'Sign in as admin' : 'Log in'} <FiArrowRight /></button></form><p className="mt-6 text-center text-sm text-slate-600">{isRegister ? 'Already have an account?' : 'New to Community Connect?'} <Link className="font-semibold text-teal-700 hover:text-teal-800" to={isRegister ? '/login' : '/register'}>{isRegister ? 'Log in' : 'Create an account'}</Link></p></section></div></div>;
}
