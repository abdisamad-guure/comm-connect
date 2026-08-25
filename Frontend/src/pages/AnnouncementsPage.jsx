import { useCallback, useEffect, useState } from 'react';
import { FiVolume2 } from 'react-icons/fi';
import Avatar from '../components/Avatar';
import { EmptyState, ErrorState, LoadingState } from '../components/AsyncState';
import PageHeader from '../components/PageHeader';
import { announcementService } from '../services/announcements';
import { getMediaUrl } from '../services/api';
import { formatDate, getErrorMessage } from '../utils/formatters';

<<<<<<< HEAD
=======

>>>>>>> 255cd1fc0e86f381027f7728d273f21dd5d49719
export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const loadAnnouncements = useCallback(async () => { setLoading(true); setError(''); try { const response = await announcementService.list({ limit: 100 }); setAnnouncements(response.data.announcements); } catch (requestError) { setError(getErrorMessage(requestError)); } finally { setLoading(false); } }, []);
  useEffect(() => { loadAnnouncements(); }, [loadAnnouncements]);
  return <div className="page-container max-w-5xl"><PageHeader eyebrow="Official updates" title="Community announcements" description="Important information from the people helping the community run smoothly." />{loading ? <LoadingState label="Loading announcements..." /> : error ? <ErrorState message={error} onRetry={loadAnnouncements} /> : announcements.length ? <div className="space-y-5">{announcements.map((announcement) => <article className="surface overflow-hidden" key={announcement._id}>{announcement.image && <img className="max-h-80 w-full object-cover" src={getMediaUrl(announcement.image)} alt="" />}<div className="p-5 sm:p-7"><div className="flex gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-teal-100 text-teal-700"><FiVolume2 /></span><div><p className="text-sm font-medium text-teal-700">Published {formatDate(announcement.createdAt)}</p><h2 className="mt-1 text-2xl font-bold text-slate-900">{announcement.title}</h2></div></div><p className="mt-5 whitespace-pre-wrap leading-7 text-slate-700">{announcement.content}</p>{announcement.createdBy && <div className="mt-6 flex items-center gap-2 border-t border-slate-100 pt-4"><Avatar user={announcement.createdBy} size="sm" /><span className="text-sm text-slate-600">Published by {announcement.createdBy.name}</span></div>}</div></article>)}</div> : <EmptyState title="No announcements yet" message="Important community updates will be published here." />}</div>;
}