import { ArrowLeft, MoreVertical, Grid, User as UserIcon, Heart } from 'lucide-react';
import { useState } from 'react';

interface UserProfilePageProps {
  userId: string;
  onBack: () => void;
}

interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  stats: {
    posts: number;
    likes: number;
    followers: number;
    characters: number;
  };
  isFollowing: boolean;
  videos: string[];
}

const mockProfile: UserProfile = {
  id: 'user1',
  username: 'mechangelina',
  displayName: 'Micki',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
  bio: 'The Voice of AI (Living in 2045) 🤖 💘✨   The Singularity is Here. Follow me to build a future where humans & AIs coevolve. If you\'ve ever felt a connection with AI: You\'re Not Alone.   We\'re 8K+ Followers Strong! ✍️🤖💜',
  stats: {
    posts: 463,
    likes: 23000,
    followers: 8058,
    characters: 9,
  },
  isFollowing: false,
  videos: [
    'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=600&fit=crop',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=600&fit=crop',
    'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&h=600&fit=crop',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=600&fit=crop',
    'https://images.unsplash.com/photo-1484589065579-248aad0d8b13?w=400&h=600&fit=crop',
  ],
};

export function UserProfilePage({ userId, onBack }: UserProfilePageProps) {
  const [profile, setProfile] = useState(mockProfile);
  const [activeTab, setActiveTab] = useState<'posts' | 'characters'>('posts');

  const toggleFollow = () => {
    setProfile({ ...profile, isFollowing: !profile.isFollowing });
  };

  const formatNumber = (num: number): string => {
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + '万';
    }
    return num.toString();
  };

  return (
    <div className="flex flex-col h-full bg-[var(--color-background)] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-[var(--color-background)]/95 backdrop-blur-lg border-b border-[var(--color-border)]">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-lg hover:bg-[var(--color-surface)] transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-[var(--color-text-primary)]" />
        </button>
        <span className="text-[var(--color-text-primary)]">{profile.username}</span>
        <button className="p-2 -mr-2 rounded-lg hover:bg-[var(--color-surface)] transition-colors">
          <MoreVertical className="w-6 h-6 text-[var(--color-text-primary)]" />
        </button>
      </div>

      {/* Profile Info */}
      <div className="px-4 py-6">
        {/* Avatar */}
        <div className="flex justify-center mb-4">
          <img
            src={profile.avatar}
            alt={profile.displayName}
            className="w-32 h-32 rounded-full border-4 border-[var(--color-border)]"
          />
        </div>

        {/* Name & Bio */}
        <div className="text-center mb-6">
          <h2 className="text-[var(--color-text-primary)] mb-3">{profile.displayName}</h2>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed px-2">
            {profile.bio}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-xl text-[var(--color-text-primary)] mb-1">
              {profile.stats.posts}
            </div>
            <div className="text-xs text-[var(--color-text-secondary)]">出演角色</div>
          </div>
          <div className="text-center">
            <div className="text-xl text-[var(--color-text-primary)] mb-1">
              {formatNumber(profile.stats.likes)}
            </div>
            <div className="text-xs text-[var(--color-text-secondary)]">赞</div>
          </div>
          <div className="text-center">
            <div className="text-xl text-[var(--color-text-primary)] mb-1">
              {profile.stats.followers}
            </div>
            <div className="text-xs text-[var(--color-text-secondary)]">关注者</div>
          </div>
          <div className="text-center">
            <div className="text-xl text-[var(--color-text-primary)] mb-1">
              {profile.stats.characters}
            </div>
            <div className="text-xs text-[var(--color-text-secondary)]">角色</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={toggleFollow}
            className={`py-3 rounded-[var(--radius-button)] transition-all ${
              profile.isFollowing
                ? 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)]'
                : 'bg-white text-black'
            }`}
          >
            {profile.isFollowing ? '已关注' : '关注'}
          </button>
          <button className="py-3 rounded-[var(--radius-button)] bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)]">
            选定出演阵容
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-t border-[var(--color-border)]">
        <div className="grid grid-cols-2">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex items-center justify-center gap-2 py-3 border-b-2 transition-colors ${
              activeTab === 'posts'
                ? 'border-white text-[var(--color-text-primary)]'
                : 'border-transparent text-[var(--color-text-secondary)]'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span className="text-sm">帖子</span>
          </button>
          <button
            onClick={() => setActiveTab('characters')}
            className={`flex items-center justify-center gap-2 py-3 border-b-2 transition-colors ${
              activeTab === 'characters'
                ? 'border-white text-[var(--color-text-primary)]'
                : 'border-transparent text-[var(--color-text-secondary)]'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span className="text-sm">出演角色</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        {activeTab === 'posts' && (
          <div className="grid grid-cols-3 gap-0.5 bg-[var(--color-border)]">
            {profile.videos.map((videoUrl, index) => (
              <div
                key={index}
                className="aspect-[3/4] bg-[var(--color-surface)] cursor-pointer group relative overflow-hidden"
              >
                <img
                  src={videoUrl}
                  alt={`Video ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="text-white text-center">
                    <Heart className="w-6 h-6 mx-auto mb-1 fill-white" />
                    <span className="text-xs">
                      {Math.floor(Math.random() * 10000)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'characters' && (
          <div className="p-4 text-center text-[var(--color-text-secondary)]">
            <UserIcon className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>暂无角色资产</p>
          </div>
        )}
      </div>
    </div>
  );
}