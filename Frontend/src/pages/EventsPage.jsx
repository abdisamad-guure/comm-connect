import { useCallback, useEffect, useState } from 'react';
import EventCard from '../components/EventCard';
import { EmptyState, ErrorState, LoadingState } from '../components/AsyncState';
import PageHeader from '../components/PageHeader';
import { eventService } from '../services/events';
import { getErrorMessage } from '../utils/formatters';



export default function EventsPage() {
  const [events, setEvents] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const loadEvents = useCallback(async () => { setLoading(true); setError(''); try { const response = await eventService.list({ limit: 100, upcoming: true }); setEvents(response.data.events); } catch (requestError) { setError(getErrorMessage(requestError)); } finally { setLoading(false); } }, []);
  useEffect(() => { loadEvents(); }, [loadEvents]);
  return <div className="page-container"><PageHeader eyebrow="Community calendar" title="Events worth showing up for" description="Discover what is happening nearby and meet the people who make this place feel like home." />{loading ? <LoadingState label="Loading events..." /> : error ? <ErrorState message={error} onRetry={loadEvents} /> : events.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{events.map((event) => <EventCard key={event._id} event={event} />)}</div> : <EmptyState title="No upcoming events" message="There are no scheduled events right now. Check back soon." />}</div>;
}
