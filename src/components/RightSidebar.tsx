import { useNavigate } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import './RightSidebar.css';

const AVATAR_FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%2320b2aa'/%3E%3Ctext x='50' y='55' text-anchor='middle' dy='.1em' font-size='40' fill='white' font-family='sans-serif'%3E%F0%9F%91%A4%3C/text%3E%3C/svg%3E";

function isStorageId(url: string | undefined): boolean {
  return !!url && !url.startsWith('http') && !url.startsWith('/') && !url.startsWith('data:') && url !== 'placeholder';
}

interface SuggestedChef {
  _id: Id<'users'>;
  name: string;
  avatar?: string;
  username?: string;
}

function SuggestedChefRow({ chef }: { chef: SuggestedChef }) {
  const navigate = useNavigate();
  const avatarRaw = chef.avatar ?? '';
  const needsResolve = isStorageId(avatarRaw);
  const resolvedUrl = useQuery(
    api.recipes.getStorageUrl,
    needsResolve ? { storageId: avatarRaw as Id<'_storage'> } : 'skip',
  );
  const avatarSrc = needsResolve ? (resolvedUrl || AVATAR_FALLBACK) : (avatarRaw || AVATAR_FALLBACK);

  return (
    <div className="rs-chef-row" onClick={() => navigate(`/chef/${chef._id}`)}>
      <img src={avatarSrc} alt={chef.name} className="rs-chef-avatar" />
      <div className="rs-chef-info">
        <span className="rs-chef-name">{chef.name}</span>
        {chef.username && <span className="rs-chef-sub">@{chef.username}</span>}
      </div>
      <button
        type="button"
        className="rs-follow-btn"
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/chef/${chef._id}`);
        }}
      >
        Follow
      </button>
    </div>
  );
}

function CurrentUserRow() {
  const navigate = useNavigate();
  const user = useQuery(api.users.currentUser);
  const avatarRaw = user?.avatar ?? user?.image ?? '';
  const needsResolve = isStorageId(avatarRaw);
  const resolvedUrl = useQuery(
    api.recipes.getStorageUrl,
    needsResolve ? { storageId: avatarRaw as Id<'_storage'> } : 'skip',
  );
  const avatarSrc = needsResolve ? (resolvedUrl || AVATAR_FALLBACK) : (avatarRaw || AVATAR_FALLBACK);

  if (!user) return null;

  return (
    <div className="rs-profile-row" onClick={() => navigate('/profile')}>
      <img src={avatarSrc} alt={user.name ?? 'You'} className="rs-profile-avatar" />
      <div className="rs-profile-info">
        <span className="rs-profile-name">{user.name ?? 'User'}</span>
        {user.username && <span className="rs-profile-username">@{user.username}</span>}
      </div>
    </div>
  );
}

function RightSidebar() {
  const chefs = useQuery(api.users.getSuggestedChefs) ?? [];

  return (
    <aside className="right-sidebar">
      <CurrentUserRow />

      {chefs.length > 0 && (
        <div className="rs-suggested">
          <div className="rs-suggested-header">
            <span className="rs-suggested-title">Suggested for you</span>
            <span className="rs-suggested-see-all">See all</span>
          </div>
          {chefs.map((chef) => (
            <SuggestedChefRow key={chef._id} chef={chef} />
          ))}
        </div>
      )}

      <footer className="rs-footer">
        <span>About</span>
        <span>Help</span>
        <span>Press</span>
        <span>Terms</span>
        <span>Privacy</span>
      </footer>
    </aside>
  );
}

export default RightSidebar;
