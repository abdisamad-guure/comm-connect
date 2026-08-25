import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiSave } from 'react-icons/fi';
import { getErrorMessage } from '../../utils/formatters';





export default function PostForm({ post, onSubmit, onCancel }) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({ defaultValues: { title: post?.title || '', content: post?.content || '' } });
  const [error, setError] = useState('');

  useEffect(() => reset({ title: post?.title || '', content: post?.content || '' }), [post, reset]);

  async function submit(values) {
    setError('');
    const payload = new FormData();
    payload.append('title', values.title.trim());
    payload.append('content', values.content.trim());
    if (values.image?.[0]) payload.append('image', values.image[0]);
    try {
      await onSubmit(payload);
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(submit)} noValidate>
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div><label className="label" htmlFor="post-title">Title</label><input id="post-title" className="input" {...register('title', { required: 'A title is required', minLength: { value: 3, message: 'Use at least 3 characters' }, maxLength: { value: 160, message: 'Use 160 characters or fewer' } })} />{errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}</div>
      <div><label className="label" htmlFor="post-content">What would you like to share?</label><textarea id="post-content" rows="6" className="input resize-y" {...register('content', { required: 'Content is required', minLength: { value: 3, message: 'Use at least 3 characters' }, maxLength: { value: 10000, message: 'Your post is too long' } })} />{errors.content && <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>}</div>
      <div><label className="label" htmlFor="post-image">Image <span className="font-normal text-slate-400">(optional)</span></label><input id="post-image" className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-teal-50 file:px-3 file:py-2 file:font-semibold file:text-teal-800" type="file" accept="image/jpeg,image/png,image/webp,image/gif" {...register('image')} /></div>
      <div className="flex justify-end gap-3 pt-2">{onCancel && <button className="button-secondary" type="button" onClick={onCancel}>Cancel</button>}<button className="button-primary" disabled={isSubmitting}><FiSave />{isSubmitting ? 'Saving...' : post ? 'Save changes' : 'Publish post'}</button></div>
    </form>
  );
}
