import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiSave } from 'react-icons/fi';
import { getErrorMessage } from '../../utils/formatters';

function dateInputValue(value) {
  return value ? new Date(value).toISOString().slice(0, 10) : '';
}

export default function EventForm({ event, onSubmit, onCancel }) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({ defaultValues: { title: '', description: '', date: '', time: '', location: '' } });
  const [error, setError] = useState('');

  useEffect(() => reset({ title: event?.title || '', description: event?.description || '', date: dateInputValue(event?.date), time: event?.time || '', location: event?.location || '' }), [event, reset]);

  async function submit(values) {
    setError('');
    const payload = new FormData();
    for (const field of ['title', 'description', 'date', 'time', 'location']) payload.append(field, values[field].trim());
    if (values.image?.[0]) payload.append('image', values.image[0]);
    try { await onSubmit(payload); } catch (submitError) { setError(getErrorMessage(submitError)); }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(submit)} noValidate>
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div><label className="label" htmlFor="event-title">Event title</label><input id="event-title" className="input" {...register('title', { required: 'A title is required', minLength: { value: 3, message: 'Use at least 3 characters' } })} />{errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}</div>
      <div><label className="label" htmlFor="event-description">Description</label><textarea id="event-description" className="input" rows="4" {...register('description', { required: 'A description is required', minLength: { value: 3, message: 'Use at least 3 characters' } })} />{errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}</div>
      <div className="grid gap-4 sm:grid-cols-2"><div><label className="label" htmlFor="event-date">Date</label><input id="event-date" className="input" type="date" {...register('date', { required: 'Choose a date' })} />{errors.date && <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>}</div><div><label className="label" htmlFor="event-time">Time</label><input id="event-time" className="input" type="time" {...register('time', { required: 'Choose a time' })} />{errors.time && <p className="mt-1 text-sm text-red-600">{errors.time.message}</p>}</div></div>
      <div><label className="label" htmlFor="event-location">Location</label><input id="event-location" className="input" {...register('location', { required: 'A location is required', minLength: { value: 2, message: 'Use at least 2 characters' } })} />{errors.location && <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>}</div>
      <div><label className="label" htmlFor="event-image">Image <span className="font-normal text-slate-400">(optional)</span></label><input id="event-image" className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-teal-50 file:px-3 file:py-2 file:font-semibold file:text-teal-800" type="file" accept="image/jpeg,image/png,image/webp,image/gif" {...register('image')} /></div>
      <div className="flex justify-end gap-3 pt-2">{onCancel && <button className="button-secondary" type="button" onClick={onCancel}>Cancel</button>}<button className="button-primary" disabled={isSubmitting}><FiSave />{isSubmitting ? 'Saving...' : event ? 'Save changes' : 'Create event'}</button></div>
    </form>
  );
}
