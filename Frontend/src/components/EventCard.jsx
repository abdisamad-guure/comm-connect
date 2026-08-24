import { Link } from 'react-router-dom';
import { FiCalendar, FiMapPin, FiUsers } from 'react-icons/fi';
import { formatEventDate } from '../utils/formatters';
import { getMediaUrl } from '../services/api';

export default function EventCard({ event }) {
  return (
    <article className="surface overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg">
      {event.image && <img className="h-40 w-full object-cover" src={getMediaUrl(event.image)} alt="" />}
      <div className="p-5">
        <p className="inline-flex items-center gap-2 text-sm font-medium text-teal-700"><FiCalendar /> {formatEventDate(event.date, event.time)}</p>
        <h2 className="mt-3 text-lg font-bold text-slate-900"><Link className="hover:text-teal-700" to={`/events/${event._id}`}>{event.title}</Link></h2>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{event.description}</p>
        <div className="mt-5 space-y-2 text-sm text-slate-600">
          <p className="flex items-center gap-2"><FiMapPin className="text-slate-400" />{event.location}</p>
          <p className="flex items-center gap-2"><FiUsers className="text-slate-400" />{event.attendees?.length || 0} attending</p>
        </div>
      </div>
    </article>
  );
}
