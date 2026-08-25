import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return <div className="page-container grid min-h-[50vh] place-items-center"><div className="text-center"><p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-700">404</p><h1 className="mt-3 text-4xl font-bold text-slate-900">This page is not here.</h1><p className="mt-3 text-slate-600">The link may be outdated, or the page may have moved.</p><Link className="button-primary mt-6" to="/">Return home</Link></div></div>;
}


