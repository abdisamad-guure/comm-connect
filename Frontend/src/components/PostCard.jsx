import { Link } from 'react-router-dom';
import { FiHeart, FiMessageCircle } from 'react-icons/fi';
import Avatar from './Avatar';
import { formatDate } from '../utils/formatters';
import { getMediaUrl } from '../services/api';

export default function PostCard({ post }) {
  return (
    <article className="surface overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg">
      {post.image && <img className="h-48 w-full object-cover" src={getMediaUrl(post.image)} alt="" />}
      <div className="p-5">
        <div className="mb-4 flex items-center gap-3">
          <Avatar user={post.author} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{post.author?.name || 'Community member'}</p>
            <p className="text-xs text-slate-500">{formatDate(post.createdAt)}</p>
          </div>
        </div>
        <h2 className="text-lg font-bold text-slate-900"><Link className="hover:text-teal-700" to={`/posts/${post._id}`}>{post.title}</Link></h2>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{post.content}</p>
        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-sm text-slate-500">
          <span className="inline-flex items-center gap-1.5"><FiHeart /> {post.likes?.length || 0}</span>
          <span className="inline-flex items-center gap-1.5"><FiMessageCircle /> Discussion</span>
          <Link className="font-semibold text-teal-700 hover:text-teal-800" to={`/posts/${post._id}`}>View post</Link>
        </div>
      </div>
    </article>
  );
}
