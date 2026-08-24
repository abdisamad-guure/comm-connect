import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiCalendar, FiCheck, FiMapPin, FiUsers } from 'react-icons/fi';
import Avatar from '../components/Avatar';
import { ErrorState, LoadingState } from '../components/AsyncState';
import { useAuth } from '../hooks/useAuth';
import { eventService } from '../services/events';
import { getMediaUrl } from '../services/api';
import { formatEventDate, getErrorMessage } from '../utils/formatters';

export default function EventDetailPage() {
  const { eventId } = useParams(); const { user, isAuthenticated } = useAuth(); const navigate = useNavigate();
  const [event, setEvent] = useState(null); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [joining, setJoining] = useState(false); const [actionError, setActionError] = useState('');
  const loadEvent = useCallback(async () => { setLoading(true); setError(''); try { const response = await eventService.get(eventId); setEvent(response.data.event); } catch (requestError) { setError(getErrorMessage(requestError)); } finally { setLoading(false); } }, [eventId]);
  useEffect(() => { loadEvent(); }, [loadEvent]);
  const joined = event?.attendees?.some((attendee) => (typeof attendee === 'object' ? attendee._id : attendee) === user?._id);
  async function join() { if (!isAuthenticated) { navigate('/login', { state: { from: `/events/${eventId}` } }); return; } setJoining(true); setActionError(''); try { await eventService.join(eventId); await loadEvent(); } catch (requestError) { setActionError(getErrorMessage(requestError)); } finally { setJoining(false); } }
  if (loading) return <div className="page-container"><LoadingState label="Loading event..." /></div>;
  if (error) return <div className="page-container"><ErrorState message={error} onRetry={loadEvent} /></div>;
  return <div className="page-container max-w-4xl"><Link className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-teal-700" to="/events"><FiArrowLeft /> All events</Link><article className="surface overflow-hidden">{event.image && <img className="max-h-[28rem] w-full object-cover" src={getMediaUrl(event.image)} alt="" />}<div className="p-5 sm:p-8"><p className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700"><FiCalendar />{formatEventDate(event.date, event.time)}</p><h1 className="mt-3 text-3xl font-bold text-slate-900">{event.title}</h1><p className="mt-4 whitespace-pre-wrap leading-7 text-slate-700">{event.description}</p><div className="mt-7 grid gap-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-700 sm:grid-cols-2"><p className="flex items-center gap-3"><FiMapPin className="text-lg text-teal-700" />{event.location}</p><p className="flex items-center gap-3"><FiUsers className="text-lg text-teal-700" />{event.attendees?.length || 0} attending</p></div><div className="mt-6">{joined ? <span className="button-secondary !border-emerald-200 !bg-emerald-50 !text-emerald-800"><FiCheck /> You’re attending</span> : <button className="button-primary" onClick={join} disabled={joining}>{joining ? 'Joining...' : isAuthenticated ? 'Join this event' : 'Log in to join'}</button>}{actionError && <p className="mt-3 text-sm text-red-700">{actionError}</p>}</div></div></article>{event.attendees?.length > 0 && <section className="mt-8"><h2 className="text-xl font-bold text-slate-900">Who’s attending</h2><div className="surface mt-4 grid gap-3 p-4 sm:grid-cols-2">{event.attendees.map((attendee) => <div className="flex items-center gap-3" key={attendee._id || attendee}><Avatar user={typeof attendee === 'object' ? attendee : {}} size="sm" /><span className="text-sm font-semibold text-slate-800">{typeof attendee === 'object' ? attendee.name : 'Community member'}</span></div>)}</div></section>}</div>;
}
