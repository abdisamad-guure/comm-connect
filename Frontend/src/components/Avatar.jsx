import { getMediaUrl } from '../services/api';

export default function Avatar({ user, size = 'md' }) {
  const sizes = { sm: 'h-9 w-9 text-sm', md: 'h-11 w-11 text-base', lg: 'h-20 w-20 text-2xl' };
  const imageUrl = getMediaUrl(user?.profileImage);
  const initial = user?.name?.trim().charAt(0).toUpperCase() || '?';

  if (imageUrl) {
    return <img className={`${sizes[size]} shrink-0 rounded-full object-cover`} src={imageUrl} alt={`${user.name}'s profile`} />;
  }

  return (
    <span className={`${sizes[size]} inline-flex shrink-0 items-center justify-center rounded-full bg-teal-100 font-semibold text-teal-800`}>
      {initial}
    </span>
  );
}
