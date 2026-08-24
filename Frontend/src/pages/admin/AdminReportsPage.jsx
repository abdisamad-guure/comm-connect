import { useCallback, useEffect, useState } from 'react';
import { FiFilter } from 'react-icons/fi';
import { EmptyState, ErrorState, LoadingState } from '../../components/AsyncState';
import StatusBadge from '../../components/StatusBadge';
import { reportService } from '../../services/reports';
import { formatDate, getErrorMessage } from '../../utils/formatters';

const statuses = ['all', 'pending', 'reviewing', 'resolved', 'rejected'];

export default function AdminReportsPage() {
  const [reports, setReports] = useState([]); const [filter, setFilter] = useState('all'); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [savingId, setSavingId] = useState('');
  const loadReports = useCallback(async () => { setLoading(true); setError(''); try { const response = await reportService.list({ limit: 100 }); setReports(response.data.reports); } catch (requestError) { setError(getErrorMessage(requestError)); } finally { setLoading(false); } }, []);
  useEffect(() => { loadReports(); }, [loadReports]);
  async function updateStatus(reportId, status) { setSavingId(reportId); try { const response = await reportService.updateStatus(reportId, status); setReports((current) => current.map((report) => report._id === reportId ? response.data.report : report)); } catch (requestError) { setError(getErrorMessage(requestError)); } finally { setSavingId(''); } }
  const visibleReports = reports.filter((report) => filter === 'all' || report.status === filter);
  return <div><div className="mb-7"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Workflow</p><h2 className="mt-2 text-3xl font-bold text-slate-900">Reports</h2><p className="mt-2 text-slate-600">Review reported issues and keep residents informed about progress.</p></div><div className="mb-6 flex flex-wrap items-center gap-2"><FiFilter className="text-slate-500" />{statuses.map((status) => <button className={`rounded-full px-3 py-1.5 text-sm font-semibold capitalize ${filter === status ? 'bg-teal-700 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'}`} key={status} onClick={() => setFilter(status)}>{status}</button>)}</div>{loading ? <LoadingState label="Loading reports..." /> : error ? <ErrorState message={error} onRetry={loadReports} /> : visibleReports.length ? <div className="space-y-4">{visibleReports.map((report) => <article className="surface p-5" key={report._id}><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><div className="flex flex-wrap items-center gap-3"><h3 className="font-bold text-slate-900">{report.title}</h3><StatusBadge status={report.status} /></div><p className="mt-2 text-sm leading-6 text-slate-600">{report.description}</p><p className="mt-3 text-sm text-slate-500">{report.location} · by {report.createdBy?.name || 'Unknown'} · {formatDate(report.createdAt)}</p></div><label className="text-sm font-medium text-slate-700">Status<select className="input mt-1 min-w-36" value={report.status} disabled={savingId === report._id} onChange={(event) => updateStatus(report._id, event.target.value)}>{statuses.slice(1).map((status) => <option value={status} key={status}>{status[0].toUpperCase() + status.slice(1)}</option>)}</select></label></div></article>)}</div> : <EmptyState title="No reports in this status" />}</div>;
}
